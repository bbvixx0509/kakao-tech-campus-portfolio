import path from "node:path";
import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import { defaultReportTemplate, resolvePersonalAssistantConfig } from "./config.js";
import {
  buildStudyMaterialCollectionNotionContent,
  buildStudyMaterialNotionContent,
  detectStudyMaterialKind,
  ingestStudyMaterials,
  summarizeStudyMaterials,
} from "./file-ingest.js";
import { publishToNotion } from "./notion-api.js";
import { buildStudyMaterialTelegramText } from "./telegram-format.js";
import { jsonToolResult } from "./tool-result.js";
import type { NotionPublishRequest, NotionPublishTemplate, StudyMaterialIngestResult } from "./types.js";

const StudyMaterialIngestSchema = Type.Object(
  {
    filePath: Type.Optional(
      Type.String({
        description: "Path to one local PDF, TXT, HWP, Markdown, JSON, or CSV study file.",
      }),
    ),
    filePaths: Type.Optional(
      Type.Array(Type.String(), {
        minItems: 1,
        description:
          "Optional list of local file paths when you want to ingest multiple study files at once.",
      }),
    ),
    title: Type.Optional(
      Type.String({
        description: "Optional title override for the generated summary or Notion page.",
      }),
    ),
    publishToNotion: Type.Optional(
      Type.Boolean({
        description: "When true, publish the extracted material summary to Notion.",
      }),
    ),
    parentPageId: Type.Optional(
      Type.String({
        description: "Optional Notion parent page override used only when publishToNotion is true.",
      }),
    ),
    template: Type.Optional(
      Type.Union([Type.Literal("note"), Type.Literal("assignment"), Type.Literal("lecture")]),
    ),
  },
  { additionalProperties: false },
);

export function createStudyMaterialIngestTool(api: OpenClawPluginApi) {
  return {
    name: "study_material_ingest",
    label: "Study Material Organizer",
    description:
      "Extract text and metadata from local study files such as PDF, TXT, HWP, Markdown, JSON, and CSV, then optionally publish a structured summary to Notion.",
    parameters: StudyMaterialIngestSchema,
    execute: async (_toolCallId: string, params: Record<string, unknown>) => {
      const cfg = resolvePersonalAssistantConfig(api.config);
      const filePaths = resolveFilePaths(params);
      const results = await ingestStudyMaterials(cfg, filePaths);
      const summaryText = summarizeStudyMaterials(results);
      const result = results.length === 1 ? results[0] : null;

      let notionRequest: NotionPublishRequest | null = null;
      let notionResult: unknown = null;
      if (params.publishToNotion === true) {
        notionRequest = {
          title: resolveTitle(params.title, results),
          content:
            results.length === 1
              ? buildStudyMaterialNotionContent(results[0])
              : buildStudyMaterialCollectionNotionContent(results),
          template: resolveTemplate(params.template, detectStudyMaterialTemplate(results, cfg)),
          icon: resolveIcon(results),
          attachments: results.flatMap((item) => item.notionAttachments),
          parentPageId:
            typeof params.parentPageId === "string" && params.parentPageId.trim()
              ? params.parentPageId.trim()
              : undefined,
          bullets:
            results.length === 1
              ? results[0].summaryBullets
              : buildCollectionBullets(results, summaryText),
        };
        notionResult = await publishToNotion(cfg, notionRequest);
      }

      const notionUrl = readNotionUrl(notionResult);
      const telegramText = buildStudyMaterialTelegramText({
        results,
        notionUrl,
      });

      return jsonToolResult({
        ok: true,
        fileCount: results.length,
        summaryText,
        telegramText,
        result,
        results,
        notionRequest,
        notionResult,
      });
    },
  };
}

function resolveFilePaths(params: Record<string, unknown>): string[] {
  const values: string[] = [];
  if (typeof params.filePath === "string" && params.filePath.trim()) {
    values.push(params.filePath.trim());
  }
  if (Array.isArray(params.filePaths)) {
    for (const value of params.filePaths) {
      if (typeof value === "string" && value.trim()) {
        values.push(value.trim());
      }
    }
  }
  if (values.length < 1) {
    throw new Error("study_material_ingest requires filePath or filePaths.");
  }
  return values;
}

function resolveTitle(value: unknown, results: StudyMaterialIngestResult[]): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (results.length === 1) {
    return path.parse(results[0].metadata.fileName).name;
  }
  return `Study materials (${results.length} files)`;
}

function detectStudyMaterialTemplate(
  results: StudyMaterialIngestResult[],
  cfg: ReturnType<typeof resolvePersonalAssistantConfig>,
): NotionPublishTemplate {
  const hasLectureStyleMaterial = results.some((result) => {
    const kind = detectStudyMaterialKind(result.metadata.fileName);
    return kind === "pdf" || kind === "hwp";
  });
  if (hasLectureStyleMaterial) {
    return "lecture";
  }
  return defaultReportTemplate(cfg);
}

function resolveTemplate(
  value: unknown,
  fallback: NotionPublishTemplate,
): NotionPublishTemplate {
  return value === "assignment" || value === "lecture" || value === "note" ? value : fallback;
}

function readNotionUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = (value as { url?: unknown }).url;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

function resolveIcon(results: StudyMaterialIngestResult[]): string {
  if (results.length > 1) {
    return "\u{1F5C2}\u{FE0F}";
  }
  switch (results[0]?.metadata.kind) {
    case "pdf":
      return "\u{1F4D5}";
    case "hwp":
      return "\u{1F4D8}";
    case "markdown":
    case "text":
      return "\u{1F4DD}";
    case "json":
    case "csv":
      return "\u{1F4CA}";
    default:
      return "\u{1F4CE}";
  }
}

function buildCollectionBullets(
  results: StudyMaterialIngestResult[],
  fallbackSummary: string,
): string[] {
  const bullets = results.flatMap((result) => result.summaryBullets.slice(0, 2));
  if (bullets.length > 0) {
    return bullets.slice(0, 6);
  }
  return [fallbackSummary];
}
