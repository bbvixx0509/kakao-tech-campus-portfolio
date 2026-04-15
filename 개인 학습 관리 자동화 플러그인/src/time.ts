function clampToNull(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return value;
}

export function parseKoreanDateLike(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }
  const deadlineSlice = extractDeadlineSlice(input);
  const relativeKorean = parseYearlessKoreanDate(deadlineSlice ?? input);
  if (relativeKorean) {
    return relativeKorean;
  }

  const cleaned = input
    .replace(/\s+/g, " ")
    .replace(/년/g, "-")
    .replace(/월/g, "-")
    .replace(/일/g, " ")
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .replace(/오전/g, "AM")
    .replace(/오후/g, "PM")
    .replace(/마감|까지|due|deadline/gi, " ")
    .trim();

  const ampmMatch = cleaned.match(
    /(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+)?(AM|PM)\s*(\d{1,2})(?::(\d{2}))?/i,
  );
  if (ampmMatch) {
    const [, year, month, day, meridiem, hourText, minuteText] = ampmMatch;
    let hour = Number(hourText);
    if (meridiem.toUpperCase() === "PM" && hour < 12) {
      hour += 12;
    }
    if (meridiem.toUpperCase() === "AM" && hour === 12) {
      hour = 0;
    }
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hour,
      Number(minuteText ?? "0"),
      0,
      0,
    );
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const twentyFourHourMatch = cleaned.match(
    /(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2})(?::(\d{2}))?)?/,
  );
  if (twentyFourHourMatch) {
    const [, year, month, day, hourText, minuteText] = twentyFourHourMatch;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hourText ?? "23"),
      Number(minuteText ?? "59"),
      0,
      0,
    );
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const native = Date.parse(cleaned);
  if (!Number.isNaN(native)) {
    return new Date(native).toISOString();
  }

  return null;
}

function extractDeadlineSlice(input: string): string | null {
  const deadlineMatch = input.match(/마감[^|]*/);
  return deadlineMatch?.[0]?.trim() ?? null;
}

function parseYearlessKoreanDate(input: string): string | null {
  const match = input.match(
    /(\d{1,2})월\s*(\d{1,2})일(?:\s*(오전|오후|AM|PM))?\s*(\d{1,2})?(?::(\d{2}))?/i,
  );
  if (!match) {
    return null;
  }

  const now = new Date();
  const [, monthText, dayText, meridiem, hourText, minuteText] = match;
  let hour = Number(hourText ?? "23");
  const minute = Number(minuteText ?? "59");
  if (meridiem) {
    const upper = meridiem.toUpperCase();
    if ((upper === "오후" || upper === "PM") && hour < 12) {
      hour += 12;
    }
    if ((upper === "오전" || upper === "AM") && hour === 12) {
      hour = 0;
    }
  }

  const month = Number(monthText) - 1;
  const day = Number(dayText);
  let year = now.getFullYear();
  let candidate = new Date(year, month, day, hour, minute, 0, 0);

  // If the parsed date is far in the past, assume the next academic year edge.
  if (candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 120) {
    year += 1;
    candidate = new Date(year, month, day, hour, minute, 0, 0);
  }

  return Number.isNaN(candidate.getTime()) ? null : candidate.toISOString();
}

export function calculateRemainingMinutes(dueAt: string | null, now = new Date()): number | null {
  if (!dueAt) {
    return null;
  }
  const millis = new Date(dueAt).getTime() - now.getTime();
  return clampToNull(Math.round(millis / 60000));
}

export function formatRemaining(minutes: number | null): string {
  if (minutes == null) {
    return "unknown";
  }
  if (minutes < 0) {
    const overdue = Math.abs(minutes);
    if (overdue < 60) {
      return `${overdue}m overdue`;
    }
    if (overdue < 1440) {
      return `${Math.floor(overdue / 60)}h overdue`;
    }
    return `${Math.floor(overdue / 1440)}d overdue`;
  }
  if (minutes < 60) {
    return `${minutes}m left`;
  }
  if (minutes < 1440) {
    return `${Math.floor(minutes / 60)}h left`;
  }
  return `${Math.floor(minutes / 1440)}d left`;
}
