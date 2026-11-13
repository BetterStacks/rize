# Rize: North Star

> Why we're building Rize, who it's for, and how to decide what to build next.
> Status as of 2026-11-12. Keep this short. Update it when a decision changes, not when code changes.

## One line

**Rize is where your story lives. It's built from what you actually did and said, not from a resume or an AI draft.**

## Who it's for

People early in their careers who feel LinkedIn doesn't capture who they are:

| Group | Who | What they need from Rize |
|---|---|---|
| Students | College students, club leads, people on their first internship | Proof they're more than a GPA, and help noticing they're growing |
| Early-career builders | Developers, designers and PMs in their first five years | A record of what they actually built and learned, not job titles |
| Creators and multi-hyphenates | Content creators, people in fashion and music, side projects next to a job | Material that's honestly theirs, in a feed full of AI-written posts |
| Self-starters on other paths | Dropouts, the self-taught, freelancers, first-time founders | A way to show what they've done when there's no "where I've worked" |

What they share: little patience for anything corporate or scripted, a strong sense of what's cringe, and a lot of real experience that never gets written down.

## The problem

1. **Professional profiles are written once and left alone.** Nothing pulls people back, so the profile goes stale.
2. **Writing is where people stall.** Faced with a blank page, most people either don't post or ask ChatGPT for a draft.
3. **AI drafts aren't theirs.** Once someone has seen a fluent draft, it sets the angle, the structure and the tone. Editing happens inside that frame. The post sounds fine and says nothing only they could say, and feeds converge on the same hooks.
4. **People don't open another app.** Attention lives on X, LinkedIn, Threads, Instagram and WhatsApp. "Come to our site and write" loses.

## What we're building

**Rize comes to you.** It calls you, asks one good question about your actual week, and listens. What you said becomes a private journal entry. Sometimes it becomes a post draft, cut from your own words, which you approve before anything goes public. Over months, your profile fills with real moments instead of a static bio.

| Piece | Promise | Status |
|---|---|---|
| **Profile** | A story-driven profile: projects, writing, gallery, experience, education | Live |
| **Voice calls** | A short call: one concrete question, curious follow-ups, about five minutes | Live as "Call me" and calling Rize's number. Rize doesn't call people on a schedule yet |
| **Onboarding call** | A new profile gets filled in from a conversation, not a form | Live |
| **Journal and drafts** | Every call is kept privately. Some become drafts, built from the person's own sentences | Drafts are live but rewritten by the model. Extract-only drafts aren't built yet |
| **Memory** | The next call picks up open threads ("how did the hackathon go?") | Not built. Calls only see the profile |
| **Off-site loop** | The note, plus approve, edit or skip, on WhatsApp right after the call. A missed call becomes a question to answer with a voice note | Not built |
| **Distribution** | Approved posts can be cross-posted to LinkedIn or X, linking back to the Rize profile | Not built |

The detailed call design (stages, opening questions, follow-up moves, tone, edge cases) is in the Rize Call Script doc.

## Current priorities (in order)

1. **Make the live calls safe and honest.** A written protocol for distress or self-harm. A plain "yes, I'm Rize's AI" when asked. Easy stop and opt-out.
2. **Make the calls match the script.** Shorter calls on one topic, opening questions about what happened rather than what they learned, and drafts cut from what they said.
3. **Remember.** Carry open threads, people and projects from one call to the next.
4. **Rize calls you.** Scheduled calls at a time the person picked, with explicit consent. The approve and edit loop moves to WhatsApp.
5. **Then distribution:** cross-posting with a link back to Rize.

## How to decide what to build

Ask, in order:

1. **Does it get real material out of a real person?** It should come from their week, their words and their photos, not from a prompt or a template.
2. **Does it work without them opening the site?** If it only works after they've visited, it's weaker than something that reaches them.
3. **Would they be comfortable if everything they said stayed private?** It should. Private is the default, and going public is always their choice.
4. **Does it make them perform?** Features that optimise for looking impressive pull back toward LinkedIn. Prefer what's honest over what's polished.
5. **Is it safe?** Calls, recordings, phone numbers and transcripts are personal. Consent, disclosure and deletion come first.

Examples:

- "Generate a post from a topic": no. That's the exact problem we exist to fix.
- "Tap to record in the app": fine as a fallback, but it isn't the core loop.
- "Show which recruiters viewed your profile": careful. It invites performing and sounds like we're watching people.

## Principles

- **Their words, not ours.** Drafts are cut from what people said, not rewritten into an AI voice.
- **Observations, not conclusions.** Ask what happened, not what they learned. Lessons come out on their own when the story gets told.
- **One call, one thread.** Go deep on one thing, then end while it still feels good.
- **Curiosity over coaching.** The caller never gives advice, never grades and never says "great insight".
- **Private by default.** Nothing goes public without the person reading and approving it.
- **Memory shows we were listening.** It's never used to show how much we know. People can see and delete everything it holds.
- **Honest about being AI.** We never pretend to be a person.
