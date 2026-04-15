import { formatRemaining } from "./time.js";
import type { MorningReportDraft, PortalItem, PortalSnapshot } from "./types.js";

export function buildMorningReport(args: {
  snapshot: PortalSnapshot;
  timezone: string;
  assignmentLimit: number;
  videoLimit: number;
  daysAhead: number;
  now?: Date;
}): MorningReportDraft {
  const now = args.now ?? new Date();
  const dateLabel = formatDateLabel(now, args.timezone);
  const daysAhead = clampPositiveInt(args.daysAhead, 4);
  const assignmentLimit = clampPositiveInt(args.assignmentLimit, 5);
  const videoLimit = clampPositiveInt(args.videoLimit, 5);
  const assignmentGroups = splitPortalItemsByDueWindow(args.snapshot.assignments, daysAhead);
  const videoGroups = splitPortalItemsByDueWindow(args.snapshot.videos, daysAhead);
  const assignmentItems = sortPortalItems(assignmentGroups.focus).slice(0, assignmentLimit);
  const videoItems = sortPortalItems(videoGroups.focus).slice(0, videoLimit);
  const backlogAssignments = sortPortalItems(assignmentGroups.backlog).slice(
    0,
    clampBacklogPreviewCount(assignmentLimit),
  );
  const backlogVideos = sortPortalItems(videoGroups.backlog).slice(
    0,
    clampBacklogPreviewCount(videoLimit),
  );

  const bulletSet = new Set<string>();
  for (const item of assignmentItems.slice(0, 3)) {
    bulletSet.add(`Assignment: ${compactPortalLine(item)}`);
  }
  if (!assignmentItems.length && backlogAssignments[0]) {
    bulletSet.add(`Assignment backlog: ${compactPortalLine(backlogAssignments[0])}`);
  }
  for (const item of videoItems.slice(0, 2)) {
    bulletSet.add(`Lecture: ${compactPortalLine(item)}`);
  }
  if (!videoItems.length && backlogVideos[0]) {
    bulletSet.add(`Lecture backlog: ${compactPortalLine(backlogVideos[0])}`);
  }

  const text = [
    `Daily study report for ${dateLabel}`,
    `Synced at ${args.snapshot.syncedAt}`,
    `Focus window: overdue or due within ${formatDaysAhead(daysAhead)}.`,
    "",
    `Assignments due soon (${assignmentGroups.focus.length}/${args.snapshot.assignments.length})`,
    ...formatPortalSection(assignmentItems, `No assignments due within ${formatDaysAhead(daysAhead)}.`),
    ...formatBacklogSection(
      "Other pending assignments",
      assignmentGroups.backlog.length,
      backlogAssignments,
      "No other pending assignments.",
    ),
    "",
    `Lectures to review (${videoGroups.focus.length}/${args.snapshot.videos.length})`,
    ...formatPortalSection(videoItems, `No lecture items due within ${formatDaysAhead(daysAhead)}.`),
    ...formatBacklogSection(
      "Other pending lecture items",
      videoGroups.backlog.length,
      backlogVideos,
      "No other pending lecture items.",
    ),
  ].join("\n");

  const notionContent = [
    "# Daily study report",
    `Generated: ${dateLabel}`,
    `Synced at: ${args.snapshot.syncedAt}`,
    `Focus window: overdue or due within ${formatDaysAhead(daysAhead)}.`,
    "",
    `## Assignments due soon (${assignmentGroups.focus.length}/${args.snapshot.assignments.length})`,
    ...formatNotionLines(
      assignmentItems,
      `No assignments due within ${formatDaysAhead(daysAhead)}.`,
    ),
    ...formatBacklogSection(
      "## Other pending assignments",
      assignmentGroups.backlog.length,
      backlogAssignments,
      "No other pending assignments.",
    ),
    "",
    `## Lectures to review (${videoGroups.focus.length}/${args.snapshot.videos.length})`,
    ...formatNotionLines(videoItems, `No lecture items due within ${formatDaysAhead(daysAhead)}.`),
    ...formatBacklogSection(
      "## Other pending lecture items",
      videoGroups.backlog.length,
      backlogVideos,
      "No other pending lecture items.",
    ),
  ].join("\n");

  return {
    title: `Daily study report ${dateLabel}`,
    text,
    notionContent,
    bullets: Array.from(bulletSet),
    daysAhead,
    assignmentTotal: args.snapshot.assignments.length,
    videoTotal: args.snapshot.videos.length,
    assignments: assignmentItems,
    videos: videoItems,
    backlogAssignments,
    backlogVideos,
  };
}

