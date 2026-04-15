import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { ensureDirectoryExists, readAiSummaryRegion, resolveUserPath } from "./config.js";
import type { ResolvedPersonalAssistantConfig } from "./config.js";
import type {
  NotionAttachment,
  StudyMaterialIngestResult,
  StudyMaterialKind,
  StudyMaterialMetadata,
} from "./types.js";

const DEFAULT_TEXT_LIMIT = 8_000;
const DEFAULT_PREVIEW_LIMIT = 1_500;
const DEFAULT_BULLET_COUNT = 4;
const DEFAULT_PDF_PREVIEW_PAGES = 4;
const DEFAULT_AI_INPUT_LIMIT = 8_000;
const DEFAULT_AI_MAX_TOKENS = 2_200;
const DEFAULT_DETAILED_NOTE_COUNT = 8;

export async function ingestStudyMaterial(
  cfg: ResolvedPersonalAssistantConfig,
  rawFilePath: string,
): Promise<StudyMaterialIngestResult> {
  const filePath = path.resolve(resolveUserPath(rawFilePath));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Study material file not found: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    throw new Error(`Study material path is not a file: ${filePath}`);
  }

  const fileName = path.basename(filePath);
  const kind = detectStudyMaterialKind(filePath);
  const warnings: string[] = [];

  let metadata: StudyMaterialMetadata = {
    filePath,
    fileName,
    sizeBytes: stat.size,
    kind,
  };
  let extractedText = "";
  let notionAttachments: NotionAttachment[] = [];

  switch (kind) {
    case "text":
    case "markdown":
    case "json":
    case "csv":
      extractedText = normalizeExtractedText(fs.readFileSync(filePath, "utf8"));
      break;
    case "pdf": {
      const pdfResult = await extractPdfData(cfg, filePath);
      metadata = { ...metadata, pageCount: pdfResult.pageCount };
      extractedText = pdfResult.text;
      notionAttachments = pdfResult.notionAttachments;
      break;
    }
    case "hwp":
      extractedText = await extractHwpText(filePath);
      break;
    default:
      warnings.push("Unsupported extension. The file was indexed as unknown.");
      extractedText = normalizeExtractedText(
        "No built-in extractor is available for this file type yet.",
      );
      break;
  }

  const limited = applyTextLimit(
    normalizeExtractedText(extractedText),
    cfg.uploads?.maxExtractedCharacters ?? DEFAULT_TEXT_LIMIT,
  );

  const summaryText = [
    buildSummaryTitle(metadata, limited.fullLength),
    metadata.pageCount ? `Pages: ${metadata.pageCount}.` : null,
    ...buildSummaryBullets(metadata, limited.extractedText, limited.fullLength, limited.truncated),
    warnings.length ? `Warnings: ${warnings.join(" | ")}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join(" ");

  const summaryBullets = buildSummaryBullets(
    metadata,
    limited.extractedText,
    limited.fullLength,
    limited.truncated,
  );
  const keyTerms = extractKeyTerms(limited.extractedText);
  const extractedPreview = buildExtractedPreview(limited.extractedText);
  const aiDigest = await generateAiStudyDigest(cfg, metadata, limited.extractedText, extractedPreview);

  return {
    metadata,
    extractedText: limited.extractedText,
    extractedTextLength: limited.fullLength,
    truncated: limited.truncated,
    warnings,
    summaryText,
    summaryTitle: aiDigest?.summaryTitle ?? buildSummaryTitle(metadata, limited.fullLength),
    summaryBullets: aiDigest?.summaryBullets?.length ? aiDigest.summaryBullets : summaryBullets,
    keyTerms: aiDigest?.keyTerms?.length ? aiDigest.keyTerms : keyTerms,
    summaryOverview: aiDigest?.summaryOverview,
    studyGuideBullets: aiDigest?.studyGuideBullets ?? buildStudyGuideBullets(metadata),
    codeExamples: normalizeCodeExamples(aiDigest?.codeExamples ?? extractCodeExamples(limited.extractedText)),
    visualHighlights: aiDigest?.visualHighlights ?? buildVisualHighlights(metadata, notionAttachments),
    aiEnhanced: Boolean(aiDigest),
    extractedPreview,
    notionAttachments,
  };
}

export async function ingestStudyMaterials(
  cfg: ResolvedPersonalAssistantConfig,
  rawFilePaths: string[],
): Promise<StudyMaterialIngestResult[]> {
  const filePaths = Array.from(
    new Set(rawFilePaths.map((value) => value.trim()).filter((value) => value.length > 0)),
  );
  if (filePaths.length < 1) {
    throw new Error("study_material_ingest requires at least one file path.");
  }

  return Promise.all(filePaths.map((filePath) => ingestStudyMaterial(cfg, filePath)));
}

export function detectStudyMaterialKind(filePath: string): StudyMaterialKind {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".txt":
      return "text";
    case ".md":
    case ".markdown":
      return "markdown";
    case ".json":
      return "json";
    case ".csv":
      return "csv";
    case ".pdf":
      return "pdf";
    case ".hwp":
      return "hwp";
    default:
      return "unknown";
  }
}

export function buildStudyMaterialNotionContent(result: StudyMaterialIngestResult): string {
  const detailedNotes = buildDetailedNotes(result);
  const lines = [
    "# Study note",
    "## Snapshot",
    `- File: ${result.metadata.fileName}`,
    `- Type: ${result.metadata.kind}`,
    result.metadata.pageCount ? `- Pages: ${result.metadata.pageCount}` : null,
    result.warnings.length ? `- Warnings: ${result.warnings.join(" | ")}` : null,
    "",
    "## One-line summary",
    result.summaryTitle,
    result.summaryOverview ?? null,
    "",
    "## Key concepts",
    ...result.summaryBullets.map((bullet) => `- ${bullet}`),
    "",
    "## Learning points",
    ...(result.studyGuideBullets?.length
      ? result.studyGuideBullets.map((bullet) => `- ${bullet}`)
      : [
          "- Review the core summary first, then skim the key terms before reading the excerpt.",
          result.metadata.pageCount
            ? "- Revisit the original PDF pages for diagrams, formulas, and examples."
            : null,
        ]),
    "",
    "## Key terms",
    ...(result.keyTerms.length > 0
      ? result.keyTerms.map((term) => `- ${term}`)
      : ["- No standout keywords were extracted."]),
    "",
    "## Code examples",
    ...(result.codeExamples?.length ? result.codeExamples : ["No standout code snippet was extracted."]),
    "",
    "## Review checklist",
    ...(result.visualHighlights?.length
      ? result.visualHighlights.map((item) => `- ${item}`)
      : ["- Open the attached original PDF when you need the original figures or page layout."]),
    "",
    "## Detailed notes",
    ...(detailedNotes.length > 0
      ? detailedNotes.map((item) => `- ${item}`)
      : ["- Open the source PDF below for more detailed reading."]),
    "",
    "## Source",
    `- ${result.metadata.fileName}${result.metadata.pageCount ? ` (${result.metadata.pageCount} pages)` : ""}`,
  ];
  return lines.filter((line): line is string => line !== null).join("\n");
}

export function buildStudyMaterialCollectionNotionContent(
  results: StudyMaterialIngestResult[],
): string {
  if (results.length === 1) {
    return buildStudyMaterialNotionContent(results[0]);
  }

  const lines: string[] = [
    "# Study materials",
    `Files: ${results.length}`,
    `Kinds: ${formatStudyMaterialKinds(results)}`,
    "",
    "## Collection summary",
    ...buildCollectionSummaryBullets(results).map((bullet) => `- ${bullet}`),
    "",
    "## Indexed files",
    ...results.map((result) => `- ${describeStudyMaterial(result)}`),
  ];

  for (const result of results) {
    lines.push(
      "",
      `## ${result.metadata.fileName}`,
      `Type: ${result.metadata.kind}`,
      `Summary: ${result.summaryTitle}`,
    );
    if (result.metadata.pageCount) {
      lines.push(`Pages: ${result.metadata.pageCount}`);
    }
    if (result.warnings.length) {
      lines.push(`Warnings: ${result.warnings.join(" | ")}`);
    }
    if (result.summaryBullets.length) {
      lines.push("", "### Highlights", ...result.summaryBullets.map((bullet) => `- ${bullet}`));
    }
    if (result.keyTerms.length) {
      lines.push("", "### Key terms", ...result.keyTerms.map((term) => `- ${term}`));
    }
    lines.push("", "### Extracted preview", result.extractedPreview || "No extracted text available.");
  }

  return lines.join("\n");
}

