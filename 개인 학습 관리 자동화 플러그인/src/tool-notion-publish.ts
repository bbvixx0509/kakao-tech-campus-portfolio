import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import { resolvePersonalAssistantConfig } from "./config.js";
import { publishToNotion } from "./notion-api.js";
import { jsonToolResult } from "./tool-result.js";
import type { NotionPublishRequest } from "./types.js";

const NotionPublishSchema = Type.Object(
  {
    title: Type.String({
      description: "The title of the Notion page to create.",
    }),
    content: Type.String({
      description: "Main free-form body text to place into the page.",
    }),
    template: Type.Optional(
      Type.Union([Type.Literal("note"), Type.Literal("assignment"), Type.Literal("lecture")]),
    ),
    parentPageId: Type.Optional(
      Type.String({
        description: "Optional override for the target Notion parent page.",
      }),
    ),
    icon: Type.Optional(
      Type.String({
        description: "Optional emoji icon for the page, for example 📘 or 📊.",
      }),
    ),
    bullets: Type.Optional(
      Type.Array(Type.String(), {
        description: "Optional bullet or checklist lines to include in the layout.",
      }),
    ),
    sourceUrl: Type.Optional(
      Type.String({
        description: "Optional source URL to include near the bottom of the page.",
      }),
    ),
  },
  { additionalProperties: false },
);

export function createNotionPublishTool(api: OpenClawPluginApi) {
  return {
    name: "notion_publish",
    label: "Notion Study Page Publish",
    description:
      "Create a structured Notion page under the configured parent page using note, assignment, or lecture formatting.",
    parameters: NotionPublishSchema,
    execute: async (_toolCallId: string, params: Record<string, unknown>) => {
      const cfg = resolvePersonalAssistantConfig(api.config);
      const request = buildRequest(params);
      const result = await publishToNotion(cfg, request);
      return jsonToolResult({
        ok: true,
        request,
        result,
      });
    },
  };
}

function buildRequest(params: Record<string, unknown>): NotionPublishRequest {
  if (typeof params.title !== "string" || !params.title.trim()) {
    throw new Error("notion_publish requires a non-empty title.");
  }
  if (typeof params.content !== "string" || !params.content.trim()) {
    throw new Error("notion_publish requires non-empty content.");
  }

  const template =
    params.template === "assignment" || params.template === "lecture" || params.template === "note"
      ? params.template
      : "note";

  return {
    title: params.title.trim(),
    content: params.content.trim(),
    template,
    parentPageId: typeof params.parentPageId === "string" ? params.parentPageId.trim() : undefined,
    icon: typeof params.icon === "string" ? params.icon.trim() : undefined,
    bullets: Array.isArray(params.bullets)
      ? params.bullets.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : undefined,
    sourceUrl: typeof params.sourceUrl === "string" ? params.sourceUrl.trim() : undefined,
  };
}
