import type { TProfileSuggestions } from "@/db/schema";

// Limits match what the profile editor and the columns accept, so anything
// suggested can be added without failing validation.
export const SUGGESTION_TEXT_LIMITS = {
  bio: 200,
  personalMission: 300,
  lifePhilosophy: 300,
} as const;

const MAX_ITEMS = 10;
const MAX_DESCRIPTION = 2000;

// Bio, mission and philosophy are plain text rendered by React, so we strip
// tags and control characters rather than store HTML.
export function cleanPlainText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (!text) return null;
  if (text.length <= max) return text;
  // Cut at a word boundary so the text doesn't end mid-word.
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}

const cleanDate = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const d = new Date(`${match[0]}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : match[0];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const list = (value: unknown) => (Array.isArray(value) ? value.filter(isRecord).slice(0, MAX_ITEMS) : []);

// Turns whatever the model returned into the stored shape. Unknown keys are
// dropped, strings are trimmed and cut to the column widths, and items missing
// their required field are left out.
export function parseProfileSuggestions(raw: unknown): TProfileSuggestions {
  const data = isRecord(raw) ? raw : {};
  return {
    bio: cleanPlainText(data.bio, SUGGESTION_TEXT_LIMITS.bio),
    personalMission: cleanPlainText(data.personalMission, SUGGESTION_TEXT_LIMITS.personalMission),
    lifePhilosophy: cleanPlainText(data.lifePhilosophy, SUGGESTION_TEXT_LIMITS.lifePhilosophy),
    experience: list(data.experience)
      .map((e) => ({
        title: cleanPlainText(e.title, 255) ?? "",
        company: cleanPlainText(e.company, 255) ?? "",
        description: cleanPlainText(e.description, MAX_DESCRIPTION),
        startDate: cleanDate(e.startDate),
        endDate: cleanDate(e.endDate),
        currentlyWorking: e.currentlyWorking === true,
      }))
      .filter((e) => e.title || e.company),
    education: list(data.education)
      .map((e) => ({
        school: cleanPlainText(e.school, 255) ?? "",
        degree: cleanPlainText(e.degree, 255),
        fieldOfStudy: cleanPlainText(e.fieldOfStudy, 255),
        startDate: cleanDate(e.startDate),
        endDate: cleanDate(e.endDate),
      }))
      .filter((e) => e.school),
    projects: list(data.projects)
      .map((p) => ({
        name: cleanPlainText(p.name, 120) ?? "",
        tagline: cleanPlainText(p.tagline, 60) ?? "",
        description: cleanPlainText(p.description, MAX_DESCRIPTION) ?? "",
        status: p.status === "completed" ? ("completed" as const) : ("wip" as const),
      }))
      .filter((p) => p.name),
  };
}

export function hasAnySuggestion(s: TProfileSuggestions) {
  return Boolean(
    s.bio || s.personalMission || s.lifePhilosophy || s.experience.length || s.education.length || s.projects.length
  );
}

export function suggestionDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00Z`) : null;
}