export function summarizeStudyMaterials(results: StudyMaterialIngestResult[]): string {
  const truncatedCount = results.filter((result) => result.truncated).length;
  const warningsCount = results.reduce((count, result) => count + result.warnings.length, 0);
  const pieces = [
    `Indexed ${results.length} study ${results.length === 1 ? "file" : "files"}.`,
    `Kinds: ${formatStudyMaterialKinds(results)}.`,
    ...buildCollectionSummaryBullets(results),
    truncatedCount > 0
      ? `${truncatedCount} ${truncatedCount === 1 ? "file was" : "files were"} truncated.`
      : null,
    warningsCount > 0
      ? `${warningsCount} ${warningsCount === 1 ? "warning" : "warnings"} recorded.`
      : null,
  ];
  return pieces.filter((piece): piece is string => Boolean(piece)).join(" ");
}

function buildSummaryTitle(metadata: StudyMaterialMetadata, extractedLength: number): string {
  const base = metadata.pageCount
    ? `${metadata.fileName} is a ${metadata.pageCount}-page ${metadata.kind} document.`
    : `${metadata.fileName} is a ${metadata.kind} study file.`;
  return `${base} Extracted text length is ${extractedLength} characters.`;
}

function buildSummaryBullets(
  metadata: StudyMaterialMetadata,
  extractedText: string,
  extractedLength: number,
  truncated: boolean,
): string[] {
  const cleanedLines = rankMeaningfulLines(extractedText);
  const bullets: string[] = [];
  if (cleanedLines.length > 0) {
    bullets.push(...cleanedLines.slice(0, DEFAULT_BULLET_COUNT));
  }
  if (bullets.length < DEFAULT_BULLET_COUNT) {
    const fallback = buildFallbackBullets(metadata, extractedLength, truncated);
    for (const item of fallback) {
      if (bullets.length >= DEFAULT_BULLET_COUNT) {
        break;
      }
      if (!bullets.includes(item)) {
        bullets.push(item);
      }
    }
  }
  return bullets.slice(0, DEFAULT_BULLET_COUNT);
}

