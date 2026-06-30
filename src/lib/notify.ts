import "server-only";

export type LeadNotice = { name: string; phone: string; email: string; message?: string; source?: string };

/**
 * Notify the company about a new lead. Sends an e-mail via Resend
 * (RESEND_API_KEY + LEAD_NOTIFY_EMAIL) and/or posts to a webhook
 * (LEAD_WEBHOOK_URL — Slack/Make/Zapier). If neither is configured it logs and
 * no-ops. Never throws — the lead is already persisted before this runs.
 */
export async function notifyLead(lead: LeadNotice): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (key && to) {
    const body =
      `Jméno: ${lead.name}\n` +
      `Telefon: ${lead.phone}\n` +
      `E-mail: ${lead.email}\n` +
      `Zdroj: ${lead.source || "web"}\n\n` +
      `Zpráva:\n${lead.message || "—"}`;
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        // Bound the wait: a hung provider must not stall the (awaited) request
        // into a platform timeout, which would surface a false error to the
        // visitor and cause duplicate re-submits even though the lead is saved.
        signal: AbortSignal.timeout(5000),
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_FROM_EMAIL || "Viapower web <onboarding@resend.dev>",
          to: [to],
          reply_to: lead.email,
          subject: `Nová poptávka z webu — ${lead.name}`,
          text: body,
        }),
      })
        .then((r) => { if (!r.ok) console.error("[lead] email failed", r.status); })
        .catch((e) => console.error("[lead] email error", e)),
    );
  }

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    tasks.push(
      fetch(hook, {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Nová poptávka: ${lead.name} · ${lead.phone} · ${lead.email} (${lead.source || "web"})`,
          lead,
        }),
      }).catch((e) => console.error("[lead] webhook error", e)),
    );
  }

  if (tasks.length === 0) {
    console.log("[lead] no RESEND_API_KEY / LEAD_WEBHOOK_URL set — lead saved to DB only (visible in /admin/poptavky)");
    return;
  }
  await Promise.allSettled(tasks);
}
