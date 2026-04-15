import type { NotionPublishRequest } from "./types.js";

type NotionAnnotations = {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?:
    | "default"
    | "gray"
    | "brown"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "red"
    | "gray_background"
    | "brown_background"
    | "orange_background"
    | "yellow_background"
    | "green_background"
    | "blue_background"
    | "purple_background"
    | "pink_background"
    | "red_background";
};

type NotionRichText = {
  type: "text";
  text: {
    content: string;
    link?: { url: string } | null;
  };
  annotations: Required<NotionAnnotations>;
  plain_text: string;
  href: string | null;
};

type CodeLanguage = "plain text" | "python" | "javascript" | "typescript" | "json" | "markup";

type NotionBlock =
  | {
      object: "block";
      type: "paragraph";
      paragraph: { rich_text: NotionRichText[] };
    }
  | {
      object: "block";
      type: "heading_2";
      heading_2: { rich_text: NotionRichText[] };
    }
  | {
      object: "block";
      type: "heading_3";
      heading_3: { rich_text: NotionRichText[] };
    }
  | {
      object: "block";
      type: "bulleted_list_item";
      bulleted_list_item: { rich_text: NotionRichText[] };
    }
  | {
      object: "block";
      type: "to_do";
      to_do: { rich_text: NotionRichText[]; checked: boolean };
    }
  | {
      object: "block";
      type: "callout";
      callout: {
        rich_text: NotionRichText[];
        icon: { emoji: string };
        color: "default" | "blue_background" | "yellow_background" | "green_background";
      };
    }
  | {
      object: "block";
      type: "divider";
      divider: Record<string, never>;
    }
  | {
      object: "block";
      type: "code";
      code: {
        rich_text: NotionRichText[];
        language: CodeLanguage;
        caption: NotionRichText[];
      };
    };

type AssignmentEntry = {
  index: string;
  title: string;
  due: string;
  remaining: string;
};

type ContentSection = {
  title: string | null;
  lines: string[];
};

const MAX_RICH_TEXT_CHARS = 1_800;

const DEFAULT_ANNOTATIONS: Required<NotionAnnotations> = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
};

function richText(
  content: string,
  options?: { link?: string; annotations?: NotionAnnotations },
): NotionRichText[] {
  const text = content.trim();
  if (!text) {
    return [];
  }

  return splitIntoChunks(text, MAX_RICH_TEXT_CHARS).map((chunk) => ({
    type: "text" as const,
    text: {
      content: chunk,
      link: options?.link ? { url: options.link } : null,
    },
    annotations: {
      ...DEFAULT_ANNOTATIONS,
      ...(options?.annotations ?? {}),
    },
    plain_text: chunk,
    href: options?.link ?? null,
  }));
}

function paragraphBlock(text: string): NotionBlock | null {
  const parts = richText(text);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: parts,
    },
  };
}

function linkedParagraphBlock(label: string, link: string): NotionBlock | null {
  const parts = richText(label, { link });
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: parts,
    },
  };
}

function heading2Block(text: string): NotionBlock | null {
  const parts = richText(text);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: parts,
    },
  };
}

function heading3Block(text: string): NotionBlock | null {
  const parts = richText(text);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: parts,
    },
  };
}

function bulletBlock(text: string): NotionBlock | null {
  const cleaned = cleanBulletLine(text);
  const parts = richText(cleaned);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: parts,
    },
  };
}

function todoBlock(text: string, checked = false): NotionBlock | null {
  const cleaned = cleanChecklistLine(text);
  const parts = richText(cleaned);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "to_do",
    to_do: {
      rich_text: parts,
      checked,
    },
  };
}

function calloutBlock(
  text: string,
  emoji: string,
  color: "default" | "blue_background" | "yellow_background" | "green_background" = "blue_background",
): NotionBlock | null {
  const parts = richText(text);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: parts,
      icon: { emoji },
      color,
    },
  };
}

function dividerBlock(): NotionBlock {
  return {
    object: "block",
    type: "divider",
    divider: {},
  };
}

function codeBlock(text: string, language: CodeLanguage = "plain text", caption?: string): NotionBlock | null {
  const parts = richText(text);
  if (!parts.length) {
    return null;
  }
  return {
    object: "block",
    type: "code",
    code: {
      rich_text: parts,
      language,
      caption: caption ? richText(caption) : [],
    },
  };
}

function normalizeContent(content: string): string {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanText(value: string): string {
  return value
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.:;!?])/g, "$1");
}

