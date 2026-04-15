import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { PersonalAssistantConfigSchema } from "./src/config.js";
import { createCampusSyncTool } from "./src/tool-campus-sync.js";
import { createMorningReportTool } from "./src/tool-morning-report.js";
import { createNotionPublishTool } from "./src/tool-notion-publish.js";
import { createStudyMaterialIngestTool } from "./src/tool-study-material-ingest.js";

export default definePluginEntry({
  id: "study-workflow-assistant",
  name: "Study Workflow Assistant",
  description: "Campus deadline summaries, study material organization, and Notion publishing",
  configSchema: PersonalAssistantConfigSchema,
  register(api) {
    api.registerTool(createCampusSyncTool(api), { optional: true });
    api.registerTool(createMorningReportTool(api), { optional: true });
    api.registerTool(createNotionPublishTool(api), { optional: true });
    api.registerTool(createStudyMaterialIngestTool(api), { optional: true });
  },
});
