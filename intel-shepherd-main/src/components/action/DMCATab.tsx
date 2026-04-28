import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardPaste, Lock, Zap, Mail } from "lucide-react";
import { play } from "@/lib/sounds";
import { usePersonaStore } from "@/store/personaStore";
import { Typewriter } from "./Typewriter";

const RIGHTS_HOLDER_MAP: Record<string, string> = {
  uefa: "UEFA / Union of European Football Associations",
  netflix: "Netflix Inc.",
  ipl: "BCCI / Board of Control for Cricket in India",
  default: "BCCI / Board of Control for Cricket in India",
};

const LOAD_STEPS = [
  { text: "▸ Analyzing URL structure...", at: 0, sound: "ac_load_step1" as const },
  { text: "▸ Identifying hosting provider...", at: 1000, sound: "ac_load_step2" as const },
  { text: "▸ Cross-referencing rights registry...", at: 3000, sound: "ac_load_step3" as const },
  { text: "▸ Generating Section 512(c) notice via Gemini AI...", at: 5000, sound: "ac_load_step4" as const },
  { text: "▸ Notice ready — sending to JioHotstar...", at: 7000, sound: "ac_load_done" as const },
];

const STATUS = ["DRAFTED", "SUBMITTED", "ACKNOWLEDGED", "ACTIONED"] as const;
type Status = (typeof STATUS)[number];

const BACKEND = "http://localhost:8000";

