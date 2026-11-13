# Rize design

How Rize should look and feel, which screens matter, and what was decided along the way. Read [RIZE_NORTH_STAR.md](../RIZE_NORTH_STAR.md) first.

## The screens that matter

The core of Rize is the conversation loop: Rize calls, the person talks, the call becomes a private journal entry, and sometimes a draft they choose to share. The profile is where shared moments end up, not the main product.

| Screen | Who it's for | The one job it does | North Star principle |
|---|---|---|---|
| Call me and scheduling | Someone who just signed up, or wants a call now or at a set time | Get a call started, or set when Rize may call, with clear consent | Rize comes to you; private by default |
| Journal | The person, alone | Show every call as a private entry they can reread, hear and delete | Private by default; people can see and delete everything |
| Draft review | The person, right after a call | Show a draft cut from their own words and let them share it, change it or keep it private | Their words, not ours |
| Publish | The person, sharing | Post an approved draft to LinkedIn or X, linking back to Rize | Nothing public without approval |
| Profile (lighter) | Visitors | Show the moments the person chose to share, plus the basics | Observations, not conclusions; don't make people perform |

Draft review is designed first: it's the moment of truth for "their words, not ours".

## Taste rules

- Calm, content-first, editorial. The person's own words, photos and moments are the visual centre; the interface stays quiet around them. No widget panels or "insight" cards.
- Choose type deliberately: a display face for people's words and headlines, a clean sans for the interface. Not Inter on white with gradients.
- No sparkle, wand or ✨ icons for AI. Icons say what the thing does.
- Plain, specific copy. Nothing that sounds like watching people ("who viewed you"), no hype, nothing corporate or cringe.
- Preferences live in the database or local storage, not the URL.
- Navigation and sections aren't trimmed without asking.
- Accessible as built: real buttons and links, 44px touch targets, 4.5:1 text contrast, works at phone width, light and dark.

## The system (to define once)

One tokens file for type, colour, spacing, radius and motion. The existing shadcn primitives are restyled with it rather than forked: one button set, one dialog (with a working close X), one empty state.

## Inventory and proposal

Every screen and feature that exists today, with a proposed decision. **Keep** stays as is, **Hide** stays in code but out of the main navigation, **Merge** folds into another screen, **Retire** removes it. Anything marked *needs Tanay* waits for an explicit decision; nothing is removed by accident.

| Area | Screen or feature | Proposal | Why |
|---|---|---|---|
| Landing | Landing page (`/`) | Keep, rework later | Should lead with "Rize calls you", not profiles |
| Landing | Privacy, Terms | Keep | |
| Auth | Login, signup, phone sign-in, sign-in dialog | Keep | |
| Onboarding | 7-step wizard | Merge, *needs Tanay* | The onboarding call should do most of this; keep username and a call step |
| Onboarding | Import from LinkedIn/GitHub step | Hide, *needs Tanay* | Writes template text, not the person's words |
| Onboarding | Resume upload step | Keep as optional | Real material, reviewed before it shows |
| Onboarding | Phone collection modal | Merge into the call step | One place to set up calls |
| Claim | Claim profile | Keep | |
| Voice | Voice journal (`/settings/voice`) | Split into Call me, Journal and Draft review; move out of Settings | It's the core loop, currently buried |
| Profile | Public profile | Keep, lighter | Shared moments first, sections after |
| Profile | Experience, education, certificates, projects | Keep | |
| Profile | Story elements | Merge into shared moments, *needs Tanay* | Overlaps with what calls produce |
| Profile | Gallery | Keep | People's own photos |
| Profile | QR code, share card | Keep | |
| Profile | Profile completion widget | Retire, *needs Tanay* | A widget that pushes performing |
| Profile | Profile views widget, Analytics page | Hide, *needs Tanay* | Profile polish is paused; counts only, no who-viewed-you |
| Editing | Right sidebar with profile chat, section manager, social links, gallery editor | Keep, restyle | |
| Content | Posts, post detail, comments, votes, bookmarks | Keep | Approved drafts publish here |
| Content | Writings and editor | Keep | |
| Social | Explore, feed, people, all profiles, search | Keep, no new work | Profile and discovery polish is paused |
| Social | Custom feeds, follows | Keep, no new work | |
| Nav | Notifications link (sidebar and mobile nav) | *needs Tanay* | The link goes to a page that doesn't exist: build it or remove the link |
| Dead code | Unreachable components (old editor, old dialogs, unused layouts, recently joined, explore sidebar, walkthrough, upgrade card, testimonials) | Retire | Not reachable from any screen |

## Directions explored

Draft review, three directions (private canvas): A "Cut from your words" (editorial, shows which spoken sentences were kept), B "Moments" (one quote per card, swipe to share or keep), C "In the chat" (the WhatsApp-style thread the call loop is heading towards).

## Decisions log

Record what Tanay kept and rejected from each round, so it isn't lost.

| Date | Screen | Kept | Rejected | Notes |
|---|---|---|---|---|
| 2026-11-12 | Draft review | A (draft shown with the call transcript, kept sentences highlighted, filler struck out) and B (one moment per card, Keep private / Edit / Share) | C (chat thread) for this screen; any "listen to your recording" playback | People don't want to hear their own rambling. The transcript works as the way to show where the words came from, and a synthesized version could too. Round 2 combines B's card flow with A's transcript. |
| 2026-11-12 | Draft review | Round 2: B's one-moment card on A's warm paper and serif type, with a "From your call" transcript under the draft (kept words highlighted, filler struck out) and Keep private / Edit / Share | | Approved as the direction to build. Open: whether "synthesized version" means a written summary, and whether the call history keeps its recording player. |
