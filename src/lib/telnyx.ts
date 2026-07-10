import axios from "axios";

function requireApiKey() {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) throw new Error("Telnyx is not configured (missing API key)");
  return apiKey;
}

// Places an outbound call via Telnyx Call Control API. The conversation
// itself is handled by a Telnyx AI Assistant, attached once the call is
// answered (see startAiAssistant) — this function only originates the call.
export async function placeTelnyxCall({
  to,
  metadata,
}: {
  to: string;
  metadata?: Record<string, string>;
}) {
  const apiKey = requireApiKey();
  const from = process.env.TELNYX_PHONE_NUMBER;
  const connectionId = process.env.TELNYX_APPLICATION_ID;

  if (!from || !connectionId) {
    throw new Error("Telnyx is not configured (missing phone number or application id)");
  }

  const response = await axios.post(
    "https://api.telnyx.com/v2/calls",
    {
      connection_id: connectionId,
      to,
      from,
      client_state: metadata ? Buffer.from(JSON.stringify(metadata)).toString("base64") : undefined,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data as { call_control_id: string; call_leg_id: string; call_session_id: string };
}

// Attaches a pre-configured Telnyx AI Assistant to an already-answered call
// — the assistant then takes over the conversation (STT, LLM, TTS) entirely.
export async function startAiAssistant(callControlId: string, assistantId: string) {
  const apiKey = requireApiKey();

  await axios.post(
    `https://api.telnyx.com/v2/calls/${callControlId}/actions/ai_assistant_start`,
    { assistant: { id: assistantId } },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
}
