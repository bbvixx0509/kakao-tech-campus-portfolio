import fs from "node:fs";
import path from "node:path";
import type { ResolvedPersonalAssistantConfig } from "./config.js";
import { readNotionApiKey } from "./config.js";
import { buildNotionBlocks, notionTitleProperty } from "./notion-layout.js";
import type { NotionAttachment, NotionPublishRequest, NotionPublishResult } from "./types.js";

const NOTION_CHILD_BLOCK_LIMIT = 100;

interface NotionPageResponse {
  id: string;
  url: string;
}

interface NotionErrorPayload {
  code?: string;
  message?: string;
  request_id?: string;
}

interface NotionFileUploadResponse {
  id: string;
  upload_url: string;
}

export async function publishToNotion(
  cfg: ResolvedPersonalAssistantConfig,
  request: NotionPublishRequest,
): Promise<NotionPublishResult> {
  const apiKey = readNotionApiKey(cfg);
  const notionVersion = cfg.notion?.notionVersion ?? "2025-09-03";
  const parentPageId = request.parentPageId ?? cfg.notion?.parentPageId;
  const blocks = buildNotionBlocks(request);
  const initialBlocks = blocks.slice(0, NOTION_CHILD_BLOCK_LIMIT);
  const remainingBlocks = blocks.slice(NOTION_CHILD_BLOCK_LIMIT);

  if (!parentPageId) {
    throw new Error(
      "No Notion parent page configured. Set plugins.entries.personal-assistant.config.notion.parentPageId or pass parentPageId to notion_publish.",
    );
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": notionVersion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: {
        page_id: parentPageId,
      },
      icon: request.icon
        ? {
            emoji: request.icon,
          }
        : undefined,
      properties: {
        title: notionTitleProperty(request.title),
      },
      children: initialBlocks,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      formatNotionApiError({
        status: response.status,
        body,
        parentPageId,
      }),
    );
  }

  const payload = (await response.json()) as NotionPageResponse;
  if (remainingBlocks.length) {
    await appendBlockChildren(apiKey, notionVersion, payload.id, remainingBlocks);
  }
  let uploadedAttachmentCount = 0;
  if (request.attachments?.length) {
    const uploads = await uploadAttachmentsToNotion(apiKey, notionVersion, request.attachments);
    if (uploads.length) {
      await appendAttachmentBlocks(apiKey, notionVersion, payload.id, uploads);
      const coverUpload = uploads.find((upload) => upload.useAsCover);
      if (coverUpload) {
        await setPageCover(apiKey, notionVersion, payload.id, coverUpload.id);
      }
      uploadedAttachmentCount = uploads.length;
    }
  }
  return {
    pageId: payload.id,
    url: payload.url,
    uploadedAttachmentCount,
  };
}

export function formatNotionApiError(params: {
  status: number;
  body: string;
  parentPageId: string;
}): string {
  const parsed = parseNotionErrorPayload(params.body);
  const code = parsed?.code?.trim();
  const message = parsed?.message?.trim() || truncateBodyPreview(params.body);
  const hints: string[] = [];

  if (params.status === 401 || code === "unauthorized") {
    hints.push("Check NOTION_API_KEY or notion.apiKeyEnv.");
  }
  if (params.status === 403 || code === "restricted_resource") {
    hints.push(`Share parent page ${params.parentPageId} with the Notion integration.`);
  }
  if (params.status === 404 || code === "object_not_found") {
    hints.push(
      `Confirm parentPageId ${params.parentPageId} exists and is shared with the integration.`,
    );
  }
  if (params.status === 400 || code === "validation_error") {
    hints.push("Check the requested template content and parent page id.");
  }
  if (parsed?.request_id?.trim()) {
    hints.push(`Request id: ${parsed.request_id.trim()}.`);
  }

  const statusLabel = code ? `${params.status} ${code}` : `${params.status}`;
  return [
    `Notion page creation failed (${statusLabel}): ${message}.`,
    `Parent page: ${params.parentPageId}.`,
    hints.join(" "),
  ]
    .filter((part) => part && part.trim().length > 0)
    .join(" ");
}

