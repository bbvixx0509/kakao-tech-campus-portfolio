import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import {
  defaultReportTemplate,
  loadSchoolPortalConfig,
  resolvePersonalAssistantConfig,
} from "./config.js";
import { buildMorningReport, filterPendingSnapshot } from "./morning-report.js";
import { publishToNotion } from "./notion-api.js";
import { buildMorningReportTelegramText } from "./telegram-format.js";
import { SchoolPortalClient } from "./school-portal.js";
import { PersonalAssistantStateDb } from "./state-db.js";
import { jsonToolResult } from "./tool-result.js";
import type { NotionPublishRequest, NotionPublishTemplate } from "./types.js";

const MorningReportSchema = Type.Object(
  {
    assignmentLimit: Type.Optional(
      Type.Number({
        minimum: 1,
        description: "Maximum number of assignment lines to include in the output.",
      }),
    ),
    videoLimit: Type.Optional(
      Type.Number({
        minimum: 1,
        description: "Maximum number of lecture lines to include in the output.",
      }),
    ),
    daysAhead: Type.Optional(
      Type.Number({
        minimum: 1,
        description:
          "Focus the report on overdue items plus items due within this many days. Defaults to 4.",
      }),
    ),
    publishToNotion: Type.Optional(
      Type.Boolean({
        description: "When true, also save the daily report as a Notion page.",
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

export function createMorningReportTool(api: OpenClawPluginApi) {
  return {
    name: "morning_report",
    label: "Daily Study Report",
    description:
      "Refresh the campus snapshot, focus on overdue items and the next few days of deadlines, and return a ready-to-send daily study report with optional Notion publishing.",
    parameters: MorningReportSchema,
    execute: async (_toolCallId: string, params: Record<string, unknown>) => {
      const cfg = resolvePersonalAssistantConfig(api.config);
      const portalConfig = loadSchoolPortalConfig(cfg.schoolPortalConfigPath);
      const db = new PersonalAssistantStateDb(cfg.storagePath);

      try {
        const client = new SchoolPortalClient(cfg, portalConfig);
        const fullSnapshot = await client.syncPortalSnapshot();
        db.upsertSnapshot(fullSnapshot);
        const snapshot = filterPendingSnapshot(fullSnapshot);

        const report = buildMorningReport({
          snapshot,
          timezone: cfg.timezone,
          assignmentLimit: coerceCount(params.assignmentLimit, cfg.reports?.assignmentLimit ?? 5),
          videoLimit: coerceCount(params.videoLimit, cfg.reports?.videoLimit ?? 5),
          daysAhead: coerceCount(params.daysAhead, cfg.reports?.daysAhead ?? 4),
        });

        let notionRequest: NotionPublishRequest | null = null;
        let notionResult: unknown = null;
        if (params.publishToNotion === true) {
          notionRequest = {
            title: report.title,
            content: report.notionContent,
            template: resolveTemplate(params.template, defaultReportTemplate(cfg)),
            parentPageId:
              typeof params.parentPageId === "string" && params.parentPageId.trim()
                ? params.parentPageId.trim()
                : cfg.reports?.notionParentPageId,
            bullets: report.bullets,
          };
          notionResult = await publishToNotion(cfg, notionRequest);
        }

        const notionUrl = readNotionUrl(notionResult);
        const telegramText = buildMorningReportTelegramText({
          report,
          syncedAt: snapshot.syncedAt,
          notionUrl,
        });

        return jsonToolResult({
          ok: true,
          syncedAt: snapshot.syncedAt,
          text: report.text,
          telegramText,
          bullets: report.bullets,
          daysAhead: report.daysAhead,
          assignmentTotal: report.assignmentTotal,
          videoTotal: report.videoTotal,
          assignments: report.assignments,
          videos: report.videos,
          backlogAssignments: report.backlogAssignments,
          backlogVideos: report.backlogVideos,
          notionRequest,
          notionResult,
        });
      } finally {
        db.close();
      }
    },
  };
}

function resolveTemplate(
  value: unknown,
  fallback: NotionPublishTemplate,
): NotionPublishTemplate {
  return value === "assignment" || value === "lecture" || value === "note" ? value : fallback;
}

function coerceCount(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}

function readNotionUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = (value as { url?: unknown }).url;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}