export function DMCATab() {
  const persona = usePersonaStore((s) => s.current);
  const rightsHolder = RIGHTS_HOLDER_MAP[persona?.id ?? "default"];
  const contentType = "IPL 2026 Live Cricket Broadcast";

  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [stepsShown, setStepsShown] = useState(0);
  const [status, setStatus] = useState<Status>("DRAFTED");
  const [noticeText, setNoticeText] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("copyright@jiohotstar.com");
  const [apiError, setApiError] = useState<string | null>(null);

  // Run load-step animation
  useEffect(() => {
    if (phase !== "loading") return;
    setStepsShown(0);
    const timers = LOAD_STEPS.map((s, idx) =>
      setTimeout(() => {
        play(s.sound);
        setStepsShown(idx + 1);
      }, s.at),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handlePaste = async () => {
    play("ac_paste");
    try {
      const t = await navigator.clipboard.readText();
      if (t) setUrl(t);
    } catch {
      setUrl("https://ipl-stream-free.ru/live/kkr-mi-hd");
    }
  };

  const handleGenerate = async () => {
    const targetUrl = url || "https://ipl-stream-free.ru/live/kkr-mi-hd";
    if (!url) setUrl(targetUrl);

    play("ac_gavel");
    setStatus("DRAFTED");
    setPhase("loading");
    setApiError(null);
    setEmailSent(false);
    setNoticeText("");

    try {
      const res = await fetch(`${BACKEND}/api/generate-dmca`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          rights_holder: rightsHolder,
          content_type: contentType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Backend returned ${res.status}`);
      }

      const data = await res.json();
      setNoticeText(data.notice);
      setEmailSent(data.sent);
      setRecipientEmail(data.recipient || "copyright@jiohotstar.com");

      // Wait for animation to finish before showing notice
      setTimeout(() => setPhase("done"), 7800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[DMCATab] API error:", msg);
      setApiError(msg);

      // Fall back to a local template notice
      const fallback = generateFallbackNotice(targetUrl, rightsHolder, contentType);
      setNoticeText(fallback);
      setTimeout(() => setPhase("done"), 7800);
    }
  };

  const advance = () => {
    const idx = STATUS.indexOf(status);
    if (idx >= STATUS.length - 1) return;
    const next = STATUS[idx + 1];
    if (next === "SUBMITTED") play("ac_status_1");
    else if (next === "ACKNOWLEDGED") play("ac_status_2");
    else play("ac_status_3");
    setStatus(next);
  };

  return (
    <div className="space-y-6">
      {/* Top: Input + Generate */}
      <div
        className="glass rounded-md p-6 relative"
        style={{ boxShadow: "0 0 20px hsl(var(--red-critical) / 0.1)", border: "1px solid hsl(var(--red-critical) / 0.2)" }}
      >
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-display tracking-wider"
          style={{
            background: "hsl(var(--purple-ai))",
            border: "1px solid hsl(var(--purple-ai) / 1)",
            boxShadow: "0 0 12px hsl(var(--purple-ai) / 0.3)",
            color: "hsl(var(--text-primary))",
          }}
        >
          ⚡ AI POWERED — GEMINI
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <div className="text-[11px] tracking-widest text-text-muted mb-2 font-display">INFRINGING URL</div>
            <div className="relative">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste infringing IPL stream URL here..."
                className="w-full h-12 bg-void font-mono text-sm px-4 pr-12 rounded-md outline-none transition-all"
                style={{ border: "1px solid hsl(var(--border-subtle))", color: "hsl(var(--text-primary))" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--red-critical))";
                  e.currentTarget.style.boxShadow = "0 0 15px hsl(var(--red-critical) / 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border-subtle))";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={handlePaste}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
                aria-label="Paste from clipboard"
              >
                <ClipboardPaste size={16} />
              </button>
            </div>
          </div>

          {/* Content Type — readonly for IPL */}
          <div>
            <div className="text-[11px] tracking-widest text-text-muted mb-2 font-display">CONTENT TYPE</div>
            <div
              className="w-full h-12 bg-void font-mono text-sm px-4 rounded-md flex items-center justify-between"
              style={{ border: "1px solid hsl(var(--border-subtle))", color: "hsl(var(--text-secondary))" }}
            >
              <span className="truncate">{contentType}</span>
              <Lock size={14} className="text-text-muted shrink-0 ml-2" />
            </div>
          </div>

          {/* Rights Holder — readonly */}
          <div>
            <div className="text-[11px] tracking-widest text-text-muted mb-2 font-display">RIGHTS HOLDER</div>
            <div
              className="w-full h-12 bg-void font-mono text-sm px-4 rounded-md flex items-center justify-between"
              style={{ border: "1px solid hsl(var(--border-subtle))", color: "hsl(var(--text-secondary))" }}
            >
              <span className="truncate">{rightsHolder}</span>
              <Lock size={14} className="text-text-muted shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="mt-3 px-3 py-2 rounded font-mono text-[10px] text-orange-high/80"
            style={{ background: "hsl(var(--orange-high) / 0.08)", border: "1px solid hsl(var(--orange-high) / 0.3)" }}>
            ◆ Backend unavailable — using local template. Error: {apiError}
          </div>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {phase === "loading" || phase === "done" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md p-5 font-mono text-sm space-y-2"
                style={{
                  background: "hsl(var(--bg-void))",
                  border: "1px solid hsl(var(--red-critical) / 0.4)",
                  boxShadow: "0 0 18px hsl(var(--red-critical) / 0.15)",
                }}
              >
                {LOAD_STEPS.slice(0, stepsShown).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={i === stepsShown - 1 && phase === "loading" ? "text-text-primary" : "text-text-secondary"}
                  >
                    {s.text}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                onClick={handleGenerate}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    "0 0 10px hsl(var(--red-critical) / 0.3)",
                    "0 0 25px hsl(var(--red-critical) / 0.7)",
                    "0 0 10px hsl(var(--red-critical) / 0.3)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-full h-14 rounded-md font-display font-bold text-lg flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                  color: "hsl(var(--text-primary))",
                }}
              >
                <Zap size={20} /> GENERATE DMCA NOTICE
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Generated Notice */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            key="notice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-md p-6"
          >
            <div
              className="rounded-md p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap"
              style={{ background: "hsl(var(--bg-void))", border: "1px solid hsl(var(--border-subtle))", color: "hsl(var(--text-secondary))" }}
            >
              <Typewriter text={noticeText} speed={6} />
            </div>

            {/* Email confirmation */}
            {emailSent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex items-center gap-2 font-mono text-[11px]"
                style={{ color: "hsl(var(--green-safe))" }}
              >
                <Mail size={12} />
                ◆ DMCA NOTICE SENT TO: {recipientEmail}
              </motion.div>
            )}

            {/* Status tracker */}
            <div className="mt-6">
              <div className="flex items-center gap-3">
                {STATUS.map((s, i) => {
                  const active = s === status;
                  const past = STATUS.indexOf(status) > i;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${s}-${active ? "on" : past ? "past" : "off"}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-3 py-1.5 rounded-full text-[11px] font-display tracking-wider whitespace-nowrap"
                          style={{
                            background: active
                              ? "hsl(var(--red-critical) / 0.2)"
                              : past
                                ? "hsl(var(--green-safe) / 0.15)"
                                : "hsl(var(--bg-elevated))",
                            border: `1px solid ${active ? "hsl(var(--red-critical))" : past ? "hsl(var(--green-safe) / 0.5)" : "hsl(var(--border-subtle))"}`,
                            color: active
                              ? "hsl(var(--red-critical))"
                              : past
                                ? "hsl(var(--green-safe))"
                                : "hsl(var(--text-muted))",
                            boxShadow: active ? "0 0 12px hsl(var(--red-critical) / 0.5)" : "none",
                          }}
                        >
                          ● {s}
                        </motion.div>
                      </AnimatePresence>
                      {i < STATUS.length - 1 && (
                        <div className="flex-1 h-px mx-2" style={{ background: "hsl(var(--border-subtle))" }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {status !== "ACTIONED" && (
                <button
                  onClick={advance}
                  className="mt-4 glass px-4 py-2 rounded text-sm font-display tracking-wider hover:border-red-critical transition-all"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  MARK AS {STATUS[STATUS.indexOf(status) + 1]}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notices Table */}
      <NoticesTable />
    </div>
  );
}

// ─── Fallback notice template (when backend is offline) ───────────────────────

function generateFallbackNotice(url: string, rightsHolder: string, contentType: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DMCA TAKEDOWN NOTICE
Pursuant to 17 U.S.C. § 512(c)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO: JioHotstar / Star India Pvt Ltd
    Legal Department
    copyright@jiohotstar.com

FROM: ${rightsHolder}

DATE: ${today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIFICATION OF INFRINGED WORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Protected Content: ${contentType}
Rights Holder: ${rightsHolder}
Original Platform: JioHotstar (authorised broadcast partner)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFRINGING MATERIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infringing URL: ${url}

The above URL is unlawfully distributing or facilitating
the distribution of live IPL 2026 cricket broadcast content
without authorisation from the rights holder.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOOD FAITH STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I have a good faith belief that the use of the material
in the manner complained of is not authorised by the
copyright owner, its agent, or the law.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCURACY STATEMENT UNDER PENALTY OF PERJURY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I declare under penalty of perjury that the information
in this notification is accurate and that I am authorised
to act on behalf of the rights holder identified above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ELECTRONIC SIGNATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Authorised Signatory]
${rightsHolder}
Generated by AEGIS Anti-Piracy Platform
${new Date().toUTCString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ─── Notices table ────────────────────────────────────────────────────────────

const SEED_NOTICES = [
  { url: "ipl-stream-hd.ru", time: "2 mins ago", status: "ACTIONED", color: "green-safe" },
  { url: "t.me/IPLFreeStream2026", time: "8 mins ago", status: "ACKNOWLEDGED", color: "blue-intel" },
  { url: "iplpiracy.net/live", time: "15 mins ago", status: "SUBMITTED", color: "orange-high" },
];

function NoticesTable() {
  return (
    <div className="glass rounded-md p-6">
      <div className="font-display tracking-wider text-sm text-text-muted mb-4">GENERATED NOTICES</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-[11px] tracking-widest font-display">
              <th className="text-left py-2 pr-4">#</th>
              <th className="text-left py-2 pr-4">URL</th>
              <th className="text-left py-2 pr-4">GENERATED</th>
              <th className="text-left py-2 pr-4">STATUS</th>
              <th className="text-left py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {SEED_NOTICES.map((n, i) => (
              <tr
                key={i}
                className="border-t hover:bg-elevated/40 transition-colors"
                style={{ borderColor: "hsl(var(--border-subtle))" }}
              >
                <td className="py-3 pr-4 font-mono text-text-muted">{i + 1}</td>
                <td className="py-3 pr-4 font-mono">{n.url}</td>
                <td className="py-3 pr-4 text-text-secondary">{n.time}</td>
                <td className="py-3 pr-4">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider"
                    style={{
                      background: `hsl(var(--${n.color}) / 0.15)`,
                      color: `hsl(var(--${n.color}))`,
                      border: `1px solid hsl(var(--${n.color}) / 0.4)`,
                    }}
                  >
                    {n.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-xs text-text-muted hover:text-text-primary px-2 py-1 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
