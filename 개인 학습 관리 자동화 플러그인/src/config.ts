import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Type, type Static } from "@sinclair/typebox";
import type { NotionPublishTemplate } from "./types.js";

const SelectorValueSchema = Type.Union([Type.String(), Type.Array(Type.String())]);

const PortalSourceSchema = Type.Object(
  {
    pageUrl: Type.String(),
    courseNameOverride: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

const PortalListSchema = Type.Object(
  {
    pageUrl: Type.Optional(Type.String()),
    pageUrls: Type.Optional(Type.Array(Type.String())),
    sources: Type.Optional(Type.Array(PortalSourceSchema)),
    includePattern: Type.Optional(Type.String()),
    excludePattern: Type.Optional(Type.String()),
    card: Type.String(),
    title: Type.String(),
    course: Type.Optional(Type.String()),
    dueText: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    detailLink: Type.Optional(Type.String()),
    submitType: Type.Optional(Type.String()),
    progressText: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

const BrowserSchema = Type.Object(
  {
    userDataDir: Type.Optional(Type.String()),
    launchArgs: Type.Optional(Type.Array(Type.String())),
    channel: Type.Optional(Type.String()),
    executablePath: Type.Optional(Type.String()),
    headless: Type.Optional(Type.Boolean()),
    slowMoMs: Type.Optional(Type.Number({ minimum: 0 })),
  },
  { additionalProperties: false },
);

const UploadTranscriptionSchema = Type.Object(
  {
    apiKey: Type.Optional(Type.String()),
    apiKeyEnv: Type.Optional(Type.String()),
    baseUrl: Type.Optional(Type.String()),
    model: Type.Optional(Type.String()),
    language: Type.Optional(Type.String()),
    prompt: Type.Optional(Type.String()),
    timeoutMs: Type.Optional(Type.Number({ minimum: 1_000 })),
  },
  { additionalProperties: false },
);

const UploadAiSummarySchema = Type.Object(
  {
    model: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    maxInputCharacters: Type.Optional(Type.Number({ minimum: 500 })),
  },
  { additionalProperties: false },
);

const UploadsSchema = Type.Object(
  {
    maxExtractedCharacters: Type.Optional(Type.Number({ minimum: 500 })),
    transcription: Type.Optional(UploadTranscriptionSchema),
    aiSummary: Type.Optional(UploadAiSummarySchema),
  },
  { additionalProperties: false },
);

const ReportsSchema = Type.Object(
  {
    daysAhead: Type.Optional(Type.Number({ minimum: 1 })),
    assignmentLimit: Type.Optional(Type.Number({ minimum: 1 })),
    videoLimit: Type.Optional(Type.Number({ minimum: 1 })),
    defaultNotionTemplate: Type.Optional(
      Type.Union([Type.Literal("note"), Type.Literal("assignment"), Type.Literal("lecture")]),
    ),
    notionParentPageId: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

const MorningReportAutomationSchema = Type.Object(
  {
    enabled: Type.Optional(Type.Boolean()),
    name: Type.Optional(Type.String()),
    cron: Type.Optional(Type.String()),
    timezone: Type.Optional(Type.String()),
    channel: Type.Optional(Type.String()),
    to: Type.Optional(Type.String()),
    bestEffort: Type.Optional(Type.Boolean()),
    publishToNotion: Type.Optional(Type.Boolean()),
    parentPageId: Type.Optional(Type.String()),
    daysAhead: Type.Optional(Type.Number({ minimum: 1 })),
    assignmentLimit: Type.Optional(Type.Number({ minimum: 1 })),
    videoLimit: Type.Optional(Type.Number({ minimum: 1 })),
    model: Type.Optional(Type.String()),
    thinking: Type.Optional(Type.String()),
    lightContext: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

const AutomationSchema = Type.Object(
  {
    morningReport: Type.Optional(MorningReportAutomationSchema),
  },
  { additionalProperties: false },
);

export const PersonalAssistantConfigSchema = Type.Object(
  {
    timezone: Type.Optional(Type.String()),
    storagePath: Type.Optional(Type.String()),
    schoolPortalConfigPath: Type.String(),
    debugOutputDir: Type.Optional(Type.String()),
    notion: Type.Optional(
      Type.Object(
        {
          apiKey: Type.Optional(Type.String()),
          apiKeyEnv: Type.Optional(Type.String()),
          parentPageId: Type.Optional(Type.String()),
          notionVersion: Type.Optional(Type.String()),
        },
        { additionalProperties: false },
      ),
    ),
    reports: Type.Optional(ReportsSchema),
    uploads: Type.Optional(UploadsSchema),
    automation: Type.Optional(AutomationSchema),
  },
  { additionalProperties: false },
);

export type PersonalAssistantConfig = Static<typeof PersonalAssistantConfigSchema>;

export interface SchoolPortalConfig {
  loginUrl: string;
  readySelector: string;
  loginSubmitSelector?: string;
  postLoginShortcutSelector?: Static<typeof SelectorValueSchema>;
  postLoginLandingUrl?: string;
  browser?: Static<typeof BrowserSchema>;
  assignments: Static<typeof PortalListSchema>;
  videos: Static<typeof PortalListSchema>;
}

export interface ResolvedPersonalAssistantConfig extends PersonalAssistantConfig {
  timezone: string;
  storagePath: string;
  debugOutputDir: string;
  schoolPortalConfigPath: string;
}

export function resolveUserPath(rawPath: string): string {
  if (rawPath.startsWith("~/")) {
    return path.join(os.homedir(), rawPath.slice(2));
  }
  return rawPath;
}

export function ensureDirectoryExists(dirPath: string): string {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

export function readPluginConfig(cfg: unknown): PersonalAssistantConfig {
  const root = (cfg ?? {}) as {
    plugins?: {
      entries?: Record<string, { config?: PersonalAssistantConfig }>;
    };
  };
  return root.plugins?.entries?.["study-workflow-assistant"]?.config ?? {
    schoolPortalConfigPath: "",
  };
}

export function resolvePersonalAssistantConfig(cfg: unknown): ResolvedPersonalAssistantConfig {
  const pluginConfig = readPluginConfig(cfg);
  if (!pluginConfig.schoolPortalConfigPath) {
    throw new Error(
      "study-workflow-assistant config is missing schoolPortalConfigPath. Set plugins.entries.study-workflow-assistant.config.schoolPortalConfigPath in your OpenClaw config.",
    );
  }

  const timezone = pluginConfig.timezone ?? "Asia/Seoul";
  const storagePath = resolveUserPath(
    pluginConfig.storagePath ?? "~/.openclaw/study-workflow-assistant/assistant.db",
  );
  const debugOutputDir = resolveUserPath(
    pluginConfig.debugOutputDir ?? "~/.openclaw/study-workflow-assistant/debug",
  );
  const schoolPortalConfigPath = resolveUserPath(pluginConfig.schoolPortalConfigPath);

  ensureDirectoryExists(path.dirname(storagePath));
  ensureDirectoryExists(debugOutputDir);

  return {
    ...pluginConfig,
    timezone,
    storagePath,
    debugOutputDir,
    schoolPortalConfigPath,
  };
}

export function loadSchoolPortalConfig(filePath: string): SchoolPortalConfig {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as SchoolPortalConfig;
  if (!parsed.loginUrl || !parsed.readySelector) {
    throw new Error(
      `Invalid school portal config at ${filePath}. loginUrl and readySelector are required.`,
    );
  }
  if (!parsed.assignments?.card || !parsed.videos?.card) {
    throw new Error(
      `Invalid school portal config at ${filePath}. assignments.card and videos.card are required.`,
    );
  }
  if (!hasPortalListSource(parsed.assignments) || !hasPortalListSource(parsed.videos)) {
    throw new Error(
      `Invalid school portal config at ${filePath}. Each of assignments/videos needs pageUrl, pageUrls, or sources.`,
    );
  }
  return parsed;
}

export function readNotionApiKey(cfg: ResolvedPersonalAssistantConfig): string {
  return readRequiredSecret({
    direct: cfg.notion?.apiKey,
    envName: cfg.notion?.apiKeyEnv,
    defaultEnvName: "NOTION_API_KEY",
    label:
      "Notion API key. Set plugins.entries.study-workflow-assistant.config.notion.apiKey or the NOTION_API_KEY environment variable.",
  });
}

export function readTranscriptionApiKey(cfg: ResolvedPersonalAssistantConfig): string {
  return readRequiredSecret({
    direct: cfg.uploads?.transcription?.apiKey,
    envName: cfg.uploads?.transcription?.apiKeyEnv,
    defaultEnvName: "OPENAI_API_KEY",
    label:
      "audio transcription API key. Set plugins.entries.study-workflow-assistant.config.uploads.transcription.apiKey or the OPENAI_API_KEY environment variable.",
  });
}

export function readAiSummaryRegion(cfg: ResolvedPersonalAssistantConfig): string {
  return (
    cfg.uploads?.aiSummary?.region?.trim() ||
    process.env.AWS_REGION?.trim() ||
    process.env.AWS_DEFAULT_REGION?.trim() ||
    "ap-southeast-2"
  );
}

export function defaultReportTemplate(
  cfg: ResolvedPersonalAssistantConfig,
): NotionPublishTemplate {
  return cfg.reports?.defaultNotionTemplate ?? "note";
}

function hasPortalListSource(
  value: SchoolPortalConfig["assignments"] | SchoolPortalConfig["videos"],
): boolean {
  return Boolean(
    value.pageUrl ||
      (Array.isArray(value.pageUrls) && value.pageUrls.length > 0) ||
      (Array.isArray(value.sources) && value.sources.length > 0),
  );
}

function readRequiredSecret(options: {
  direct?: string;
  envName?: string;
  defaultEnvName: string;
  label: string;
}): string {
  const direct = options.direct?.trim();
  if (direct) {
    return direct;
  }

  const envName = options.envName?.trim() || options.defaultEnvName;
  const envValue = process.env[envName]?.trim();
  if (envValue) {
    return envValue;
  }

  throw new Error(`Missing ${options.label.replace(/\.$/, "")}. Checked ${envName}.`);
}
