import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { PortalItem, PortalSnapshot } from "./types.js";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS portal_items (
  item_key TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  course_name TEXT,
  due_text TEXT,
  due_at TEXT,
  remaining_minutes INTEGER,
  status TEXT,
  submit_type TEXT,
  detail_url TEXT,
  progress_text TEXT,
  raw_json TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  completed_at TEXT
);
`;

export class PersonalAssistantStateDb {
  private readonly db: DatabaseSync;

  constructor(private readonly dbPath: string) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(SCHEMA_SQL);
  }

  close(): void {
    this.db.close();
  }

  getPath(): string {
    return this.dbPath;
  }

  upsertSnapshot(snapshot: PortalSnapshot): void {
    const stmt = this.db.prepare(`
      INSERT INTO portal_items (
        item_key,
        item_type,
        title,
        course_name,
        due_text,
        due_at,
        remaining_minutes,
        status,
        submit_type,
        detail_url,
        progress_text,
        raw_json,
        last_seen_at,
        completed_at
      ) VALUES (
        :item_key,
        :item_type,
        :title,
        :course_name,
        :due_text,
        :due_at,
        :remaining_minutes,
        :status,
        :submit_type,
        :detail_url,
        :progress_text,
        :raw_json,
        :last_seen_at,
        :completed_at
      )
      ON CONFLICT(item_key) DO UPDATE SET
        item_type = excluded.item_type,
        title = excluded.title,
        course_name = excluded.course_name,
        due_text = excluded.due_text,
        due_at = excluded.due_at,
        remaining_minutes = excluded.remaining_minutes,
        status = excluded.status,
        submit_type = excluded.submit_type,
        detail_url = excluded.detail_url,
        progress_text = excluded.progress_text,
        raw_json = excluded.raw_json,
        last_seen_at = excluded.last_seen_at,
        completed_at = excluded.completed_at
    `);

    const persist = (item: PortalItem) =>
      stmt.run({
        item_key: item.key,
        item_type: item.type,
        title: item.title,
        course_name: item.courseName,
        due_text: item.dueText,
        due_at: item.dueAt,
        remaining_minutes: item.remainingMinutes,
        status: item.status,
        submit_type: item.submitType,
        detail_url: item.detailUrl,
        progress_text: item.progressText,
        raw_json: JSON.stringify(item.raw),
        last_seen_at: snapshot.syncedAt,
        completed_at: isCompleted(item) ? snapshot.syncedAt : null,
      });

    for (const item of snapshot.assignments) {
      persist(item);
    }
    for (const item of snapshot.videos) {
      persist(item);
    }
  }

  listPendingVideos(limit = 20): PortalItem[] {
    const rows = this.db
      .prepare(
        `
          SELECT
            item_key,
            item_type,
            title,
            course_name,
            due_text,
            due_at,
            remaining_minutes,
            status,
            submit_type,
            detail_url,
            progress_text,
            raw_json
          FROM portal_items
          WHERE item_type = 'video'
            AND completed_at IS NULL
          ORDER BY
            CASE WHEN remaining_minutes IS NULL THEN 1 ELSE 0 END,
            remaining_minutes ASC,
            title ASC
          LIMIT ?
        `,
      )
      .all(limit) as Array<Record<string, unknown>>;

    return rows.map(hydratePortalItem);
  }
}

function hydratePortalItem(row: Record<string, unknown>): PortalItem {
  return {
    key: String(row.item_key),
    type: row.item_type === "assignment" ? "assignment" : "video",
    title: String(row.title),
    courseName: coerceNullableString(row.course_name),
    dueText: coerceNullableString(row.due_text),
    dueAt: coerceNullableString(row.due_at),
    remainingMinutes: coerceNullableNumber(row.remaining_minutes),
    status: coerceNullableString(row.status),
    submitType: coerceNullableString(row.submit_type),
    detailUrl: coerceNullableString(row.detail_url),
    progressText: coerceNullableString(row.progress_text),
    raw: parseRaw(row.raw_json),
  };
}

function parseRaw(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {}
  return {};
}

function coerceNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function coerceNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isCompleted(item: PortalItem): boolean {
  const raw = item.status ?? item.progressText ?? "";
  const status = raw.toLowerCase();
  return (
    status.includes("complete") ||
    status.includes("completed") ||
    status.includes("100%") ||
    raw.includes("완료")
  );
}
