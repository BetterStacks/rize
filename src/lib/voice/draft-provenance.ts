// Shows where a draft came from: the passages of the call it was cut from,
// with the words that were kept, the filler that was dropped and the sentences
// that weren't used. Pure and dependency-free, so it runs on the client and is
// shared with the extract-only check in after-call.ts.

export const FILLER_WORDS = new Set(["um", "umm", "uh", "uhh", "hmm", "like", "basically", "actually", "literally", "so", "yeah"]);

// Lowercased word in any script, apostrophes kept, other punctuation removed.
function normalize(word: string) {
  return word
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}\p{M}']+/gu, "")
    .replace(/^'+|'+$/g, "");
}

// Lowercased word tokens in any script, with punctuation and filler removed.
export function tokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .split(/[^\p{L}\p{N}\p{M}']+/u)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w && !FILLER_WORDS.has(w));
}

const SENTENCE_SPLIT = /(?<=[.!?।])\s+|\n+/u;

export function splitSentences(text: string) {
  return text.split(SENTENCE_SPLIT);
}

function lcsTable(a: string[], b: string[]) {
  const t: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
    }
  }
  return t;
}

// Longest common subsequence length, so a sentence matches only when its words
// appear in the same order the user said them.
export function lcsLength(a: string[], b: string[]) {
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[b.length];
}

// Indexes in b that an LCS of a and b uses.
function lcsMatchesInB(a: string[], b: string[]) {
  const t = lcsTable(a, b);
  const matched = new Set<number>();
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matched.add(j - 1);
      i--;
      j--;
    } else if (t[i - 1][j] >= t[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return matched;
}

// Share of a draft sentence's words (filler aside) that have to appear, in
// order, in one thing the user said. The same bar drafts pass when they're cut.
export const MIN_MATCH = 0.9;

// A transcript sentence counts as used only when at least this share of its
// non-filler words were kept. Stops a stray "I" or "the" from lighting up a
// sentence the draft never used.
const MIN_SENTENCE_KEPT = 0.5;

export type ProvenanceWord = {
  text: string;
  kind: "kept" | "dropped" | "unused";
};

// One sentence of what the user said, in order.
export type ProvenanceSentence = {
  used: boolean;
  words: ProvenanceWord[];
};

// One user turn, trimmed to run from the first sentence the draft used to the
// last. `cutBefore` / `cutAfter` say whether sentences were left off either end.
export type ProvenancePassage = {
  turnIndex: number;
  cutBefore: boolean;
  cutAfter: boolean;
  sentences: ProvenanceSentence[];
};

type Word = { text: string; norm: string; sentence: number };

function turnWords(text: string): { words: Word[]; sentenceCount: number } {
  const words: Word[] = [];
  let sentence = 0;
  const raw = text.trim().split(/\s+/).filter(Boolean);
  raw.forEach((w, i) => {
    words.push({ text: w, norm: normalize(w), sentence });
    if (/[.!?।]["'”’)]*$/u.test(w) && i < raw.length - 1) sentence++;
  });
  return { words, sentenceCount: words.length ? sentence + 1 : 0 };
}

// Returns the passages a draft was cut from, or null when the draft doesn't
// line up with what the user said closely enough to show honestly (for
// example after they rewrote it).
export function draftProvenance(draft: string, userTurns: string[]): ProvenancePassage[] | null {
  const sentences = splitSentences(draft).filter((s) => tokens(s).length > 0);
  if (sentences.length === 0 || userTurns.length === 0) return null;
  const turnTokens = userTurns.map(tokens);

  // Each draft sentence goes to the user turn it matches best.
  const byTurn = new Map<number, string[]>();
  for (const sentence of sentences) {
    const st = tokens(sentence);
    let best = -1;
    let bestScore = 0;
    turnTokens.forEach((tt, i) => {
      const score = lcsLength(st, tt) / st.length;
      if (score > bestScore) {
        best = i;
        bestScore = score;
      }
    });
    if (best < 0 || bestScore < MIN_MATCH) return null;
    byTurn.set(best, [...(byTurn.get(best) ?? []), sentence]);
  }

  const passages: ProvenancePassage[] = [];
  for (const turnIndex of Array.from(byTurn.keys()).sort((a, b) => a - b)) {
    const { words, sentenceCount } = turnWords(userTurns[turnIndex]);
    // Mark kept words on the full word lists, filler included, so a "so" the
    // draft actually kept is highlighted rather than struck out.
    const draftWords = (byTurn.get(turnIndex) ?? [])
      .join(" ")
      .split(/\s+/)
      .map(normalize)
      .filter(Boolean);
    const kept = lcsMatchesInB(
      draftWords,
      words.map((w) => w.norm)
    );

    const used: boolean[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const content = words.map((w, i) => ({ w, i })).filter(({ w }) => w.sentence === s && w.norm && !FILLER_WORDS.has(w.norm));
      const keptCount = content.filter(({ i }) => kept.has(i)).length;
      used[s] = content.length > 0 && keptCount / content.length >= MIN_SENTENCE_KEPT;
    }
    const first = used.indexOf(true);
    const last = used.lastIndexOf(true);
    if (first < 0) return null;

    const out: ProvenanceSentence[] = [];
    for (let s = first; s <= last; s++) {
      out.push({
        used: used[s],
        words: words
          .map((w, i) => ({ w, i }))
          .filter(({ w }) => w.sentence === s)
          .map(({ w, i }) => ({
            text: w.text,
            kind: !used[s] ? "unused" : kept.has(i) ? "kept" : "dropped",
          })),
      });
    }
    passages.push({ turnIndex, cutBefore: first > 0, cutAfter: last < sentenceCount - 1, sentences: out });
  }
  // The unused-sentence guard can clear words the draft did take (say, a few
  // words out of a long run-on sentence). If too much of the draft is then
  // unaccounted for, showing the passage would mislead, so hide it.
  const draftWordCount = sentences.join(" ").split(/\s+/).map(normalize).filter(Boolean).length;
  const keptCount = passages.reduce(
    (n, p) => n + p.sentences.reduce((m, s) => m + s.words.filter((w) => w.kind === "kept").length, 0),
    0
  );
  if (keptCount / draftWordCount < MIN_MATCH) return null;
  return passages;
}