function parseNotionErrorPayload(body: string): NotionErrorPayload | null {
  try {
    const parsed = JSON.parse(body) as NotionErrorPayload;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function truncateBodyPreview(body: string): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length <= 280) {
    return normalized;
  }
  return `${normalized.slice(0, 277)}...`;
}

async function uploadAttachmentsToNotion(
  apiKey: string,
  notionVersion: string,
  attachments: NotionAttachment[],
): Promise<Array<NotionAttachment & { id: string }>> {
  const uploads: Array<NotionAttachment & { id: string }> = [];
  for (const attachment of attachments) {
    const fileUpload = await createFileUpload(apiKey, notionVersion);
    await sendFileUpload(apiKey, notionVersion, fileUpload.upload_url, attachment.filePath);
    uploads.push({ ...attachment, id: fileUpload.id });
  }
  return uploads;
}

async function createFileUpload(
  apiKey: string,
  notionVersion: string,
): Promise<NotionFileUploadResponse> {
  const response = await fetch("https://api.notion.com/v1/file_uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": notionVersion,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!response.ok) {
    throw new Error(`Failed to create Notion file upload: ${await response.text()}`);
  }
  return (await response.json()) as NotionFileUploadResponse;
}

async function sendFileUpload(
  apiKey: string,
  notionVersion: string,
  uploadUrl: string,
  filePath: string,
): Promise<void> {
  const form = new FormData();
  const blob = new Blob([fs.readFileSync(filePath)], {
    type: guessContentType(filePath),
  });
  form.append("file", blob, path.basename(filePath));
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": notionVersion,
    },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Failed to upload file contents to Notion: ${await response.text()}`);
  }
}

async function appendAttachmentBlocks(
  apiKey: string,
  notionVersion: string,
  pageId: string,
  uploads: Array<NotionAttachment & { id: string }>,
): Promise<void> {
  const children = uploads.map((upload) => buildAttachmentBlock(upload));
  await appendBlockChildren(apiKey, notionVersion, pageId, children);
}

async function appendBlockChildren(
  apiKey: string,
  notionVersion: string,
  pageId: string,
  children: unknown[],
): Promise<void> {
  for (const chunk of chunkArray(children, NOTION_CHILD_BLOCK_LIMIT)) {
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": notionVersion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ children: chunk }),
    });
    if (!response.ok) {
      throw new Error(`Failed to append Notion blocks: ${await response.text()}`);
    }
  }
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function setPageCover(
  apiKey: string,
  notionVersion: string,
  pageId: string,
  fileUploadId: string,
): Promise<void> {
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": notionVersion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cover: {
        type: "file_upload",
        file_upload: {
          id: fileUploadId,
        },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to set Notion page cover: ${await response.text()}`);
  }
}

function buildAttachmentBlock(upload: NotionAttachment & { id: string }) {
  if (upload.type === "pdf") {
    return {
      object: "block" as const,
      type: "pdf" as const,
      pdf: {
        type: "file_upload" as const,
        file_upload: {
          id: upload.id,
        },
        caption: upload.caption
          ? [
              {
                type: "text" as const,
                text: { content: upload.caption },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default" as const,
                },
                plain_text: upload.caption,
                href: null,
              },
            ]
          : [],
      },
    };
  }

  return {
    object: "block" as const,
    type: "image" as const,
    image: {
      type: "file_upload" as const,
      file_upload: {
        id: upload.id,
      },
      caption: upload.caption
        ? [
            {
              type: "text" as const,
              text: { content: upload.caption },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default" as const,
              },
              plain_text: upload.caption,
              href: null,
            },
          ]
        : [],
    },
  };
}

function guessContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