function cleanBulletLine(line: string): string {
  return cleanText(line.replace(/^([-*+]\s+|\d+[.)]\s+)/, ""));
}

function cleanChecklistLine(line: string): string {
  return cleanText(line.replace(/^\[(?: |x|X)\]\s+/, ""));
}

function parseMarkdownTable(lines: string[]): AssignmentEntry[] {
  const tableLines = lines.filter((line) => line.includes("|")).map((line) => line.trim());
  if (tableLines.length < 3) {
    return [];
  }

  const rows = tableLines
    .filter((line) => !/^\|?[\s:-]+\|[\s|:-]*$/.test(line))
    .map((line) =>
      line
        .split("|")
        .map((cell) => cleanText(cell))
        .filter(Boolean),
    )
    .filter((row) => row.length >= 4);

  if (rows.length < 2) {
    return [];
  }

  return rows.slice(1).map((row) => ({
    index: row[0] ?? "",
    title: row[1] ?? "",
    due: row[2] ?? "",
    remaining: row[3] ?? "",
  }));
}

function removeTableLines(lines: string[]): string[] {
  return lines.filter((line) => !line.includes("|"));
}

function matchesHeader(line: string): string | null {
  const markdownMatch = line.match(/^#{1,3}\s+(.+)$/);
  if (markdownMatch) {
    return cleanText(markdownMatch[1]);
  }

  const bracketMatch = line.match(/^\[(.+)]$/);
  if (bracketMatch) {
    return cleanText(bracketMatch[1]);
  }

  if (line.length <= 32 && !/^[-*+[\d]/.test(line) && !/[.:!?]$/.test(line)) {
    return cleanText(line);
  }

  return null;
}

function structureContent(lines: string[]): ContentSection[] {
  const sections: ContentSection[] = [];
  let current: ContentSection = { title: null, lines: [] };

  for (const rawLine of lines) {
    const line = cleanText(rawLine);
    if (!line) {
      if (current.title || current.lines.length) {
        sections.push(current);
        current = { title: null, lines: [] };
      }
      continue;
    }

    const header = matchesHeader(line);
    if (header) {
      if (current.title || current.lines.length) {
        sections.push(current);
      }
      current = { title: header, lines: [] };
      continue;
    }

    current.lines.push(line);
  }

  if (current.title || current.lines.length) {
    sections.push(current);
  }
  return sections;
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const cleaned = cleanText(line);
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }
    seen.add(cleaned);
    result.push(cleaned);
  }
  return result;
}

