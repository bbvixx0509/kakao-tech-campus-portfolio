import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import { loadSchoolPortalConfig, resolvePersonalAssistantConfig } from "./config.js";
import { buildPortalSummary, SchoolPortalClient } from "./school-portal.js";
import { PersonalAssistantStateDb } from "./state-db.js";
import { jsonToolResult } from "./tool-result.js";

const CampusSyncSchema = Type.Object(
  {
    includeCompleted: Type.Optional(
      Type.Boolean({
        description: "Include completed items in the returned payload.",
      }),
    ),
  },
  { additionalProperties: false },
);

export function createCampusSyncTool(api: OpenClawPluginApi) {
  return {
    name: "campus_sync",
    label: "Campus Deadline Sync",
    description:
      "Visit the configured school portal, collect assignment and lecture items, persist the latest snapshot locally, and return a concise summary.",
    parameters: CampusSyncSchema,
    execute: async (_toolCallId: string, params: Record<string, unknown>) => {
      const resolved = resolvePersonalAssistantConfig(api.config);
      const portalConfig = loadSchoolPortalConfig(resolved.schoolPortalConfigPath);
      const db = new PersonalAssistantStateDb(resolved.storagePath);

      try {
        const client = new SchoolPortalClient(resolved, portalConfig);
        const snapshot = await client.syncPortalSnapshot();
        db.upsertSnapshot(snapshot);

        const includeCompleted = params.includeCompleted === true;
        const filtered = {
          ...snapshot,
          assignments: includeCompleted
            ? snapshot.assignments
            : snapshot.assignments.filter((item) => !isCompleted(item.status)),
          videos: includeCompleted
            ? snapshot.videos
            : snapshot.videos.filter((item) => !isCompleted(item.status ?? item.progressText)),
        };

        return jsonToolResult({
          ok: true,
          dbPath: db.getPath(),
          syncedAt: snapshot.syncedAt,
          summaryText: buildPortalSummary(filtered),
          telegramText: buildPortalSummary(filtered),
          assignments: filtered.assignments,
          videos: filtered.videos,
        });
      } finally {
        db.close();
      }
    },
  };
}

function isCompleted(input: string | null | undefined): boolean {
  if (!input) {
    return false;
  }
  const normalized = input.toLowerCase();
  return (
    normalized.includes("complete") ||
    normalized.includes("completed") ||
    normalized.includes("100%") ||
    input.includes("완료")
  );
}
