import path from "node:path";
import { chromium, type BrowserContext, type Frame, type Page } from "playwright-core";
import type { ResolvedPersonalAssistantConfig, SchoolPortalConfig } from "./config.js";
import { ensureDirectoryExists } from "./config.js";
import { calculateRemainingMinutes, formatRemaining, parseKoreanDateLike } from "./time.js";
import type { PortalItem, PortalSnapshot } from "./types.js";

type Target = Page | Frame;

export class SchoolPortalClient {
  constructor(
    private readonly appConfig: ResolvedPersonalAssistantConfig,
    private readonly portalConfig: SchoolPortalConfig,
  ) {}

  async syncPortalSnapshot(): Promise<PortalSnapshot> {
    const context = await this.launchContext();
    try {
      const page = await this.ensureReadyPage(context);
      this.attachDialogAutoAccept(page);
      await this.ensureLoggedIn(page);

      const assignments = await this.readList(page, "assignment");
      const videos = await this.readList(page, "video");

      return {
        assignments,
        videos,
        syncedAt: new Date().toISOString(),
      };
    } finally {
      await context.close();
    }
  }

  private async ensureLoggedIn(page: Page): Promise<void> {
    await page.goto(this.portalConfig.loginUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });

    if (await this.isReady(page)) {
      return;
    }

