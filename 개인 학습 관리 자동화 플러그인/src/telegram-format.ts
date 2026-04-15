import { formatRemaining } from "./time.js";
import type {
  MorningReportDraft,
  PortalItem,
  StudyMaterialIngestResult,
} from "./types.js";

export function buildMorningReportTelegramText(params: {
  report: MorningReportDraft;
  syncedAt: string;
  notionUrl?: string | null;
}): string {
  const lines = [
    `${params.report.title}`,
    `Synced: ${params.syncedAt}`,
    `Focus: overdue + next ${params.report.daysAhead} day${params.report.daysAhead === 1 ? "" : "s"}`,
    "",
    `Assignments due soon (${params.report.assignments.length}/${params.report.assignmentTotal})`,
    ...formatPortalLines(params.report.assignments, "No assignments due soon."),
    ...formatBacklogSummary(
      "Other assignments",
      params.report.backlogAssignments,
      params.report.assignmentTotal - params.report.assignments.length,
    ),
    "",
    `Lecture items to review (${params.report.videos.length}/${params.report.videoTotal})`,
    ...formatPortalLines(params.report.videos, "No lecture items due soon."),
    ...formatBacklogSummary(
      "Other lecture items",
      params.report.backlogVideos,
      params.report.videoTotal - params.report.videos.length,
    ),
  ];

  if (params.notionUrl) {
    lines.push("", `Notion: ${params.notionUrl}`);
  }

  return lines.join("\n");
}

export function buildStudyMaterialTelegramText(params: {
  results: StudyMaterialIngestResult[];
  notionUrl?: string | null;
}): string {
  const lines = [
    `Study materials organized (${params.results.length})`,
    ...params.results.map((result) => `- ${formatStudyMaterialLine(result)}`),
  ];

  const warningLines = params.results.flatMap((result) =>
    result.warnings.map((warning) => `${result.metadata.fileName}: ${warning}`),
  );
  if (warningLines.length) {
    lines.push("", "Warnings", ...warningLines.slice(0, 5).map((line) => `- ${line}`));
    if (warningLines.length > 5) {
      lines.push(`- ${warningLines.length - 5} more warnings not shown.`);
    }
  }

  if (params.notionUrl) {
    lines.push("", `Notion: ${params.notionUrl}`);
  }

  return lines.join("\n");
}

function formatPortalLines(items: PortalItem[], emptyMessage: string): string[] {
  if (!items.length) {
    return [`- ${emptyMessage}`];
  }
  return items.map((item) => `- ${formatPortalItem(item)}`);
}

function formatBacklogSummary(
  label: string,
  previewItems: PortalItem[],
  totalBacklog: number,
): string[] {
  if (totalBacklog < 1) {
    return [];
  }
  const lines = ["", `${label} (${totalBacklog})`];
  if (!previewItems.length) {
    lines.push("- None.");
    return lines;
  }
  for (const item of previewItems) {
    lines.push(`- ${formatPortalItem(item)}`);
  }
  if (totalBacklog > previewItems.length) {
    lines.push(`- ${totalBacklog - previewItems.length} more not shown.`);
  }
  return lines;
}

function formatPortalItem(item: PortalItem): string {
  const pieces = [
    item.courseName ?? "Unknown course",
    item.title,
    item.remainingMinutes != null ? formatRemaining(item.remainingMinutes) : null,
    item.dueText ? `due ${item.dueText}` : null,
    item.progressText ? `progress ${item.progressText}` : null,
    item.status ? `status ${item.status}` : null,
  ];
  return pieces.filter((piece): piece is string => Boolean(piece)).join(" | ");
}

function formatStudyMaterialLine(result: StudyMaterialIngestResult): string {
  const pieces = [
    result.metadata.fileName,
    result.metadata.kind,
    result.metadata.pageCount ? `${result.metadata.pageCount} pages` : null,
    `${result.extractedTextLength} chars`,
    result.truncated ? "truncated" : null,
  ];
  return pieces.filter((piece): piece is string => Boolean(piece)).join(" | ");
}
