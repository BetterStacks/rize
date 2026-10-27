import type { TTranscriptTurn } from "@/db/schema";
import WebSocket from "ws";

// GPT-Live call control. Docs: https://developers.openai.com/api/docs/guides/voice-sip
const API = "https://api.openai.com/v1/live/sessions";
export const LIVE_MODEL = "gpt-live-1";

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "Content-Type": "application/json",
});

async function post(path: string, body?: unknown) {
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GPT-Live ${path} failed: ${res.status} ${text.slice(0, 300)}`);
  }
}

export function acceptSession(sessionId: string, instructions: string) {
  // SIP negotiates the audio format, so `audio.format` is omitted.
  return post(`${encodeURIComponent(sessionId)}/accept`, {
    session: {
      type: "live",
      model: LIVE_MODEL,
      instructions,
      audio: { output: { voice: "marin" } },
      delegation: { type: "client" },
    },
  });
}

export function rejectSession(sessionId: string, statusCode = 603) {
  return post(`${encodeURIComponent(sessionId)}/reject`, { status_code: statusCode });
}

export function hangupSession(sessionId: string) {
  return post(`${encodeURIComponent(sessionId)}/hangup`);
}

// `data.sip_headers` is untrusted caller metadata; it is only used to look up
// a call row, which is then checked against its own state.
export function readSipHeader(sipHeaders: unknown, name: string): string | undefined {
  const target = name.toLowerCase();
  if (Array.isArray(sipHeaders)) {
    const hit = sipHeaders.find(
      (h) => typeof h?.name === "string" && h.name.toLowerCase() === target
    );
    return typeof hit?.value === "string" ? hit.value : undefined;
  }
  if (sipHeaders && typeof sipHeaders === "object") {
    for (const [key, value] of Object.entries(sipHeaders)) {
      if (key.toLowerCase() === target && typeof value === "string") return value;
    }
  }
  return undefined;
}

export type SidebandResult = {
  transcript: TTranscriptTurn[];
  closeReason: string | null;
  durationSeconds: number | null;
  // false when the socket dropped before `session.closed` arrived
  finalized: boolean;
};

type SidebandOptions = {
  sessionId: string;
  // Ask the assistant to wrap up at this point (ms after attach)
  wrapUpAfterMs: number;
  // Send `session.close` at this point
  closeAfterMs: number;
  // Hang up and stop waiting at this point, whatever happens
  hardStopAfterMs: number;
  onTranscript?: (transcript: TTranscriptTurn[]) => void;
};

// Holds the sideband WebSocket open until `session.closed` (or the hard stop),
// collecting transcript deltas into turns.
export function runSideband(opts: SidebandOptions): Promise<SidebandResult> {
  const { sessionId } = opts;
  const transcript: TTranscriptTurn[] = [];
  const seenEvents = new Set<string>();
  let closeReason: string | null = null;
  let durationSeconds: number | null = null;
  let finalized = false;

  const append = (role: TTranscriptTurn["role"], delta: string, startMs?: number) => {
    const last = transcript[transcript.length - 1];
    if (last && last.role === role) {
      last.text += delta;
    } else {
      transcript.push({ role, text: delta, startMs });
    }
    opts.onTranscript?.(transcript);
  };

  return new Promise((resolve) => {
    const ws = new WebSocket(`${API}/${encodeURIComponent(sessionId)}/attach`, {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    const timers: NodeJS.Timeout[] = [];
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      try {
        ws.close();
      } catch {}
      resolve({ transcript, closeReason, durationSeconds, finalized });
    };

    const send = (event: Record<string, unknown>) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(event));
    };

    timers.push(
      setTimeout(() => {
        send({
          type: "session.instructions.append",
          event_id: "wrap_up",
          delegation_id: null,
          content:
            "Time is almost up. Finish the current thought, thank them warmly, tell them their drafts will be ready in Rize shortly, and say goodbye.",
        });
      }, opts.wrapUpAfterMs),
      setTimeout(() => send({ type: "session.close" }), opts.closeAfterMs),
      setTimeout(async () => {
        closeReason = closeReason ?? "app_time_limit";
        await hangupSession(sessionId).catch(() => {});
        finish();
      }, opts.hardStopAfterMs)
    );

    ws.on("message", (raw) => {
      let event: any;
      try {
        event = JSON.parse(raw.toString());
      } catch {
        return;
      }
      // The sideband replays recent events on attach; dedupe by event_id.
      if (event.event_id) {
        if (seenEvents.has(event.event_id)) return;
        seenEvents.add(event.event_id);
      }

      switch (event.type) {
        case "session.input_transcript.delta":
          append("user", event.delta ?? "", event.start_ms);
          break;
        case "session.output_transcript.delta":
          append("assistant", event.delta ?? "", event.start_ms);
          break;
        case "session.delegation.created":
          // This assistant has no tools; tell the model so it carries on talking.
          send({
            type: "session.thinking.append",
            event_id: `no_tools_${event.delegation?.id ?? Date.now()}`,
            delegation_id: event.delegation?.id ?? null,
            content: "No tools are available on this call. Keep the conversation going.",
          });
          break;
        case "session.closed":
          closeReason = event.reason ?? null;
          durationSeconds =
            typeof event.usage?.seconds === "number" ? Math.round(event.usage.seconds) : null;
          finalized = true;
          finish();
          break;
        case "error":
          console.error("[voice] GPT-Live sideband error", event.error?.code, event.error?.message);
          break;
      }
    });

    ws.on("error", (error) => {
      console.error("[voice] sideband socket error", error.message);
    });
    ws.on("close", () => finish());
  });
}
