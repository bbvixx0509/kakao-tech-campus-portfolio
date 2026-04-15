import { describe, expect, it } from "vitest";
import {
  buildMorningReportTelegramText,
  buildStudyMaterialTelegramText,
} from "./telegram-format.js";
import type { MorningReportDraft, StudyMaterialIngestResult } from "./types.js";

describe("buildMorningReportTelegramText", () => {
  it("renders due-soon sections, backlog, and notion link", () => {
    const report: MorningReportDraft = {
      title: "Morning report - 2026-04-13",
      text: "",
      notionContent: "",
      bullets: [],
      daysAhead: 4,
      assignmentTotal: 2,
      videoTotal: 1,
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
          remainingMinutes: 300,
          status: null,
          submitType: null,
          detailUrl: null,
          progressText: "40%",
          raw: {},
        },
      ],
      backlogAssignments: [
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
      ],
      backlogVideos: [],
    };

    const text = buildMorningReportTelegramText({
      report,
      syncedAt: "2026-04-13T00:00:00.000Z",
      notionUrl: "https://notion.so/example",
    });

    expect(text).toContain("Assignments due soon (1/2)");
    expect(text).toContain("Other assignments (1)");
    expect(text).toContain("Videos due soon (1/1)");
    expect(text).toContain("Notion: https://notion.so/example");
  });
});

describe("buildStudyMaterialTelegramText", () => {
  it("renders files and warnings compactly", () => {
    const results: StudyMaterialIngestResult[] = [
      {
        metadata: {
          filePath: "C:/tmp/week3.pdf",
          fileName: "week3.pdf",
          sizeBytes: 1024,
          kind: "pdf",
          pageCount: 5,
        },
        extractedText: "Lecture summary",
        extractedTextLength: 1500,
        truncated: true,
        warnings: ["Truncated extracted text to fit configured limit."],
        summaryText: "Indexed week3.pdf as pdf.",
      },
    ];

    const text = buildStudyMaterialTelegramText({
      results,
      notionUrl: "https://notion.so/materials",
    });

    expect(text).toContain("Study materials indexed (1)");
    expect(text).toContain("week3.pdf | pdf | 5 pages | 1500 chars | truncated");
    expect(text).toContain("Warnings");
    expect(text).toContain("Notion: https://notion.so/materials");
  });
});
