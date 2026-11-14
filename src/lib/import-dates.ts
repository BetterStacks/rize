// Turns the date strings that resume parsers, LinkedIn and the profile chat
// hand us into Dates we can store. Pure: no imports, no I/O.
//
// Never fall back to `new Date(string)`. V8 reads "Sep 21" and "09/21" as
// 21 September 2001, which is how imported jobs ended up in 2001.
//
// Rules:
// - Two-digit years are 20xx when they are at most the current two-digit year
//   plus one, otherwise 19xx ("Sep 21" is Sep 2021, "Jun 98" is Jun 1998).
// - "Present", "current", "now" and the like mean an open end date: the end is
//   null and currentlyWorking is true.
// - Anything we can't read, years before 1960, starts in the future, ends more
//   than ten years out, and ends before the start become null. A missing date
//   is better than a wrong one.
// - Dates are built in UTC (the first of the month unless a day is given), and
//   the profile renders them in UTC, so the month shown is the month parsed.

export const MIN_YEAR = 1960;
const MAX_YEARS_AHEAD = 10;

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const SEASONS: Record<string, number> = {
  spring: 2,
  summer: 5,
  fall: 8,
  autumn: 8,
  winter: 11,
};

const PRESENT = /^(present|current|currently|now|ongoing|today|till date|till now|to date|until now)$/i;

export function isPresentToken(value: unknown): boolean {
  return typeof value === "string" && PRESENT.test(value.trim().replace(/\.$/, ""));
}

/** Two-digit years: 20xx up to next year's two digits, otherwise 19xx. */
export function expandTwoDigitYear(yy: number, now: Date = new Date()): number {
  const pivot = (now.getUTCFullYear() % 100) + 1;
  return yy <= pivot ? 2000 + yy : 1900 + yy;
}

function toYear(raw: string, now: Date): number {
  const n = parseInt(raw, 10);
  return raw.length <= 2 ? expandTwoDigitYear(n, now) : n;
}

function build(year: number, month: number, day: number, now: Date): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  if (year < MIN_YEAR || year > now.getUTCFullYear() + MAX_YEARS_AHEAD) return null;
  const date = new Date(Date.UTC(year, month, day));
  // Rejects 31 February and the like instead of rolling into March.
  if (date.getUTCMonth() !== month) return null;
  return date;
}

function parseString(input: string, now: Date): Date | null {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ");
  if (!s) return null;

  let m: RegExpMatchArray | null;

  // 2021, 2021-09, 2021/09, 2021-09-15, 2021-09-15T00:00:00Z
  if ((m = s.match(/^(\d{4})$/))) return build(+m[1], 0, 1, now);
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})$/))) return build(+m[1], +m[2] - 1, 1, now);
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[t ][\d:.]+(?:z|[+-]\d{2}:?\d{2})?)?$/))) {
    return build(+m[1], +m[2] - 1, +m[3], now);
  }

  // '21
  if ((m = s.match(/^'(\d{2})$/))) return build(expandTwoDigitYear(+m[1], now), 0, 1, now);

  // 09/2021, 9/21, 09-2021, 09.21
  if ((m = s.match(/^(\d{1,2})[-/.](\d{4}|\d{2})$/))) return build(toYear(m[2], now), +m[1] - 1, 1, now);

  // 15/09/2021 or 09/15/2021. When both parts could be the month we can't
  // tell which is which, so keep only the year.
  if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})$/))) {
    const a = +m[1];
    const b = +m[2];
    const year = toYear(m[3], now);
    if (a > 12 && b <= 12) return build(year, b - 1, 1, now);
    if (b > 12 && a <= 12) return build(year, a - 1, 1, now);
    return build(year, 0, 1, now);
  }

  // Sep 2021, Sept. 2021, September, 2021, Sep '21, Sep 21, Sep-21, Summer 2021
  if ((m = s.match(/^([a-z]+)\.?[ ,\-/]*'?(\d{4}|\d{2})$/))) {
    const word = m[1];
    const month = MONTHS[word] ?? SEASONS[word];
    if (month === undefined) return null;
    return build(toYear(m[2], now), month, 1, now);
  }

  // 15 Sep 2021, Sep 15, 2021
  if ((m = s.match(/^(\d{1,2}) ([a-z]+)\.?,? (\d{4})$/))) {
    const month = MONTHS[m[2]];
    return month === undefined ? null : build(+m[3], month, +m[1], now);
  }
  if ((m = s.match(/^([a-z]+)\.? (\d{1,2}),? (\d{4})$/))) {
    const month = MONTHS[m[1]];
    return month === undefined ? null : build(+m[3], month, +m[2], now);
  }

  return null;
}

/**
 * Parses one date. "Present" and anything unreadable give null; use
 * parseDateRange when the value is an end date that may be "Present".
 */
export function parseImportDate(value: unknown, now: Date = new Date()): Date | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return build(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), now);
  }
  if (typeof value !== "string" || isPresentToken(value)) return null;
  return parseString(value, now);
}

export type ParsedDateRange = {
  startDate: Date | null;
  endDate: Date | null;
  currentlyWorking: boolean;
};

/**
 * Parses a start/end pair and checks the pair makes sense: a start in the
 * future is dropped, and an end before the start is dropped.
 */
export function parseDateRange(
  start: unknown,
  end: unknown,
  options: { currentlyWorking?: boolean; now?: Date } = {}
): ParsedDateRange {
  const now = options.now ?? new Date();
  const ongoing = isPresentToken(end);

  let startDate = parseImportDate(start, now);
  if (startDate && startDate.getTime() > now.getTime()) startDate = null;

  let endDate = ongoing ? null : parseImportDate(end, now);
  if (startDate && endDate && endDate.getTime() < startDate.getTime()) endDate = null;

  return {
    startDate,
    endDate,
    currentlyWorking: ongoing || options.currentlyWorking === true,
  };
}

/** parseDateRange for records without currentlyWorking, such as education. */
export function parseDatePair(start: unknown, end: unknown, now?: Date) {
  const { startDate, endDate } = parseDateRange(start, end, { now });
  return { startDate, endDate };
}
