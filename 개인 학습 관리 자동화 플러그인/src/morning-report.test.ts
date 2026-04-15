import { describe, expect, it } from "vitest";
import { buildMorningReport, filterPendingSnapshot } from "./morning-report.js";
import type { PortalSnapshot } from "./types.js";

const snapshot: PortalSnapshot = {
  syncedAt: "2026-04-13T00:00:00.000Z",
  assignments: [
    {
      key: "a1",
      type: "assignment",
      title: "Essay draft",
      courseName: "Writing",
      dueText: "2026-04-14 23:59",
      dueAt: "2026-04-14T14:59:00.000Z",
      remainingMinutes: 120,
      status: "Pending",
      submitType: "file",
      detailUrl: null,
      progressText: null,
      raw: {},
    },
    {
      key: "a2",
      type: "assignment",
      title: "Term paper",
      courseName: "Math",
      dueText: "2026-04-20 23:59",
      dueAt: "2026-04-20T14:59:00.000Z",
      remainingMinutes: 10_080,
      status: "Pending",
      submitType: null,
      detailUrl: null,
      progressText: null,
      raw: {},
    },
    {
      key: "a3",
      type: "assignment",
      title: "Practice quiz",
      courseName: "Math",
      dueText: null,
      dueAt: null,
      remainingMinutes: null,
      status: "Completed",
      submitType: null,
      detailUrl: null,
      progressText: null,
      raw: {},
    },
  ],
  videos: [
    {
      key: "v1",
      type: "video",
      title: "Week 3 lecture",
      courseName: "Physics",
      dueText: null,
      dueAt: null,
      remainingMinutes: 360,
      status: null,
      submitType: null,
      detailUrl: null,
      progressText: "40%",
      raw: {},
    },
    {
      key: "v2",
      type: "video",
      title: "Week 6 lecture",
      courseName: "Physics",
      dueText: "2026-04-22 23:59",
      dueAt: "2026-04-22T14:59:00.000Z",
      remainingMinutes: 12_960,
      status: null,
      submitType: null,
      detailUrl: null,
      progressText: "0%",
      raw: {},
    },
  ],
};

describe("filterPendingSnapshot", () => {
  it("removes completed items", () => {
    const filtered = filterPendingSnapshot(snapshot);
    expect(filtered.assignments).toHaveLength(2);
    expect(filtered.videos).toHaveLength(2);
  });
});

describe("buildMorningReport", () => {
  it("creates text and notion drafts", () => {
    const report = buildMorningReport({
      snapshot: filterPendingSnapshot(snapshot),
      timezone: "Asia/Seoul",
      assignmentLimit: 5,
      videoLimit: 5,
      daysAhead: 4,
      now: new Date("2026-04-13T01:00:00.000Z"),
    });

    expect(report.title).toContain("Daily study report");
    expect(report.text).toContain("Assignments due soon (1/2)");
    expect(report.text).toContain("Other pending assignments (1)");
    expect(report.text).toContain("Lectures to review (1/2)");
    expect(report.notionContent).toContain("## Lectures to review (1/2)");
    expect(report.notionContent).toContain("## Other pending lecture items (1)");
    expect(report.daysAhead).toBe(4);
    expect(report.assignmentTotal).toBe(2);
    expect(report.videoTotal).toBe(2);
    expect(report.backlogAssignments).toHaveLength(1);
    expect(report.backlogVideos).toHaveLength(1);
    expect(report.bullets.length).toBeGreaterThan(0);
  });
});