function rankMeaningfulLines(extractedText: string): string[] {
  const candidates = splitIntoCandidateSentences(extractedText);
  if (candidates.length < 1) {
    return [];
  }
  const keyTerms = extractKeyTerms(extractedText).map((term) => term.toLowerCase());
  return candidates
    .map((line, index) => ({
      line,
      index,
      score: scoreCandidateLine(line, keyTerms),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, DEFAULT_BULLET_COUNT)
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.line);
}

function scoreCandidateLine(line: string, keyTerms: string[]): number {
  let score = Math.min(line.length, 160);
  if (line.length >= 24 && line.length <= 140) {
    score += 40;
  }
  if (/[A-Za-z가-힣]/.test(line)) {
    score += 20;
  }
  if (/리스트|구조|정의|예제|개요|특징|활용|구현|index|item|append|sort|class|function/i.test(line)) {
    score += 30;
  }
  for (const term of keyTerms) {
    if (term.length >= 3 && line.toLowerCase().includes(term)) {
      score += 12;
    }
  }
  if (/^\[Page \d+\]/i.test(line)) {
    score -= 20;
  }
  if (/^\d+$/.test(line)) {
    score -= 50;
  }
  return score;
}

function buildFallbackBullets(
  metadata: StudyMaterialMetadata,
  extractedLength: number,
  truncated: boolean,
): string[] {
  return [
    metadata.pageCount ? `The material spans ${metadata.pageCount} pages.` : null,
    `This upload was recognized as a ${metadata.kind} file.`,
    `The extracted body is ${extractedLength} characters long.`,
    truncated ? "Only a preview of the extracted text was stored, so use the source file for full review." : null,
  ].filter((value): value is string => Boolean(value));
}

function buildExtractedPreview(extractedText: string): string {
  if (!extractedText.trim()) {
    return "";
  }
  if (extractedText.length <= DEFAULT_PREVIEW_LIMIT) {
    return extractedText;
  }
  return `${extractedText.slice(0, DEFAULT_PREVIEW_LIMIT).trimEnd()}\n\n[Preview truncated]`;
}

function extractCodeExamples(extractedText: string): string[] {
  const candidates = extractedText
    .split(/\n+/)
    .map((line) => line.replace(/^\[Page \d+\]\s*/i, "").trim())
    .filter((line) => line.length > 0)
    .filter((line) =>
      /^(def |class |for |while |if |elif |else:|return |print\(|import |from )/i.test(line) ||
      /(append\(|len\(|range\(|\{.*\}|=\s*.+)/.test(line),
    );

  return dedupeSentenceOrder(candidates).slice(0, 5);
}

function normalizeCodeExamples(lines: string[] | undefined): string[] {
  if (!lines?.length) {
    return [];
  }

  return dedupeSentenceOrder(
    lines
      .map((line) => line.replace(/^\[Page \d+\]\s*/i, "").trim())
      .filter((line) => line.length > 0)
      .filter((line) => isCodeLikeDigestLine(line)),
  ).slice(0, 5);
}

function buildStudyGuideBullets(metadata: StudyMaterialMetadata): string[] {
  const bullets = [
    "Read the summary first, then check the original PDF for diagrams and worked examples.",
    metadata.pageCount ? `Skim key pages in the ${metadata.pageCount}-page source before memorizing details.` : null,
    "Test yourself by explaining the key terms without looking at the note.",
  ];
  return bullets.filter((value): value is string => Boolean(value));
}

function buildVisualHighlights(
  metadata: StudyMaterialMetadata,
  notionAttachments: NotionAttachment[],
): string[] {
  const imageCount = notionAttachments.filter((item) => item.type === "image").length;
  const bullets = [
    "Original PDF is attached so you can review the source layout directly in Notion.",
    imageCount > 0 ? `${imageCount} representative page preview image(s) were attached for faster scanning.` : null,
    metadata.pageCount ? `Focus on pages with diagrams, tables, or code examples while reviewing the source.` : null,
  ];
  return bullets.filter((value): value is string => Boolean(value));
}

function extractKeyTerms(extractedText: string): string[] {
  const matches = extractedText.match(/[A-Za-z0-9가-힣][A-Za-z0-9가-힣()\-_/]{2,}/g) ?? [];
  const counts = new Map<string, number>();
  for (const raw of matches) {
    const term = raw.trim();
    if (term.length < 3 || isLikelyNoise(term)) {
      continue;
    }
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ko"))
    .slice(0, 6)
    .map(([term]) => term);
}

function isLikelyNoise(term: string): boolean {
  const lowered = term.toLowerCase();
  if (/^\d+$/.test(term)) {
    return true;
  }
  return new Set([
    "page",
    "pages",
    "review",
    "file",
    "type",
    "path",
    "size",
    "bytes",
    "content",
    "study",
    "material",
  ]).has(lowered);
}

function toMeaningfulLines(extractedText: string): string[] {
  return extractedText
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 12)
    .filter((line) => !/^\[Page \d+\]$/.test(line))
    .map((line) => line.replace(/^\[Page \d+\]\s*/i, ""))
    .filter((line) => line.length >= 12)
    .slice(0, DEFAULT_BULLET_COUNT * 2);
}

function splitIntoCandidateSentences(extractedText: string): string[] {
  const normalized = extractedText
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 12)
    .map((line) => line.replace(/^\[Page \d+\]\s*/i, ""));

  const sentences: string[] = [];
  for (const line of normalized) {
    const split = line
      .split(/(?<=[.!?다요음])\s+|(?<=\.)\s+(?=[A-Z])/)
      .map((piece) => piece.trim())
      .filter((piece) => piece.length >= 12);
    if (split.length > 0) {
      sentences.push(...split);
    } else {
      sentences.push(line);
    }
  }

  return dedupeSentenceOrder(sentences).slice(0, 24);
}

function dedupeSentenceOrder(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(line);
  }
  return result;
}

function buildCollectionSummaryBullets(results: StudyMaterialIngestResult[]): string[] {
  const totalPages = results.reduce((sum, result) => sum + (result.metadata.pageCount ?? 0), 0);
  const totalChars = results.reduce((sum, result) => sum + result.extractedTextLength, 0);
  return [
    totalPages > 0 ? `Combined page count: ${totalPages}.` : null,
    `Combined extracted length: ${totalChars} characters.`,
    `Top file types: ${formatStudyMaterialKinds(results)}.`,
  ].filter((value): value is string => Boolean(value));
}

function describeStudyMaterial(result: StudyMaterialIngestResult): string {
  const pieces = [
    result.metadata.fileName,
    result.metadata.kind,
    result.metadata.pageCount ? `${result.metadata.pageCount} pages` : null,
    `${result.extractedTextLength} chars`,
    result.truncated ? "truncated" : null,
  ];
  return pieces.filter((piece): piece is string => Boolean(piece)).join(" | ");
}

function formatStudyMaterialKinds(results: StudyMaterialIngestResult[]): string {
  return Array.from(new Set(results.map((result) => result.metadata.kind))).join(", ");
}

function applyTextLimit(
  extractedText: string,
  maxLength: number,
): { extractedText: string; fullLength: number; truncated: boolean } {
  const fullLength = extractedText.length;
  if (fullLength <= maxLength) {
    return {
      extractedText,
      fullLength,
      truncated: false,
    };
  }

  const preview = extractedText.slice(0, maxLength).trimEnd();
  return {
    extractedText: `${preview}\n\n[Truncated]`,
    fullLength,
    truncated: true,
  };
}

async function extractPdfData(
  cfg: ResolvedPersonalAssistantConfig,
  filePath: string,
): Promise<{ text: string; pageCount: number; notionAttachments: NotionAttachment[] }> {
  const { getDocument, OPS } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const canvasApi = await import("@napi-rs/canvas");
  globalThis.Path2D = canvasApi.Path2D as typeof globalThis.Path2D;
  globalThis.ImageData = canvasApi.ImageData as typeof globalThis.ImageData;
  globalThis.DOMMatrix = canvasApi.DOMMatrix as typeof globalThis.DOMMatrix;
  const buffer = fs.readFileSync(filePath);
  const document = await getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    standardFontDataUrl: resolvePdfStandardFontDataUrl(),
  }).promise;

  try {
    const pageTexts: string[] = [];
    const pageImageScores: Array<{ pageNumber: number; imageOps: number }> = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const operatorList = await page.getOperatorList();
      let imageOps = 0;
      for (const fn of operatorList.fnArray) {
        if (
          fn === OPS.paintImageXObject ||
          fn === OPS.paintInlineImageXObject ||
          fn === OPS.paintImageMaskXObject
        ) {
          imageOps += 1;
        }
      }
      pageImageScores.push({ pageNumber, imageOps });
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) {
        pageTexts.push(`[Page ${pageNumber}] ${text}`);
      }
    }

    const previewPages = selectPreviewPages(document.numPages, pageImageScores);
    const previewDir = ensureDirectoryExists(
      path.join(path.dirname(resolveUserPath(cfg.storagePath)), "notion-previews"),
    );
    const previewAttachments: NotionAttachment[] = [];
    for (const pageNumber of previewPages) {
      try {
        const page = await document.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.25 });
        const canvas = canvasApi.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context, viewport }).promise;
        const outputPath = path.join(
          previewDir,
          `${sanitizeStem(path.parse(filePath).name)}-page-${pageNumber}.png`,
        );
        fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
        previewAttachments.push({
          type: "image",
          filePath: outputPath,
          caption: `PDF page ${pageNumber} preview`,
          useAsCover: previewAttachments.length === 0,
        });
      } catch {
        // Some PDFs contain canvas operations that @napi-rs/canvas cannot render.
        // Keep publishing the original PDF and text summary even when preview extraction fails.
      }
    }

    return {
      text: pageTexts.join("\n\n"),
      pageCount: document.numPages,
      notionAttachments: [
        {
          type: "pdf",
          filePath,
          caption: "Original PDF",
        },
        ...previewAttachments,
      ],
    };
  } finally {
    await document.destroy();
  }
}

