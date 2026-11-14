// Self-check for import-dates.ts. Touches no data.
// Run: bun src/lib/import-dates.check.ts
import { expandTwoDigitYear, isPresentToken, parseDateRange, parseImportDate } from "./import-dates";

const now = new Date(Date.UTC(2026, 10, 14));
let failures = 0;

function ymd(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : null;
}

function eq(label: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return;
  failures++;
  console.error(`FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const single: [string | Date | null | undefined | number, string | null][] = [
  // The original bug: month + two-digit year read as a day in 2001.
  ["Sep 21", "2021-09-01"],
  ["Jan 20", "2020-01-01"],
  ["09/21", "2021-09-01"],
  ["9/21", "2021-09-01"],
  ["Sep '21", "2021-09-01"],
  ["Sep ’21", "2021-09-01"],
  ["Sep-21", "2021-09-01"],
  ["'21", "2021-01-01"],
  // Two-digit pivot: up to next year's two digits is 20xx.
  ["Jan 27", "2027-01-01"],
  ["Jan 28", null], // 1928, which is before 1960
  ["Jun 98", "1998-06-01"],
  ["06/98", "1998-06-01"],
  // Full years in common shapes.
  ["2021", "2021-01-01"],
  ["2021-09", "2021-09-01"],
  ["2021/09", "2021-09-01"],
  ["2021-09-15", "2021-09-15"],
  ["2021-09-15T00:00:00.000Z", "2021-09-15"],
  ["09/2021", "2021-09-01"],
  ["Sep 2021", "2021-09-01"],
  ["Sept. 2021", "2021-09-01"],
  ["September, 2021", "2021-09-01"],
  ["  september   2021 ", "2021-09-01"],
  ["Summer 2021", "2021-06-01"],
  ["15 Sep 2021", "2021-09-15"],
  ["Sep 15, 2021", "2021-09-15"],
  ["25/12/2021", "2021-12-01"],
  ["12/25/2021", "2021-12-01"],
  ["03/04/2021", "2021-01-01"], // day/month order unknown: year only
  [new Date(Date.UTC(2022, 4, 1)), "2022-05-01"],
  // Rejected.
  ["Present", null],
  ["Current", null],
  ["", null],
  ["   ", null],
  ["sometime", null],
  ["Smarch 2021", null],
  ["13/2021", null],
  ["2021-02-31", null],
  ["1955", null],
  ["2040", null],
  ["21", null],
  [null, null],
  [undefined, null],
  [2021, null],
  [new Date("not a date"), null],
];

for (const [input, expected] of single) {
  eq(`parseImportDate(${JSON.stringify(input)})`, ymd(parseImportDate(input, now)), expected);
}

eq("pivot 26", expandTwoDigitYear(26, now), 2026);
eq("pivot 27", expandTwoDigitYear(27, now), 2027);
eq("pivot 28", expandTwoDigitYear(28, now), 1928);
eq("pivot 0", expandTwoDigitYear(0, now), 2000);

for (const word of ["present", "Present", "PRESENT", "current", "now", "Now.", "ongoing", "to date"]) {
  eq(`isPresentToken(${word})`, isPresentToken(word), true);
}
eq("isPresentToken(2021)", isPresentToken("2021"), false);

function range(start: unknown, end: unknown, currentlyWorking?: boolean) {
  const r = parseDateRange(start, end, { currentlyWorking, now });
  return { start: ymd(r.startDate), end: ymd(r.endDate), current: r.currentlyWorking };
}

eq("range normal", range("Jan 20", "Apr 22"), { start: "2020-01-01", end: "2022-04-01", current: false });
eq("range present", range("Sep 2024", "Present"), { start: "2024-09-01", end: null, current: true });
eq("range now", range("2024", "now"), { start: "2024-01-01", end: null, current: true });
eq("range flag kept", range("2024", undefined, true), { start: "2024-01-01", end: null, current: true });
eq("range end before start", range("Jul 2024", "Jun 2023"), { start: "2024-07-01", end: null, current: false });
eq("range future start", range("Jan 2030", "Feb 2031"), { start: null, end: "2031-02-01", current: false });
eq("range future end ok", range("Sep 2023", "Jun 2027"), { start: "2023-09-01", end: "2027-06-01", current: false });
eq("range same month", range("2020", "2020"), { start: "2020-01-01", end: "2020-01-01", current: false });
eq("range garbage", range("soon", "later"), { start: null, end: null, current: false });

if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log(`ok: ${single.length} single-date cases and range cases passed`);
