import localFont from "next/font/local";

// Display serif for people's own words (drafts, journal entries). Apply
// `newsreader.variable` on the element that uses `--rize-font-display`.
// Self-hosted (SIL Open Font License) so builds don't depend on fetching
// Google Fonts. Latin only; other scripts (e.g. Devanagari) fall back to the
// system serif.
export const newsreader = localFont({
  src: "../fonts/Newsreader-latin-variable.woff2",
  variable: "--font-newsreader",
  weight: "400 500",
  style: "normal",
  display: "swap",
});
