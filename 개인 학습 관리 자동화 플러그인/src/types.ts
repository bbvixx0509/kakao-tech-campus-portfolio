export type PortalItemType = "assignment" | "video";
export type NotionPublishTemplate = "note" | "assignment" | "lecture";
export type StudyMaterialKind =
  | "text"
  | "markdown"
  | "json"
  | "csv"
  | "pdf"
  | "hwp"
  | "unknown";

export interface PortalItem {
  key: string;
  type: PortalItemType;
  title: string;
  courseName: string | null;
  dueText: string | null;
  dueAt: string | null;
  remainingMinutes: number | null;
  status: string | null;
  submitType: string | null;
  detailUrl: string | null;
  progressText: string | null;
  raw: Record<string, unknown>;
}

export interface PortalSnapshot {
  assignments: PortalItem[];
  videos: PortalItem[];
  syncedAt: string;
}

export interface NotionPublishRequest {
  title: string;
  content: string;
  template: NotionPublishTemplate;
  parentPageId?: string;
  icon?: string;
  bullets?: string[];
  sourceUrl?: string;
  attachments?: NotionAttachment[];
}

export interface NotionPublishResult {
  pageId: string;
  url: string;
  uploadedAttachmentCount?: number;
}

export interface NotionAttachment {
  type: "image" | "pdf";
  filePath: string;
  caption?: string;
  useAsCover?: boolean;
}

export interface MorningReportDraft {
  title: string;
  text: string;
  notionContent: string;
  bullets: string[];
  daysAhead: number;
  assignmentTotal: number;
  videoTotal: number;
  assignments: PortalItem[];
  videos: PortalItem[];
  backlogAssignments: PortalItem[];
  backlogVideos: PortalItem[];
}

export interface StudyMaterialMetadata {
  filePath: string;
  fileName: string;
  sizeBytes: number;
  kind: StudyMaterialKind;
  pageCount?: number;
}

export interface StudyMaterialIngestResult {
  metadata: StudyMaterialMetadata;
  extractedText: string;
  extractedTextLength: number;
  truncated: boolean;
  warnings: string[];
  summaryText: string;
  summaryTitle: string;
  summaryBullets: string[];
  keyTerms: string[];
  summaryOverview?: string;
  studyGuideBullets?: string[];
  codeExamples?: string[];
  visualHighlights?: string[];
  aiEnhanced?: boolean;
  extractedPreview: string;
  notionAttachments: NotionAttachment[];
}
