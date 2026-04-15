import { describe, expect, it } from "vitest";
import {
  buildStudyMaterialCollectionNotionContent,
  buildStudyMaterialNotionContent,
  detectStudyMaterialKind,
  summarizeStudyMaterials,
} from "./file-ingest.js";
import type { StudyMaterialIngestResult } from "./types.js";

describe("detectStudyMaterialKind", () => {
  it("detects the planned school file types", () => {
    expect(detectStudyMaterialKind("notes.txt")).toBe("text");
    expect(detectStudyMaterialKind("lecture.pdf")).toBe("pdf");
    expect(detectStudyMaterialKind("worksheet.hwp")).toBe("hwp");
    expect(detectStudyMaterialKind("spreadsheet.csv")).toBe("csv");
  });
});

describe("buildStudyMaterialNotionContent", () => {
  it("renders metadata and extracted text", () => {
    const result: StudyMaterialIngestResult = {
      metadata: {
        filePath: "C:/tmp/lecture.pdf",
        fileName: "lecture.pdf",
        sizeBytes: 1234,
        kind: "pdf",
        pageCount: 3,
      },
      extractedText: "Summary body",
      extractedTextLength: 12,
      truncated: false,
      warnings: [],
      summaryText: "Indexed lecture.pdf as pdf.",
      summaryTitle: "lecture.pdf is a 3-page pdf document. Extracted text length is 12 characters.",
      summaryBullets: ["Summary body"],
      keyTerms: ["Summary", "body"],
      extractedPreview: "Summary body",
      notionAttachments: [],
    };

    const content = buildStudyMaterialNotionContent(result);
    expect(content).toContain("lecture.pdf");
    expect(content).toContain("## One-line summary");
    expect(content).toContain("## Key concepts");
    expect(content).toContain("## Key terms");
    expect(content).toContain("## Code examples");
    expect(content).toContain("## Detailed notes");
    expect(content).toContain("Pages: 3");
  });
});

describe("buildStudyMaterialCollectionNotionContent", () => {
  it("renders a combined page for multiple files", () => {
    const results: StudyMaterialIngestResult[] = [
      {
        metadata: {
          filePath: "C:/tmp/lecture.pdf",
          fileName: "lecture.pdf",
          sizeBytes: 1234,
          kind: "pdf",
          pageCount: 3,
        },
        extractedText: "Lecture summary",
        extractedTextLength: 15,
        truncated: false,
        warnings: [],
        summaryText: "Indexed lecture.pdf as pdf.",
        summaryTitle: "lecture.pdf is a 3-page pdf document. Extracted text length is 15 characters.",
        summaryBullets: ["Lecture summary"],
        keyTerms: ["Lecture", "summary"],
        extractedPreview: "Lecture summary",
        notionAttachments: [],
      },
      {
        metadata: {
          filePath: "C:/tmp/notes.txt",
          fileName: "notes.txt",
          sizeBytes: 64,
          kind: "text",
        },
        extractedText: "Plain text notes",
        extractedTextLength: 16,
        truncated: false,
        warnings: [],
        summaryText: "Indexed notes.txt as text.",
        summaryTitle: "notes.txt is a text study file. Extracted text length is 16 characters.",
        summaryBullets: ["Plain text notes"],
        keyTerms: ["Plain", "text", "notes"],
        extractedPreview: "Plain text notes",
        notionAttachments: [],
      },
    ];

    const content = buildStudyMaterialCollectionNotionContent(results);
    expect(content).toContain("Files: 2");
    expect(content).toContain("lecture.pdf");
    expect(content).toContain("notes.txt");
    expect(content).toContain("## Collection summary");
    expect(content).toContain("### Highlights");
    expect(content).toContain("### Extracted preview");

    const summary = summarizeStudyMaterials(results);
    expect(summary).toContain("Indexed 2 study files.");
    expect(summary).toContain("Kinds: pdf, text.");
  });
});
