import OpenAI from "openai";
import type { CallerContext } from "./voice/prompt";

/*
 * "Ask them something": checks on a visitor's question, and suggested
 * questions drawn from the person's own profile so asking feels easy.
 */

import { QUESTION_MAX, QUESTION_MIN } from "./questions-shared";
export { QUESTION_MAX, QUESTION_MIN };

export type QuestionCheck = { ok: true; text: string } | { ok: false; error: string };

const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|io|co|me|xyz|app|link|ly)\b)/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_RE = /(\+?\d[\s-]?){7,}/;
const HANDLE_RE = /(^|\s)@[a-z0-9_.]{3,}/i;

/*
 * Unambiguous abuse in English, Hindi and Hinglish, matched loosely (letters
 * can be repeated or separated). Words that are also names or everyday words
 * are left to the moderation model below, which reads them in context.
 */
const BLOCKED_STEMS = [
  "fuck", "bitch", "bastard", "cunt", "slut", "whore", "nigg", "faggot",
  "chutiya", "chutiye", "madarchod", "behenchod", "bhenchod", "bhosdi", "bhosad", "gandu",
  "harami", "lauda", "jhaat",
];

const loose = (stem: string) =>
  new RegExp(stem.split("").map((c) => `${c}+`).join("[\\s._*-]*"), "i");
const BLOCKED_RES = BLOCKED_STEMS.map(loose);

const normalise = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[0@]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s");

/** Free, instant checks. No network. */
export function checkQuestionLocally(raw: string): QuestionCheck {
  const text = (raw || "").replace(/\s+/g, " ").trim();
  if (text.length < QUESTION_MIN) return { ok: false, error: "Ask a little more, at least a short sentence." };
  if (text.length > QUESTION_MAX) return { ok: false, error: `Keep it under ${QUESTION_MAX} characters.` };
  if (URL_RE.test(text) || EMAIL_RE.test(text) || PHONE_RE.test(text) || HANDLE_RE.test(text)) {
    return { ok: false, error: "Leave out links, numbers, emails and handles. Just ask the question." };
  }
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 12 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.6) {
    return { ok: false, error: "Try it without all caps." };
  }
  const flat = normalise(text);
  if (BLOCKED_RES.some((re) => re.test(flat))) {
    return { ok: false, error: "Keep it kind. This question can't be sent." };
  }
  return { ok: true, text };
}

/*
 * The moderation model (free, multilingual). Fails closed: if it can't be
 * reached, the question isn't sent.
 */
export async function checkQuestionWithModeration(text: string): Promise<QuestionCheck> {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const result = await client.moderations.create({ model: "omni-moderation-latest", input: text });
    if (result.results?.some((r) => r.flagged)) {
      return { ok: false, error: "Keep it kind. This question can't be sent." };
    }
    return { ok: true, text };
  } catch (error: any) {
    console.error("[questions] moderation failed", error?.message);
    return { ok: false, error: "We couldn't check your question just now. Try again in a minute." };
  }
}

const shortName = (value: string | null | undefined, max = 40) => {
  const v = (value || "").replace(/\s+/g, " ").trim();
  if (!v || v.length > max) return null;
  // Profile text goes into suggestions shown to others; keep it plain.
  return /[<>{}]/.test(v) ? null : v;
};

const GENERAL = [
  "What's something you finished recently that you're proud of?",
  "What are you figuring out right now?",
  "Who helped you most this year, and how?",
  "What's something you changed your mind about recently?",
  "What would you tell someone starting where you started?",
  "What does a good week look like for you right now?",
];

/*
 * Up to four suggested questions, built from the person's own profile
 * (projects, current work, studies) and topped up with general ones. They're
 * about moments and choices, never asking for advice or private details.
 */
export function suggestQuestions(ctx: CallerContext, seed = Date.now()): string[] {
  const out: string[] = [];
  const project = ctx.projects.map((p) => shortName(p.name)).find(Boolean);
  if (project) out.push(`What was the hardest part of building ${project}?`);
  const current = ctx.experience.find((e) => e.current);
  const company = shortName(current?.company);
  if (company) out.push(`What surprised you most about working at ${company}?`);
  const field = shortName(ctx.education[0]?.fieldOfStudy);
  if (field) out.push(`What's one thing from ${field} you actually use?`);
  const second = ctx.projects.map((p) => shortName(p.name)).filter(Boolean)[1];
  if (second) out.push(`How did ${second} start?`);

  const general = [...GENERAL];
  let s = Math.abs(seed) % 2147483647 || 1;
  while (out.length < 4 && general.length) {
    s = (s * 48271) % 2147483647;
    out.push(general.splice(s % general.length, 1)[0]);
  }
  return out.slice(0, 4);
}
