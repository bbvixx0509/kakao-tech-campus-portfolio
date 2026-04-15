import { describe, expect, it } from "vitest";
import { calculateRemainingMinutes, formatRemaining, parseKoreanDateLike } from "./time.js";

describe("parseKoreanDateLike", () => {
  it("parses dotted date formats", () => {
    const value = parseKoreanDateLike("2026.04.05 23:59");
    expect(value).not.toBeNull();
  });

  it("parses Korean AM/PM formats", () => {
    const value = parseKoreanDateLike("2026년 4월 5일 오후 3:20");
    expect(value).not.toBeNull();
  });
});

describe("remaining formatting", () => {
  it("formats future durations", () => {
    expect(formatRemaining(180)).toBe("3h left");
  });

  it("formats overdue durations", () => {
    expect(formatRemaining(-60)).toBe("1h overdue");
  });

  it("calculates remaining minutes", () => {
    const dueAt = new Date("2026-04-06T00:00:00.000Z").toISOString();
    const now = new Date("2026-04-05T23:00:00.000Z");
    expect(calculateRemainingMinutes(dueAt, now)).toBe(60);
  });
});