function selectPreviewPages(
  totalPages: number,
  pageImageScores: Array<{ pageNumber: number; imageOps: number }>,
): number[] {
  if (totalPages <= DEFAULT_PDF_PREVIEW_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const picked = new Set<number>([1]);
  const ranked = [...pageImageScores]
    .sort((left, right) => right.imageOps - left.imageOps || left.pageNumber - right.pageNumber)
    .map((entry) => entry.pageNumber);

  for (const pageNumber of ranked) {
    if (picked.size >= DEFAULT_PDF_PREVIEW_PAGES) {
      break;
    }
    picked.add(pageNumber);
  }

  return Array.from(picked).sort((left, right) => left - right);
}

function sanitizeStem(value: string): string {
  return value.replace(/[^\w.-]+/g, "_");
}

function resolvePdfStandardFontDataUrl(): string {
  const fontsDir = path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts");
  return `${pathToFileURL(fontsDir).href.replace(/\/?$/, "/")}`;
}

type AiStudyDigest = {
  summaryTitle?: string;
  summaryOverview?: string;
  summaryBullets?: string[];
  keyTerms?: string[];
  studyGuideBullets?: string[];
  codeExamples?: string[];
  visualHighlights?: string[];
};

async function generateAiStudyDigest(
  cfg: ResolvedPersonalAssistantConfig,
  metadata: StudyMaterialMetadata,
  extractedText: string,
  extractedPreview: string,
): Promise<AiStudyDigest | null> {
  const model = cfg.uploads?.aiSummary?.model?.trim() || "au.anthropic.claude-sonnet-4-6";
  const region = readAiSummaryRegion(cfg);
  const maxInputCharacters = cfg.uploads?.aiSummary?.maxInputCharacters ?? DEFAULT_AI_INPUT_LIMIT;
  const sourceText = extractedText.slice(0, maxInputCharacters).trim() || extractedPreview.trim();
  if (!sourceText) {
    return null;
  }

  const client = new BedrockRuntimeClient({ region });
  const prompts = [
    buildAiDigestPrompt(metadata, sourceText, "full"),
    buildAiDigestPrompt(metadata, sourceText, "compact"),
  ];

  let lastFailure = "unknown";
  for (const prompt of prompts) {
    try {
      const response = await client.send(
        new ConverseCommand({
          modelId: model,
          inferenceConfig: {
            maxTokens: DEFAULT_AI_MAX_TOKENS,
            temperature: 0.2,
          },
          system: [
            {
              text:
                "You create clean study notes for Notion. Return strict JSON only. Do not use Markdown fences. Keep every field short and revision-friendly. Prefer Korean when the source is mostly Korean.",
            },
          ],
          messages: [
            {
              role: "user",
              content: [{ text: prompt }],
            },
          ],
        }),
      );

      const raw = readConverseText(response.output?.message?.content);
      if (!raw) {
        lastFailure = "empty-response";
        continue;
      }

      const parsed = parseAiDigestJson(raw);
      if (parsed) {
        return parsed;
      }

      const stopReason =
        typeof response.stopReason === "string" ? response.stopReason : "unknown-stop";
      lastFailure = `invalid-json (${stopReason})`;
    } catch (error) {
      lastFailure = formatAiSummaryError(error);
    }
  }

  console.warn(
    `[personal-assistant] AI summary fallback for ${metadata.fileName}: ${lastFailure}`,
  );
  return null;
}

function buildAiDigestPrompt(
  metadata: StudyMaterialMetadata,
  sourceText: string,
  mode: "full" | "compact",
): string {
  const baseLines = [
    `File name: ${metadata.fileName}`,
    `File kind: ${metadata.kind}`,
    metadata.pageCount ? `Page count: ${metadata.pageCount}` : null,
    "",
    "Return strict JSON only with these keys:",
    'summaryTitle: string (max 36 Korean chars)',
    'summaryOverview: string (1-2 sentences, max 140 chars)',
  ];

  const fullLines = [
    'summaryBullets: string[] (exactly 4, short factual bullets)',
    'keyTerms: string[] (exactly 5, terms only, no explanations)',
    'studyGuideBullets: string[] (exactly 4, short revision actions)',
    'codeExamples: string[] (0-2, exact short snippets only)',
    'visualHighlights: string[] (exactly 3, short notes about diagrams/tables/pages)',
    "",
    "Keep every item short. Avoid repeating the same idea. If code is not present, return an empty array for codeExamples.",
  ];

  const compactLines = [
    'summaryBullets: string[] (exactly 3, short factual bullets)',
    'keyTerms: string[] (exactly 4, terms only)',
    'studyGuideBullets: string[] (exactly 3, short revision actions)',
    'codeExamples: string[] (0-1, exact short snippet only)',
    'visualHighlights: string[] (exactly 2, short notes only if inferable)',
    "",
    "Use fewer words than usual. Keep the whole JSON compact enough to fit within a short response.",
  ];

  return [...baseLines, ...(mode === "full" ? fullLines : compactLines), "", "Source text:", sourceText]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function formatAiSummaryError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return String(error);
}

function readConverseText(
  content:
    | Array<{
        text?: string;
      }>
    | undefined,
): string {
  if (!content?.length) {
    return "";
  }
  return content
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();
}

function parseAiDigestJson(raw: string): AiStudyDigest | null {
  const normalized = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(normalized) as Record<string, unknown>;
    return {
      summaryTitle: asString(parsed.summaryTitle),
      summaryOverview: asString(parsed.summaryOverview),
      summaryBullets: asStringArray(parsed.summaryBullets, 5),
      keyTerms: asStringArray(parsed.keyTerms, 8),
      studyGuideBullets: asStringArray(parsed.studyGuideBullets, 5),
      codeExamples: asStringArray(parsed.codeExamples, 4),
      visualHighlights: asStringArray(parsed.visualHighlights, 4),
    };
  } catch {
    return null;
  }
}

function buildDetailedNotes(result: StudyMaterialIngestResult): string[] {
  const candidates = splitIntoCandidateSentences(result.extractedPreview)
    .filter((line) => !isCodeLikeDigestLine(line))
    .filter((line) => line.length >= 18)
    .filter((line) => !result.summaryBullets.some((bullet) => line.includes(bullet) || bullet.includes(line)));

  return dedupeSentenceOrder(candidates).slice(0, DEFAULT_DETAILED_NOTE_COUNT);
}

function isCodeLikeDigestLine(line: string): boolean {
  return (
    /^(def |class |for |while |if |elif |else:|return |print\(|import |from )/i.test(line) ||
    /(append\(|len\(|range\(|\{|\}|\[|\]|=\s*.+)/.test(line)
  );
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown, maxItems: number): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
  return items.length > 0 ? items : undefined;
}

async function extractHwpText(filePath: string): Promise<string> {
  const { toMarkdown } = await import("@ohah/hwpjs");
  const buffer = fs.readFileSync(filePath);
  const result = toMarkdown(buffer, {
    image: "blob",
    use_html: false,
    include_page_info: true,
  });
  return normalizeExtractedText(result.markdown);
}

function normalizeExtractedText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