export function filterPendingSnapshot(snapshot: PortalSnapshot): PortalSnapshot {
  return {
    ...snapshot,
    assignments: snapshot.assignments.filter((item) => !isCompletedText(item.status)),
    videos: snapshot.videos.filter((item) => !isCompletedText(item.status ?? item.progressText)),
  };
}

function formatDateLabel(now: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function formatPortalSection(items: PortalItem[], emptyMessage: string): string[] {
  if (!items.length) {
    return [`- ${emptyMessage}`];
  }
  return items.map((item) => `- ${compactPortalLine(item)}`);
}

function formatNotionLines(items: PortalItem[], emptyMessage: string): string[] {
  if (!items.length) {
    return [`- ${emptyMessage}`];
  }
  return items.map((item) => `- ${compactPortalLine(item)}`);
}

function formatBacklogSection(
  label: string,
  totalCount: number,
  items: PortalItem[],
  emptyMessage: string,
): string[] {
  if (totalCount < 1) {
    return [];
  }

  const remainingCount = Math.max(0, totalCount - items.length);
  return [
    "",
    `${label} (${totalCount})`,
    ...formatPortalSection(items, emptyMessage),
    ...(remainingCount > 0 ? [`- ${remainingCount} more not shown.`] : []),
  ];
}

function compactPortalLine(item: PortalItem): string {
  const parts = [
    item.courseName ?? "Unknown course",
    item.title,
    item.remainingMinutes != null ? formatRemaining(item.remainingMinutes) : null,
    item.dueText ? `due ${item.dueText}` : null,
    item.status ? `status ${item.status}` : null,
    item.progressText ? `progress ${item.progressText}` : null,
  ].filter((value): value is string => Boolean(value));
  return parts.join(" | ");
}

function sortPortalItems(items: PortalItem[]): PortalItem[] {
  return [...items].sort((left, right) => {
    const leftRemaining = left.remainingMinutes ?? Number.MAX_SAFE_INTEGER;
    const rightRemaining = right.remainingMinutes ?? Number.MAX_SAFE_INTEGER;
    if (leftRemaining !== rightRemaining) {
      return leftRemaining - rightRemaining;
    }
    return left.title.localeCompare(right.title);
  });
}

function splitPortalItemsByDueWindow(
  items: PortalItem[],
  daysAhead: number,
): { focus: PortalItem[]; backlog: PortalItem[] } {
  const maxMinutes = daysAhead * 1440;
  const focus: PortalItem[] = [];
  const backlog: PortalItem[] = [];

  for (const item of items) {
    if (item.remainingMinutes != null && item.remainingMinutes <= maxMinutes) {
      focus.push(item);
      continue;
    }
    backlog.push(item);
  }

  return { focus, backlog };
}

function isCompletedText(input: string | null | undefined): boolean {
  if (!input) {
    return false;
  }

  const normalized = input.toLowerCase();
  return normalized.includes("complete") || normalized.includes("completed") || normalized.includes("100%");
}

function clampPositiveInt(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function clampBacklogPreviewCount(limit: number): number {
  return Math.min(3, Math.max(1, limit));
}

function formatDaysAhead(daysAhead: number): string {
  return daysAhead === 1 ? "the next day" : `the next ${daysAhead} days`;
}
