import { describe, expect, it } from "vitest";
import { buildNotionBlocks } from "./notion-layout.js";

describe("buildNotionBlocks", () => {
  it("builds assignment blocks from markdown content", () => {
    const blocks = buildNotionBlocks({
      title: "Assignment digest",
      template: "assignment",
      content: [
        "| # | Title | Due | Remaining |",
        "| --- | --- | --- | --- |",
        "| 1 | Essay | 2026-04-14 | D-1 |",
        "",
        "## Notes",
        "- bring citation list",
      ].join("\n"),
      bullets: ["Submit draft"],
      sourceUrl: "https://example.com",
    });

    expect(blocks.length).toBeGreaterThan(4);
    expect(blocks.some((block) => block.type === "to_do")).toBe(true);
    expect(blocks.some((block) => block.type === "callout")).toBe(true);
  });

  it("builds styled lecture blocks from structured study content", () => {
    const blocks = buildNotionBlocks({
      title: "Lecture note",
      template: "lecture",
      content: [
        "# Study material",
        "## Snapshot",
        "- File: lecture.pdf",
        "- Type: pdf",
        "",
        "## One-line summary",
        "리스트는 순서 있는 값을 저장하는 자료구조다.",
        "",
        "## Key concepts",
        "- Lists store ordered values and support index-based access.",
        "- Negative indexes read from the end of the list.",
        "",
        "## Key terms",
        "- list",
        "- index",
        "",
        "## Learning points",
        "- Review indexing rules before solving practice questions.",
        "",
        "## Detailed notes",
        "- Lists can store multiple values in one variable and preserve insertion order.",
      ].join("\n"),
      bullets: ["Lists keep order", "Negative indexes read from the end"],
    });

    expect(blocks.some((block) => block.type === "callout")).toBe(true);
    expect(
      blocks.some(
        (block) =>
          block.type === "heading_2" &&
          block.heading_2.rich_text.some((part) => part.plain_text.includes("핵심 개념")),
      ),
    ).toBe(true);
    expect(
      blocks.some(
        (block) =>
          block.type === "heading_2" &&
          block.heading_2.rich_text.some((part) => part.plain_text.includes("학습 포인트")),
      ),
    ).toBe(true);
    expect(
      blocks.some(
        (block) =>
          block.type === "heading_2" &&
          block.heading_2.rich_text.some((part) => part.plain_text.includes("상세 노트")),
      ),
    ).toBe(true);
  });

  it("renders code-like lecture lines as code blocks", () => {
    const blocks = buildNotionBlocks({
      title: "Code lecture",
      template: "lecture",
      content: [
        "# Study material",
        "## One-line summary",
        "Python lists support append and indexing.",
        "",
        "## Code examples",
        "- Python lists support append and indexing.",
        "def add_item(items, value):",
        "items.append(value)",
        "return items",
      ].join("\n"),
    });

    expect(blocks.some((block) => block.type === "code")).toBe(true);
  });

  it("keeps long note content splittable", () => {
    const longText = "alpha ".repeat(700);
    const blocks = buildNotionBlocks({
      title: "Long note",
      template: "note",
      content: longText,
    });

    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0]?.type).toBe("callout");
  });
});