function parseRemainingDays(value: string): number | null {
  const match = value.match(/D-(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function formatNearestAssignment(entries: AssignmentEntry[]): string | null {
  const sorted = entries
    .map((entry) => ({
      entry,
      days: parseRemainingDays(entry.remaining),
    }))
    .filter((item) => item.days !== null)
    .sort((left, right) => (left.days ?? Number.MAX_SAFE_INTEGER) - (right.days ?? Number.MAX_SAFE_INTEGER));

  if (!sorted.length) {
    return null;
  }

  const next = sorted[0].entry;
  return `${next.title} | ${next.due} | ${next.remaining}`;
}

function isCodeLikeLine(line: string): boolean {
  if (/^```/.test(line)) {
    return true;
  }
  if (/^\s{4,}\S/.test(line)) {
    return true;
  }
  if (/^(def |class |for |while |if |elif |else:|return |print\(|import |from |const |let |var |function )/.test(line)) {
    return true;
  }
  return /(=>|:=|\{|\}|\[\]|\(\)|len\(|append\(|range\(|\.sort\(|\.append\()/i.test(line);
}

function cleanCodeLine(line: string): string {
  return line.replace(/^```[a-z]*\s*/i, "").trimEnd();
}

function detectCodeLanguage(line: string): CodeLanguage {
  const lowered = line.toLowerCase();
  if (/^```python|^\s*(def |class |for |while |if |elif |print\(|import |from |len\(|append\(|range\()/i.test(line)) {
    return "python";
  }
  if (/^```(?:ts|typescript)|\binterface\b|\btype\b|=>/.test(lowered)) {
    return "typescript";
  }
  if (/^```(?:js|javascript)|\bconst\b|\blet\b|\bfunction\b/.test(lowered)) {
    return "javascript";
  }
  if (/^```json|^\s*\{.*\}\s*$|^\s*"\w+":/.test(lowered)) {
    return "json";
  }
  if (/^```html|^</.test(lowered)) {
    return "markup";
  }
  return "plain text";
}

function appendSimpleLines(blocks: NotionBlock[], lines: string[], options?: { limit?: number }): void {
  let appended = 0;
  for (const line of dedupeLines(lines)) {
    if (options?.limit && appended >= options.limit) {
      break;
    }
    if (isCodeLikeLine(line)) {
      continue;
    }
    if (/^([-*+]\s+|\d+[.)]\s+)/.test(line)) {
      const block = bulletBlock(line);
      if (block) {
        blocks.push(block);
        appended += 1;
      }
      continue;
    }
    const block = paragraphBlock(line);
    if (block) {
      blocks.push(block);
      appended += 1;
    }
  }
}

function appendCodeExamples(blocks: NotionBlock[], lines: string[], limit = 4): void {
  let appended = 0;
  for (const line of dedupeLines(lines)) {
    if (!isCodeLikeLine(line)) {
      continue;
    }
    const block = codeBlock(cleanCodeLine(line), detectCodeLanguage(line));
    if (block) {
      blocks.push(block);
      appended += 1;
    }
    if (appended >= limit) {
      break;
    }
  }
}

function pushIfPresent(blocks: NotionBlock[], block: NotionBlock | null): void {
  if (block) {
    blocks.push(block);
  }
}

function buildSourceBlocks(input: NotionPublishRequest): NotionBlock[] {
  if (!input.sourceUrl) {
    return [];
  }

  const block = linkedParagraphBlock("Open source", input.sourceUrl);
  return block ? [block] : [];
}

function matchesSectionTitle(title: string | null, expected: string): boolean {
  return cleanText(title ?? "").toLowerCase() === expected.toLowerCase();
}

function findSection(sections: ContentSection[], expected: string): ContentSection | null {
  return sections.find((section) => matchesSectionTitle(section.title, expected)) ?? null;
}

function buildAssignmentBlocks(input: NotionPublishRequest, lines: string[]): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const entries = parseMarkdownTable(lines);
  const remainingLines = removeTableLines(lines);
  const sections = structureContent(remainingLines);
  const summaryBits = [`Pending assignments: ${entries.length}`];
  const nextAssignment = formatNearestAssignment(entries);
  if (nextAssignment) {
    summaryBits.push(`Closest deadline: ${nextAssignment}`);
  }

  pushIfPresent(blocks, calloutBlock(summaryBits.join(" / "), "📚", "yellow_background"));
  blocks.push(...buildSourceBlocks(input));

  if (input.bullets?.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("✨ Quick actions"));
    for (const bullet of dedupeLines(input.bullets)) {
      pushIfPresent(blocks, bulletBlock(bullet));
    }
  }

  if (entries.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("✅ Assignments"));
    for (const entry of entries) {
      pushIfPresent(
        blocks,
        todoBlock(
          `${[entry.index, entry.title].filter(Boolean).join(" ")} | due ${entry.due} | ${entry.remaining}`,
        ),
      );
    }
  }

  if (sections.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("📝 Notes"));
    for (const section of sections) {
      if (section.title) {
        pushIfPresent(blocks, heading3Block(section.title));
      }
      appendSimpleLines(blocks, section.lines);
    }
  }

  return blocks;
}

function buildLectureBlocks(input: NotionPublishRequest, lines: string[]): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const sections = structureContent(lines);
  const snapshot = findSection(sections, "snapshot");
  const summary = findSection(sections, "core summary");
  const terms = findSection(sections, "key terms");
  const guide = findSection(sections, "study guide");
  const preview = findSection(sections, "extracted preview");
  const sourceInfo = findSection(sections, "source info");
  const remaining = sections.filter(
    (section) =>
      !matchesSectionTitle(section.title, "snapshot") &&
      !matchesSectionTitle(section.title, "core summary") &&
      !matchesSectionTitle(section.title, "key terms") &&
      !matchesSectionTitle(section.title, "study guide") &&
      !matchesSectionTitle(section.title, "extracted preview") &&
      !matchesSectionTitle(section.title, "source info"),
  );

  pushIfPresent(blocks, calloutBlock("📘 강의 노트", "📘", "blue_background"));
  blocks.push(...buildSourceBlocks(input));

  if (snapshot?.lines.length) {
    pushIfPresent(blocks, paragraphBlock(snapshot.lines.join(" / ")));
  }

  if (input.bullets?.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("✨ 핵심 요약"));
    for (const bullet of dedupeLines(input.bullets).slice(0, 5)) {
      pushIfPresent(blocks, bulletBlock(bullet));
    }
  }

  if (summary?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("🧠 개념 정리"));
    appendSimpleLines(blocks, summary.lines, { limit: 5 });
  }

  if (terms?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("🔑 키워드"));
    for (const line of dedupeLines(terms.lines).slice(0, 6)) {
      pushIfPresent(blocks, bulletBlock(line));
    }
  }

  const previewLines = preview?.lines ?? [];
  const hasCodeExamples = previewLines.some((line) => isCodeLikeLine(line));
  if (hasCodeExamples) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("💻 코드 예시"));
    appendCodeExamples(blocks, previewLines);
  }

  const noteLines = [...(guide?.lines ?? []), ...previewLines.filter((line) => !isCodeLikeLine(line))];
  if (noteLines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("📝 보충 메모"));
    appendSimpleLines(blocks, noteLines, { limit: 6 });
  }

  if (remaining.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("📚 추가 정리"));
    for (const section of remaining) {
      if (section.title) {
        pushIfPresent(blocks, heading3Block(section.title));
      }
      appendSimpleLines(blocks, section.lines, { limit: 4 });
    }
  }

  if (sourceInfo?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("🔗 원본 정보"));
    appendSimpleLines(blocks, sourceInfo.lines, { limit: 2 });
  }

  if (
    !input.bullets?.length &&
    !summary?.lines.length &&
    !terms?.lines.length &&
    !noteLines.length &&
    !remaining.length
  ) {
    pushIfPresent(blocks, paragraphBlock("No extracted lecture text was provided."));
  }

  return blocks;
}

function buildNoteBlocks(input: NotionPublishRequest, lines: string[]): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const sections = structureContent(lines);

  pushIfPresent(blocks, calloutBlock("📝 정리 노트", "📝", "green_background"));
  blocks.push(...buildSourceBlocks(input));

  if (input.bullets?.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("✨ Highlights"));
    for (const bullet of dedupeLines(input.bullets).slice(0, 5)) {
      pushIfPresent(blocks, bulletBlock(bullet));
    }
  }

  if (sections.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("📚 Body"));
    for (const section of sections) {
      if (section.title) {
        pushIfPresent(blocks, heading3Block(section.title));
      }
      appendSimpleLines(blocks, section.lines, { limit: 6 });
    }
  }

  return blocks;
}

function buildCleanAssignmentBlocks(input: NotionPublishRequest, lines: string[]): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const entries = parseMarkdownTable(lines);
  const remainingLines = removeTableLines(lines);
  const sections = structureContent(remainingLines);
  const summaryBits = [`Pending assignments: ${entries.length}`];
  const nextAssignment = formatNearestAssignment(entries);
  if (nextAssignment) {
    summaryBits.push(`Closest deadline: ${nextAssignment}`);
  }

  pushIfPresent(
    blocks,
    calloutBlock(summaryBits.join(" / "), "\u{26A0}\u{FE0F}", "yellow_background"),
  );
  blocks.push(...buildSourceBlocks(input));

  if (input.bullets?.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("Quick actions"));
    for (const bullet of dedupeLines(input.bullets)) {
      pushIfPresent(blocks, bulletBlock(bullet));
    }
  }

  if (entries.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("Assignments"));
    for (const entry of entries) {
      pushIfPresent(
        blocks,
        todoBlock(
          `${[entry.index, entry.title].filter(Boolean).join(" ")} | due ${entry.due} | ${entry.remaining}`,
        ),
      );
    }
  }

  if (sections.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("Notes"));
    for (const section of sections) {
      if (section.title) {
        pushIfPresent(blocks, heading3Block(section.title));
      }
      appendSimpleLines(blocks, section.lines);
    }
  }

  return blocks;
}

function buildCleanLectureBlocks(input: NotionPublishRequest, lines: string[]): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const sections = structureContent(lines);
  const snapshot = findSection(sections, "snapshot");
  const summary = findSection(sections, "one-line summary");
  const concepts = findSection(sections, "key concepts");
  const terms = findSection(sections, "key terms");
  const guide = findSection(sections, "learning points");
  const codeSection = findSection(sections, "code examples");
  const checklist = findSection(sections, "review checklist");
  const detailedNotes = findSection(sections, "detailed notes");
  const sourceInfo = findSection(sections, "source");
  const remaining = sections.filter(
    (section) =>
      !matchesSectionTitle(section.title, "snapshot") &&
      !matchesSectionTitle(section.title, "one-line summary") &&
      !matchesSectionTitle(section.title, "key concepts") &&
      !matchesSectionTitle(section.title, "key terms") &&
      !matchesSectionTitle(section.title, "learning points") &&
      !matchesSectionTitle(section.title, "code examples") &&
      !matchesSectionTitle(section.title, "review checklist") &&
      !matchesSectionTitle(section.title, "detailed notes") &&
      !matchesSectionTitle(section.title, "source"),
  );

  pushIfPresent(
    blocks,
    calloutBlock(
      "업로드한 강의자료를 공부노트 형태로 정리했어요.",
      "\u{1F4D8}",
      "blue_background",
    ),
  );

  if (snapshot?.lines.length) {
    pushIfPresent(blocks, calloutBlock(snapshot.lines.join(" / "), "\u{1F4CE}", "default"));
  }

  if (summary?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("한줄 요약"));
    appendSimpleLines(blocks, summary.lines, { limit: 2 });
  }

  if (concepts?.lines.length || input.bullets?.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("핵심 개념"));
    const conceptLines = concepts?.lines.length ? concepts.lines : input.bullets ?? [];
    for (const bullet of dedupeLines(conceptLines).slice(0, 6)) {
      pushIfPresent(blocks, bulletBlock(bullet));
    }
  }

  if (guide?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("학습 포인트"));
    appendSimpleLines(blocks, guide.lines, { limit: 6 });
  }

  if (terms?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("핵심 키워드"));
    for (const line of dedupeLines(terms.lines).slice(0, 8)) {
      pushIfPresent(blocks, bulletBlock(line));
    }
  }

  const codeLines = codeSection?.lines ?? [];
  if (codeLines.some((line) => isCodeLikeLine(line))) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("코드 예시"));
    appendCodeExamples(blocks, codeLines, 3);
  }

  if (checklist?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("복습 체크리스트"));
    for (const line of dedupeLines(checklist.lines).slice(0, 5)) {
      pushIfPresent(blocks, bulletBlock(line));
    }
  }

  if (detailedNotes?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("상세 노트"));
    appendSimpleLines(blocks, detailedNotes.lines, { limit: 8 });
  }

  if (sourceInfo?.lines.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("원본 자료"));
    appendSimpleLines(blocks, sourceInfo.lines, { limit: 2 });
  }

  if (
    !summary?.lines.length &&
    !concepts?.lines.length &&
    !terms?.lines.length &&
    !guide?.lines.length &&
    !codeLines.length &&
    !checklist?.lines.length &&
    !detailedNotes?.lines.length &&
    !remaining.length
  ) {
    pushIfPresent(blocks, paragraphBlock("No extracted lecture text was provided."));
  }

  return blocks;
}

function buildCleanNoteBlocks(input: NotionPublishRequest, lines: string[]): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const sections = structureContent(lines);

  pushIfPresent(
    blocks,
    calloutBlock("Study note created from uploaded material.", "\u{1F4DD}", "green_background"),
  );
  blocks.push(...buildSourceBlocks(input));

  if (input.bullets?.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("Highlights"));
    for (const bullet of dedupeLines(input.bullets).slice(0, 5)) {
      pushIfPresent(blocks, bulletBlock(bullet));
    }
  }

  if (sections.length) {
    blocks.push(dividerBlock());
    pushIfPresent(blocks, heading2Block("Body"));
    for (const section of sections) {
      if (section.title) {
        pushIfPresent(blocks, heading3Block(section.title));
      }
      appendSimpleLines(blocks, section.lines, { limit: 6 });
    }
  }

  return blocks;
}

export function buildNotionBlocks(input: NotionPublishRequest): NotionBlock[] {
  const normalized = normalizeContent(input.content);
  const lines = normalized ? normalized.split("\n").map((line) => line.trim()) : [];

  if (input.template === "assignment") {
    return buildCleanAssignmentBlocks(input, lines);
  }
  if (input.template === "lecture") {
    return buildCleanLectureBlocks(input, lines);
  }
  return buildCleanNoteBlocks(input, lines);
}

export function notionTitleProperty(title: string) {
  return {
    title: [
      {
        type: "text" as const,
        text: {
          content: title.trim(),
        },
      },
    ],
  };
}

function splitIntoChunks(value: string, maxLength: number): string[] {
  if (value.length <= maxLength) {
    return [value];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < value.length) {
    let end = Math.min(start + maxLength, value.length);
    if (end < value.length) {
      const breakPoint = value.lastIndexOf(" ", end);
      if (breakPoint > start + Math.floor(maxLength * 0.6)) {
        end = breakPoint;
      }
    }
    chunks.push(value.slice(start, end).trim());
    start = end;
  }
  return chunks.filter(Boolean);
}
