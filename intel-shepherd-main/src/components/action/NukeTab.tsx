import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { play } from "@/lib/sounds";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TARGETS = [
  { domain: "stream-ucl-hd.ru", platform: "Custom IPTV", impact: 94, viewers: 41200 },
  { domain: "t.me/UCLstreams", platform: "Telegram", impact: 87, viewers: 18400 },
  { domain: "discord.gg/UCLlive", platform: "Discord", impact: 76, viewers: 8900 },
  { domain: "iptv-sports.net", platform: "Custom IPTV", impact: 71, viewers: 12100 },
  { domain: "reddit.com/r/soccer", platform: "Reddit", impact: 58, viewers: 6200 },
];

const CHIME_SOUNDS = ["ac_chime_1", "ac_chime_2", "ac_chime_3", "ac_chime_4", "ac_chime_5"] as const;

export function NukeVignette({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 10,
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(255,45,45,0.15) 100%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export function NukeTab() {
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [phase, setPhase] = useState<"idle" | "generating" | "review" | "approving" | "submitted">("idle");
  const [genCount, setGenCount] = useState(0);
  const [confirmText, setConfirmText] = useState("");
  const [shake, setShake] = useState(false);
  const [submittedRows, setSubmittedRows] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // entry sound
  useEffect(() => {
    play("ac_nuke_entry");
  }, []);

  const selectedCount = selected.size;
  const collapse = useMemo(() => {
    let total = 0;
    selected.forEach((i) => (total += TARGETS[i].impact));
    return Math.min(99, Math.round(total / 5));
  }, [selected]);

  const toggle = (i: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) {
        play("ac_nuke_uncheck");
        n.delete(i);
      } else {
        play("ac_nuke_check");
        n.add(i);
      }
      return n;
    });
    play("ac_counter");
  };

  const handleGenerateBatch = () => {
    if (selectedCount === 0) return;
    play("ac_nuke_button");
    setPhase("generating");
    setGenCount(0);
    const arr = Array.from(selected).sort((a, b) => a - b);
    arr.forEach((_, i) => {
      setTimeout(() => {
        play(CHIME_SOUNDS[i % CHIME_SOUNDS.length]);
        setGenCount(i + 1);
        if (i === arr.length - 1) {
          setTimeout(() => {
            setPhase("review");
            play("ac_modal_open");
          }, 600);
        }
      }, 1000 * (i + 1));
    });
  };

  const handleApprove = () => {
    if (confirmText !== "CONFIRM") {
      play("ac_wrong");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setPhase("approving");
    // Suppress other sounds: store mute briefly? Spec says suppress others; we just play approve.
    play("ac_approve");

    setTimeout(() => {
      setPhase("submitted");
      const arr = Array.from(selected).sort((a, b) => a - b);
      arr.forEach((_, i) => {
        setTimeout(() => {
          if (i === arr.length - 1) play("ac_row_ping_final");
          else play("ac_row_ping");
          setSubmittedRows(i + 1);
          if (i === arr.length - 1) {
            setTimeout(() => {
              play("ac_shimmer");
              setShowSuccess(true);
              play("dmca_done");
              toast({
                title: "5 DMCA notices submitted",
                description: "Tracking activated",
              });
            }, 200);
          }
        }, 150 * i);
      });
    }, 4500);
  };

  const targetArr = Array.from(selected).sort((a, b) => a - b);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-5xl md:text-6xl text-red-critical text-glow-red">
          ONE-CLICK NUKE 💀
        </h1>
        <div className="text-text-muted tracking-widest text-sm mt-2">
          SELECT TARGETS. GENERATE NOTICES. APPROVE. EXECUTE.
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-md px-5 py-3 flex items-start gap-3"
        style={{ borderLeft: "3px solid hsl(var(--orange-high))" }}
      >
        <span className="text-orange-high text-lg">⚠️</span>
        <div className="text-sm text-text-secondary">
          This action generates and submits DMCA notices for all selected targets simultaneously.
          Rights holder approval required before execution.
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* selector */}
        <div className="glass rounded-md p-5 lg:col-span-2">
          <div className="text-[11px] tracking-widest text-text-muted mb-3 font-display">SELECT TARGETS</div>
          <div className="space-y-2">
            {TARGETS.map((t, i) => (
              <label
                key={t.domain}
                className="flex items-center gap-3 p-3 rounded transition-colors cursor-pointer hover:bg-elevated/40"
                style={{ border: "1px solid hsl(var(--border-subtle))" }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="accent-red-critical w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 grid grid-cols-4 gap-2 text-sm items-center">
                  <span className="font-mono text-text-primary">{t.domain}</span>
                  <span className="text-text-secondary">{t.platform}</span>
                  <span className="font-mono text-red-critical">{t.impact}/100</span>
                  <span className="font-mono text-text-secondary text-right">
                    {t.viewers.toLocaleString()}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* impact summary */}
        <div
          className="glass rounded-md p-5 space-y-4"
          style={{ boxShadow: "0 0 20px hsl(var(--red-critical) / 0.2)", borderColor: "hsl(var(--red-critical) / 0.3)" }}
        >
          <div className="text-[11px] tracking-widest text-text-muted font-display">
            ESTIMATED NETWORK COLLAPSE
          </div>
          <div className="font-display font-bold text-6xl text-red-critical font-mono">{collapse}%</div>

          <div className="pt-2 text-[11px] tracking-widest text-text-muted font-display">
            DMCA NOTICES TO GENERATE
          </div>
          <div className="font-display font-bold text-4xl text-text-primary font-mono">{selectedCount}</div>

          <div className="pt-2 text-[11px] tracking-widest text-text-muted font-display">
            RIGHTS HOLDER APPROVAL
          </div>
          <div className="text-orange-high font-display font-semibold">REQUIRED ⚠️</div>
        </div>
      </div>

      <motion.button
        onClick={handleGenerateBatch}
        disabled={phase !== "idle" || selectedCount === 0}
        whileHover={phase === "idle" ? { y: -2 } : {}}
        whileTap={phase === "idle" ? { scale: 0.98 } : {}}
        animate={
          phase === "idle"
            ? {
                boxShadow: [
                  "0 0 15px hsl(var(--red-critical) / 0.4)",
                  "0 0 35px hsl(var(--red-critical) / 0.8)",
                  "0 0 15px hsl(var(--red-critical) / 0.4)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-full h-16 rounded-md font-display font-bold text-xl disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
          color: "hsl(var(--text-primary))",
        }}
      >
        💀 GENERATE BATCH NOTICES
      </motion.button>

      {phase === "generating" && (
        <div className="glass rounded-md p-5">
          <div className="text-text-secondary text-sm mb-2 font-mono">
            Generating notice {genCount} of {selectedCount}...
          </div>
          <div className="h-2 bg-void rounded overflow-hidden">
            <motion.div
              animate={{ width: `${(genCount / selectedCount) * 100}%` }}
              transition={{ duration: 0.4 }}
              className="h-full"
              style={{ background: "linear-gradient(90deg, #ff2d2d, #ff6a00)" }}
            />
          </div>
        </div>
      )}

      {/* Submitted live tracking */}
      {phase === "submitted" && (
        <div className="glass rounded-md p-5">
          <div className="font-display tracking-wider text-sm text-text-muted mb-3">LIVE TRACKING</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-[11px] tracking-widest font-display">
                <th className="text-left py-2 pr-2">#</th>
                <th className="text-left py-2 pr-2">DOMAIN</th>
                <th className="text-left py-2 pr-2">NOTICE ID</th>
                <th className="text-left py-2 pr-2">SUBMITTED</th>
                <th className="text-left py-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {targetArr.map((idx, i) => (
                <tr
                  key={idx}
                  className="border-t"
                  style={{ borderColor: "hsl(var(--border-subtle))" }}
                >
                  <td className="py-2 pr-2 font-mono text-text-muted">{i + 1}</td>
                  <td className="py-2 pr-2 font-mono">{TARGETS[idx].domain}</td>
                  <td className="py-2 pr-2 font-mono text-text-secondary">
                    DMCA-{(Math.random() * 1e6).toFixed(0).padStart(6, "0")}
                  </td>
                  <td className="py-2 pr-2 text-text-secondary">just now</td>
                  <td className="py-2">
                    <AnimatePresence>
                      {i < submittedRows && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider"
                          style={{
                            background: "hsl(var(--orange-high) / 0.15)",
                            color: "hsl(var(--orange-high))",
                            border: "1px solid hsl(var(--orange-high) / 0.4)",
                          }}
                        >
                          SUBMITTED
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-md px-5 py-3 flex items-center gap-3"
            style={{
              borderColor: "hsl(var(--green-safe) / 0.4)",
              background: "hsl(var(--green-safe) / 0.05)",
            }}
          >
            <span className="text-green-safe text-lg">✅</span>
            <span className="text-green-safe font-display tracking-wider text-sm">
              {selectedCount} NOTICES SUBMITTED FOR RIGHTS HOLDER REVIEW
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal */}
      <AnimatePresence>
        {phase === "review" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-elevated rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              style={{ borderColor: "hsl(var(--red-critical) / 0.5)", boxShadow: "0 0 40px hsl(var(--red-critical) / 0.3)" }}
            >
              <div className="font-display font-bold text-2xl text-text-primary">REVIEW BATCH NOTICES</div>
              <div className="text-text-muted text-sm mt-1 mb-4">
                {selectedCount} notices pending approval
              </div>

              <Accordion
                type="single"
                collapsible
                onValueChange={(v) => v && play("ac_accordion")}
                className="space-y-2"
              >
                {targetArr.map((idx, i) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${i}`}
                    className="rounded border-0"
                    style={{ border: "1px solid hsl(var(--border-subtle))" }}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="font-mono text-sm">
                        Notice {i + 1}: {TARGETS[idx].domain}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <pre className="font-mono text-[11px] text-text-secondary whitespace-pre-wrap leading-relaxed">
{`DMCA TAKEDOWN NOTICE
Pursuant to 17 U.S.C. § 512(c)

INFRINGING URL: ${TARGETS[idx].domain}
PLATFORM: ${TARGETS[idx].platform}
IMPACT SCORE: ${TARGETS[idx].impact}/100
ESTIMATED VIEWERS: ${TARGETS[idx].viewers.toLocaleString()}

Under penalty of perjury, we certify
authorization to act on behalf of the
rights holder.`}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div
                className="mt-5 rounded-md p-4 space-y-3"
                style={{ background: "hsl(var(--bg-void))", border: "1px solid hsl(var(--red-critical) / 0.4)" }}
              >
                <div className="text-[11px] tracking-widest text-text-muted font-display">
                  TYPE CONFIRM TO AUTHORIZE SUBMISSION
                </div>
                <motion.input
                  animate={shake ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  value={confirmText}
                  onChange={(e) => {
                    play("ac_confirm_key");
                    const v = e.target.value;
                    setConfirmText(v);
                    if (v === "CONFIRM") play("ac_confirm_done");
                  }}
                  placeholder="Type CONFIRM here..."
                  className="w-full h-12 bg-void font-mono text-sm px-4 rounded-md outline-none transition-all"
                  style={{
                    border: `1px solid ${
                      confirmText === "CONFIRM"
                        ? "hsl(var(--green-safe))"
                        : shake
                          ? "hsl(var(--red-critical))"
                          : "hsl(var(--border-subtle))"
                    }`,
                    color: "hsl(var(--text-primary))",
                  }}
                />
              </div>

              <motion.button
                onClick={handleApprove}
                disabled={confirmText !== "CONFIRM"}
                whileHover={confirmText === "CONFIRM" ? { y: -2 } : {}}
                animate={
                  confirmText === "CONFIRM"
                    ? {
                        boxShadow: [
                          "0 0 10px hsl(var(--red-critical) / 0.4)",
                          "0 0 25px hsl(var(--red-critical) / 0.8)",
                          "0 0 10px hsl(var(--red-critical) / 0.4)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-full h-14 mt-4 rounded-md font-display font-bold text-lg transition-all"
                style={{
                  background:
                    confirmText === "CONFIRM"
                      ? "linear-gradient(135deg, #ff2d2d, #cc0000)"
                      : "hsl(var(--bg-elevated))",
                  color:
                    confirmText === "CONFIRM" ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))",
                  cursor: confirmText === "CONFIRM" ? "pointer" : "not-allowed",
                }}
              >
                ✅ APPROVE ALL & SUBMIT
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* approving overlay */}
      <AnimatePresence>
        {phase === "approving" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(0,0,0,0.85)" }}
          >
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-red-critical text-glow-red animate-pulse">
                AUTHORIZING...
              </div>
              <div className="font-mono text-text-muted text-sm mt-2">
                Submitting {selectedCount} notices
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
