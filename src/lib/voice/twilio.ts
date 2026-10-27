import twilio from "twilio";

// Hard cap on a journaling call. The Vercel function holding the GPT-Live
// sideband has maxDuration 800s, so the call must end well before that.
export const CALL_TIME_LIMIT_SECONDS = 12 * 60;

let client: ReturnType<typeof twilio> | null = null;
export function twilioClient() {
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  }
  return client;
}

// Public URL Twilio and OpenAI can reach. Locally this is the ngrok URL.
export function publicBaseUrl() {
  const base =
    process.env.VOICE_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BASE_URL ||
    "";
  return base.replace(/\/$/, "");
}

// SIP URI of our OpenAI project. The call id rides along as an X- header and
// comes back to us in the `live.transport.incoming` webhook.
// GPT-Live requires TLS signaling and SRTP media; Twilio's `secure=true`
// turns on both for an outbound <Sip> dial.
function openAiSipUri(callId: string) {
  const projectId = process.env.OPENAI_PROJECT_ID;
  return `sip:${projectId}@sip.api.openai.com;secure=true?x-rize-call-id=${callId}`;
}

export async function startOutboundCall(opts: { callId: string; to: string }) {
  const base = publicBaseUrl();
  const response = new twilio.twiml.VoiceResponse();
  const dial = response.dial({
    answerOnBridge: true,
    timeLimit: CALL_TIME_LIMIT_SECONDS,
  });
  dial.sip(openAiSipUri(opts.callId));

  return twilioClient().calls.create({
    to: opts.to,
    // Caller ID only; the number's own configuration is never touched.
    from: process.env.TWILIO_PHONE_NUMBER!,
    twiml: response.toString(),
    timeout: 30,
    timeLimit: CALL_TIME_LIMIT_SECONDS,
    statusCallback: `${base}/api/voice/twilio/status?callId=${opts.callId}`,
    statusCallbackEvent: ["ringing", "answered", "completed"],
    statusCallbackMethod: "POST",
    record: true,
    recordingStatusCallback: `${base}/api/voice/twilio/recording?callId=${opts.callId}`,
    recordingStatusCallbackEvent: ["completed"],
    recordingStatusCallbackMethod: "POST",
  });
}

// Validates X-Twilio-Signature against the exact public URL Twilio called.
export async function readTwilioForm(req: Request): Promise<Record<string, string> | null> {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });
  const url = new URL(req.url);
  const publicUrl = `${publicBaseUrl()}${url.pathname}${url.search}`;
  const signature = req.headers.get("x-twilio-signature") || "";
  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    publicUrl,
    params
  );
  return valid ? params : null;
}

export async function downloadRecording(recordingUrl: string) {
  const auth = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString("base64");
  const res = await fetch(`${recordingUrl}.mp3`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Recording download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// After the copy is safely in R2, remove Twilio's copy so the only stored
// recording is the one that expires after 7 days.
export function deleteTwilioRecording(recordingSid: string) {
  return twilioClient().recordings(recordingSid).remove();
}