    if (this.portalConfig.loginSubmitSelector) {
      await this.waitForLoginCryptoReady(page);
      await this.primeAutofilledLoginForm(page);
      await this.clickIfVisible(page, this.portalConfig.loginSubmitSelector);
      if (await this.waitForReady(page, 8_000)) {
        return;
      }

      if (
        this.portalConfig.postLoginLandingUrl &&
        page.url().includes("/oauth/null")
      ) {
        await page.goto(this.portalConfig.postLoginLandingUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
      }

      if (this.portalConfig.postLoginShortcutSelector) {
        const completed = await this.followPostLoginShortcuts(page, 45_000);
        if (completed) {
          return;
        }
      }

      if (await this.waitForReady(page, 20_000)) {
        return;
      }
    }

    const screenshotPath = await this.captureDebugScreenshot(page, "login-state");
    const bodyPreview = await this.captureBodyPreview(page);
    throw new Error(
      [
        `School portal session is not authenticated at ${page.url()}.`,
        `Ready selector: ${this.portalConfig.readySelector}.`,
        "Open the configured browser profile, sign in manually once, then run again.",
        bodyPreview ? `Body preview: ${bodyPreview}` : "",
        `Screenshot: ${screenshotPath}.`,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  private async primeAutofilledLoginForm(page: Page): Promise<void> {
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      for (const input of inputs) {
        const element = input as HTMLInputElement;
        if (!element.value) {
          continue;
        }
        element.focus();
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.blur();
      }
    });
    await page.waitForTimeout(300);
  }

  private async waitForLoginCryptoReady(page: Page): Promise<void> {
    try {
      await page.waitForFunction(
        () =>
          typeof (window as Window & { _public_key?: string })._public_key === "string" &&
          Boolean((window as Window & { _public_key?: string })._public_key),
        undefined,
        { timeout: 15_000 },
      );
    } catch {
      // Best-effort for portals that encrypt the login form client-side.
    }
  }

  private async readList(page: Page, type: "assignment" | "video"): Promise<PortalItem[]> {
    const listConfig = type === "assignment" ? this.portalConfig.assignments : this.portalConfig.videos;
    const items: PortalItem[] = [];

    for (const source of resolvePageSources(listConfig)) {
      await page.goto(source.pageUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
      const target = await this.resolveListTarget(page, {
        listType: type,
        sourceUrl: source.pageUrl,
        cardSelector: listConfig.card,
        titleSelector: listConfig.title,
      });

      const rows = await target.locator(listConfig.card).evaluateAll(
        (cards, selectors) =>
          cards.map((card) => ({
            rowText: card.textContent?.trim() ?? null,
            title: selectors.title ? card.querySelector(selectors.title)?.textContent?.trim() ?? null : null,
            courseName: selectors.course
              ? card.querySelector(selectors.course)?.textContent?.trim() ?? null
              : null,
            dueText: selectors.dueText
              ? card.querySelector(selectors.dueText)?.textContent?.trim() ?? null
              : null,
            status: selectors.status
              ? card.querySelector(selectors.status)?.textContent?.trim() ?? null
              : null,
            detailUrl: selectors.detailLink
              ? (card.querySelector(selectors.detailLink) as HTMLAnchorElement | null)?.href ?? null
              : null,
            submitType: selectors.submitType
              ? card.querySelector(selectors.submitType)?.textContent?.trim() ?? null
              : null,
            progressText: selectors.progressText
              ? card.querySelector(selectors.progressText)?.textContent?.trim() ?? null
              : null,
          })),
        listConfig,
      );

      const filteredRows = rows.filter((row) =>
        matchesRowFilters(row.rowText, listConfig.includePattern, listConfig.excludePattern),
      );
      const titledRows = filteredRows.filter((row) => row.title);
      if (filteredRows.length > 0 && titledRows.length < 1) {
        const screenshotPath = await this.captureDebugScreenshot(page, `${type}-title-selector`);
        throw new Error(
          [
            `Selector mismatch on ${type} list ${source.pageUrl}.`,
            `Card selector "${listConfig.card}" matched ${rows.length} rows,`,
            `but title selector "${listConfig.title}" returned no text after filtering.`,
            filteredRows.length !== rows.length
              ? `Rows after include/exclude filters: ${filteredRows.length}.`
              : "",
            `Screenshot: ${screenshotPath}.`,
          ]
            .filter(Boolean)
            .join(" "),
        );
      }

      const mapped = titledRows.map((row) => {
        const courseName = row.courseName ?? source.courseNameOverride ?? null;
        const detailUrl = normalizeUrl(row.detailUrl, source.pageUrl);
        const dueAt = parseKoreanDateLike(row.dueText);
        const remainingMinutes = calculateRemainingMinutes(dueAt);

        return {
          key: buildPortalItemKey(type, courseName, row.title ?? "", detailUrl, row.dueText),
          type,
          title: row.title ?? "",
          courseName,
          dueText: row.dueText,
          dueAt,
          remainingMinutes,
          status: row.status,
          submitType: row.submitType,
          detailUrl,
          progressText: row.progressText,
          raw: {
            ...row,
            pageUrl: source.pageUrl,
            relativeTime: formatRemaining(remainingMinutes),
          },
        } satisfies PortalItem;
      });

      items.push(...mapped);
    }

    return items;
  }

  private async resolveListTarget(
    page: Page,
    options: {
      listType: "assignment" | "video";
      sourceUrl: string;
      cardSelector: string;
      titleSelector?: string;
    },
  ): Promise<Target> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < 30_000) {
      if ((await page.locator(options.cardSelector).count().catch(() => 0)) > 0) {
        return page;
      }

      for (const frame of page.frames()) {
        if ((await frame.locator(options.cardSelector).count().catch(() => 0)) > 0) {
          return frame;
        }
      }

      await page.waitForTimeout(1_000);
    }

    const diagnostics = await this.collectListDiagnostics(page, options);
    const screenshotPath = await this.captureDebugScreenshot(page, `${options.listType}-list`);
    const frameSummary =
      diagnostics.frames.length > 0
        ? diagnostics.frames
            .map(
              (frame, index) =>
                `frame${index + 1} cards=${frame.cardCount} titles=${frame.titleCount} url=${frame.url}`,
            )
            .join("; ")
        : "no frames";

    throw new Error(
      [
        `Timed out waiting for ${options.listType} card selector "${options.cardSelector}" on ${options.sourceUrl}.`,
        `Page counts: cards=${diagnostics.page.cardCount}, titles=${diagnostics.page.titleCount}.`,
        `Frame counts: ${frameSummary}.`,
        diagnostics.bodyPreview ? `Body preview: ${diagnostics.bodyPreview}` : "",
        `Screenshot: ${screenshotPath}.`,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  private async launchContext(): Promise<BrowserContext> {
    const browser = this.portalConfig.browser ?? {};
    const userDataDir = browser.userDataDir
      ? expandHome(browser.userDataDir)
      : path.join(path.dirname(this.appConfig.storagePath), "browser-profile");
    ensureDirectoryExists(userDataDir);

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: browser.headless ?? false,
      channel: browser.channel,
      executablePath: browser.executablePath ? expandHome(browser.executablePath) : undefined,
      args: browser.launchArgs,
      slowMo: browser.slowMoMs,
      viewport: { width: 1440, height: 900 },
    });
    context.on("page", (page) => this.attachDialogAutoAccept(page));
    return context;
  }

  private async ensureReadyPage(context: BrowserContext): Promise<Page> {
    return context.pages()[0] ?? context.newPage();
  }

  private async waitForReady(page: Page, timeoutMs: number): Promise<boolean> {
    try {
      await page.locator(this.portalConfig.readySelector).first().waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async isReady(page: Page): Promise<boolean> {
    return this.waitForReady(page, 5_000);
  }

  private async clickIfVisible(target: Target, selector: string | string[] | undefined): Promise<boolean> {
    for (const candidate of toSelectorList(selector)) {
      const locator = target.locator(candidate).first();
      if ((await locator.count()) < 1) {
        continue;
      }
      if (!(await locator.isVisible())) {
        continue;
      }
      await locator.click();
      return true;
    }
    return false;
  }

  private async followPostLoginShortcuts(page: Page, timeoutMs: number): Promise<boolean> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (await this.isReady(page)) {
        return true;
      }
      await this.clickIfVisible(page, this.portalConfig.postLoginShortcutSelector);
      await page.waitForTimeout(1_500);
    }
    return this.isReady(page);
  }

  private async captureDebugScreenshot(page: Page, key: string): Promise<string> {
    const dirPath = ensureDirectoryExists(path.join(this.appConfig.debugOutputDir, "screenshots"));
    const filename = `${Date.now()}-${sanitizeForFileName(key)}.png`;
    const fullPath = path.join(dirPath, filename);
    await page.screenshot({ path: fullPath, fullPage: true }).catch(() => {});
    return fullPath;
  }

  private async captureBodyPreview(page: Page): Promise<string> {
    const bodyText = await page.locator("body").textContent().catch(() => null);
    return sanitizePreviewText(bodyText);
  }

  private async collectListDiagnostics(
    page: Page,
    options: {
      cardSelector: string;
      titleSelector?: string;
    },
  ): Promise<{
    page: { cardCount: number; titleCount: number };
    frames: Array<{ url: string; cardCount: number; titleCount: number }>;
    bodyPreview: string;
  }> {
    const titleSelector = options.titleSelector ?? options.cardSelector;
    const pageCardCount = await page.locator(options.cardSelector).count().catch(() => 0);
    const pageTitleCount = await page.locator(titleSelector).count().catch(() => 0);
    const frames: Array<{ url: string; cardCount: number; titleCount: number }> = [];

    for (const frame of page.frames()) {
      frames.push({
        url: frame.url(),
        cardCount: await frame.locator(options.cardSelector).count().catch(() => 0),
        titleCount: await frame.locator(titleSelector).count().catch(() => 0),
      });
    }

    return {
      page: {
        cardCount: pageCardCount,
        titleCount: pageTitleCount,
      },
      frames,
      bodyPreview: await this.captureBodyPreview(page),
    };
  }

  private attachDialogAutoAccept(page: Page): void {
    const tagged = page as Page & { __studyWorkflowDialogHooked?: boolean };
    if (tagged.__studyWorkflowDialogHooked) {
      return;
    }
    tagged.__studyWorkflowDialogHooked = true;
    page.on("dialog", async (dialog) => {
      try {
        await dialog.accept();
      } catch {
        // Dialog auto-accept is best-effort.
      }
    });
  }
}

function matchesRowFilters(
  rowText: string | null,
  includePattern?: string,
  excludePattern?: string,
): boolean {
  const text = rowText ?? "";
  if (includePattern) {
    const include = new RegExp(includePattern, "i");
    if (!include.test(text)) {
      return false;
    }
  }
  if (excludePattern) {
    const exclude = new RegExp(excludePattern, "i");
    if (exclude.test(text)) {
      return false;
    }
  }
  return true;
}

export function buildPortalSummary(snapshot: PortalSnapshot): string {
  const assignmentLines = snapshot.assignments
    .map((item) => `- ${formatPortalLine(item)}`)
    .join("\n");
  const lectureLines = snapshot.videos.map((item) => `- ${formatPortalLine(item)}`).join("\n");

  return [
    `Assignments (${snapshot.assignments.length})`,
    assignmentLines || "- none found",
    "",
    `Lecture items (${snapshot.videos.length})`,
    lectureLines || "- none found",
  ].join("\n");
}

function formatPortalLine(item: PortalItem): string {
  const pieces = [
    item.courseName ?? "Unknown course",
    item.title,
    item.dueText ? `due ${item.dueText}` : null,
    item.remainingMinutes != null ? formatRemaining(item.remainingMinutes) : null,
    item.submitType ? `submit ${item.submitType}` : null,
    item.status ? `status ${item.status}` : null,
    item.progressText ? `progress ${item.progressText}` : null,
  ].filter(Boolean);
  return pieces.join(" | ");
}

function buildPortalItemKey(
  type: string,
  courseName: string | null,
  title: string,
  detailUrl: string | null,
  dueText: string | null,
): string {
  return [type, detailUrl ?? "", courseName ?? "", title, dueText ?? ""]
    .join("|")
    .trim()
    .toLowerCase();
}

function toSelectorList(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function resolvePageSources(listConfig: {
  pageUrl?: string;
  pageUrls?: string[];
  sources?: Array<{ pageUrl: string; courseNameOverride?: string }>;
}): Array<{ pageUrl: string; courseNameOverride?: string }> {
  if (Array.isArray(listConfig.sources) && listConfig.sources.length > 0) {
    return listConfig.sources;
  }
  if (Array.isArray(listConfig.pageUrls) && listConfig.pageUrls.length > 0) {
    return listConfig.pageUrls.map((pageUrl) => ({ pageUrl }));
  }
  if (listConfig.pageUrl) {
    return [{ pageUrl: listConfig.pageUrl }];
  }
  throw new Error("Portal list config needs pageUrl, pageUrls, or sources.");
}

function normalizeUrl(candidate: string | null, pageUrl: string): string | null {
  if (!candidate) {
    return null;
  }
  try {
    return new URL(candidate, pageUrl).toString();
  } catch {
    return candidate;
  }
}

function expandHome(inputPath: string): string {
  return inputPath.startsWith("~/")
    ? path.join(process.env.HOME || process.env.USERPROFILE || "", inputPath.slice(2))
    : inputPath;
}

function sanitizeForFileName(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

function sanitizePreviewText(input: string | null | undefined): string {
  if (!input) {
    return "";
  }
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= 320) {
    return normalized;
  }
  return `${normalized.slice(0, 317)}...`;
}
