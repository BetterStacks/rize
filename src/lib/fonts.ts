import { Newsreader } from "next/font/google";

// Display serif for people's own words (drafts, journal entries). Apply
// `newsreader.variable` on the element that uses `--rize-font-display`.
// Latin only; other scripts (e.g. Devanagari) fall back to the system serif.
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
