export type StartCallResult = { ok: true; kind: string } | { ok: false; error: string };

export async function startVoiceCall(kind?: "onboarding" | "journal"): Promise<StartCallResult> {
  try {
    const res = await fetch("/api/voice/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kind ? { kind } : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || "Could not start the call" };
    return { ok: true, kind: data.kind };
  } catch {
    return { ok: false, error: "Network error. Try again." };
  }
}
