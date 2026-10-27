# Voice journaling (GPT-Live) — setup

## How a call flows

1. User clicks **Call me** → `POST /api/voice/call` creates a `voice_calls` row and asks Twilio to call the user's verified number (caller ID `TWILIO_PHONE_NUMBER`, recorded, `timeLimit` 12 min).
2. When the user answers, Twilio runs inline TwiML `<Dial><Sip>sip:$OPENAI_PROJECT_ID@sip.api.openai.com;secure=true?x-rize-call-id=…</Sip>` (TLS + SRTP).
3. OpenAI sends the `live.transport.incoming` webhook to `/api/voice/openai/webhook`. We verify the signature, match `x-rize-call-id` to a call we placed (anything else is rejected), load the user's profile into the instructions and `POST /v1/live/sessions/{id}/accept` with `gpt-live-1`.
4. The same function (Fluid Compute, `maxDuration = 800`) attaches the sideband `wss://api.openai.com/v1/live/sessions/{id}/attach` via `after()`, collects transcript deltas, asks the AI to wrap up at 10 min, sends `session.close` at 11 min and hangs up at 11m40s at the latest. Then it saves the transcript and writes 2–3 drafts (onboarding calls also fill empty profile fields).
5. Twilio posts the recording to `/api/voice/twilio/recording`; we copy it to R2 (`call-recordings/`, deleted after 7 days by the bucket lifecycle rule) and delete Twilio's copy.

Drafts are stored in `voice_drafts` and only go into `posts` when the user clicks **Publish**.

## Why there is no Elastic SIP Trunk

OpenAI's *direct outbound* SIP (`POST /v1/live/sessions` with `transport.type: "sip"`) needs a trunk with **Opus**. Twilio Elastic SIP Trunking only has Opus as a Limited Availability codec that you request through Twilio sales. It also needs OpenAI to enable outbound SIP for the org.

The path above sends the call to OpenAI's SIP endpoint as an *inbound* call from Twilio Programmable Voice. That needs no trunk and doesn't change either Twilio number. If Tanay still wants the trunk path, see "Option B" at the end.

## One-time setup (Option A, what the code does)

### 1. OpenAI
1. platform.openai.com → Settings → your project → **General**: copy the project ID (`proj_…`) and confirm it matches `OPENAI_PROJECT_ID`.
2. Confirm **GPT-Live SIP** is enabled for the project (the docs say it must be). If it isn't, ask OpenAI support or your account contact.
3. Project → **Webhooks** → Create:
   - URL: `https://<your-domain>/api/voice/openai/webhook` (locally: the ngrok URL, see below)
   - Event: `live.transport.incoming`. Also tick the deprecated `live.call.incoming` if it's listed.
   - Copy the signing secret into `OPENAI_WEBHOOK_SECRET` (`.env.local` and Vercel).

### 2. Twilio (Console)
Nothing on the phone numbers changes.
1. **Voice → Settings → Geo permissions**: make sure every country you'll call (India, US, …) is allowed. Turning on a new country is an account setting, so ask Tanay first.
2. **Voice → Settings → General**: leave the defaults. Calls use inline TwiML, so no TwiML app or webhook is needed on the numbers.
3. Note: some countries (including India) may block or rewrite a US toll-free caller ID. Test with one call to your own number first.

### 3. Cloudflare R2
1. Use the bucket in `R2_BUCKET`, kept private (no public access).
2. Add the 7-day lifecycle rule (it keeps any rules already on the bucket):
   ```bash
   npx tsx src/scripts/setup-r2-lifecycle.ts
   ```
   Or in the dashboard: R2 → bucket → Settings → Object lifecycle rules → add a rule with prefix `call-recordings/` that deletes objects after 7 days.

### 4. Database
Run `drizzle/0016_voice_journaling.sql` against the database. It creates `voice_calls` and `voice_drafts` only and changes no existing table. Run it on a dev or Neon branch first, then on prod (Tanay).

### 5. Vercel
- Pro plan with **Fluid Compute** on (Project → Settings → Functions).
- Env vars: the existing keys plus `OPENAI_WEBHOOK_SECRET`. `VOICE_PUBLIC_BASE_URL` is optional and defaults to `NEXT_PUBLIC_APP_URL`. The old `VAPI_*` vars can be removed.

## Local testing with ngrok
1. `npx next dev -p 3001`
2. `ngrok http 3001` → copy the `https://….ngrok-free.app` URL.
3. In `.env.local`, set `VOICE_PUBLIC_BASE_URL=<ngrok url>` (Twilio callbacks and signature checks use it). Restart dev.
4. Point the OpenAI project webhook at `<ngrok url>/api/voice/openai/webhook`, or create a separate test webhook with its own secret.
5. Run the migration on a **dev/branch database**, not prod.
6. Sign in → Settings → Voice journal → verify your number → **Call me**. ⚠️ This is a real call: Twilio minutes, recording, Verify SMS and GPT-Live minutes all cost money.
7. Note: locally there's no 800s limit, but the 12-minute cap is still enforced in code and by Twilio's `timeLimit`.

## Option B — Elastic SIP Trunk + OpenAI direct outbound (not built)
Only if Twilio enables Opus (Limited Availability, via sales) and OpenAI enables outbound SIP for the org:
1. Twilio → Elastic SIP Trunking → Create trunk. Turn on **Secure Trunking** (TLS + SRTP).
2. Termination → set a termination URI (e.g. `rize.pstn.twilio.com`) and add a **Credential List** (username/password) for auth.
3. Ask Twilio to enable Opus on the trunk.
4. In code: replace `startOutboundCall` with `POST /v1/live/sessions` with `transport: { type: "sip", destination, trunk: { provider_url: "sips:rize.pstn.twilio.com:5061", auth: { type: "digest", username, password }, caller_number } }`, then attach the sideband right away. `holdCallSession` stays the same. Twilio recording would then need trunk-level recording.
