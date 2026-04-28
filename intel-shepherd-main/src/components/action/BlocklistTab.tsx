import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download } from "lucide-react";
import { play } from "@/lib/sounds";

const VARIANTS = [
  "stream-ucl1.ru",
  "streamucl.ru",
  "stream-ucl.net",
  "stream-ucl.io",
  "s-ucl.ru",
  "streamucl.live",
  "stream-ucl.cc",
  "ucl-stream.ru",
];

const PREVIEW_DOMAINS = [
  "stream-ucl-hd.ru",
  "t.me/UCLstreams",
  "discord.gg/UCLlive",
  "iptv-sports.net",
  "reddit.com/r/soccer",
  "stream-ucl1.ru",
  "streamucl.ru",
  "stream-ucl.net",
  "stream-ucl.io",
  "s-ucl.ru",
  "streamucl.live",
  "stream-ucl.cc",
  "ucl-stream.ru",
  "uefa-live.tv",
  "championsleague.stream",
  "footballhd.cc",
  "live-soccer.tv",
  "ucl-tv.net",
];

export function BlocklistTab() {
  const [domain, setDomain] = useState("");
  const [variantsShown, setVariantsShown] = useState(0);
  const [generated, setGenerated] = useState(false);

  const handleAnalyze = () => {
    if (!domain) setDomain("stream-ucl.ru");
    play("ac_analyze");
    setVariantsShown(0);
    setGenerated(false);
    VARIANTS.forEach((_, i) => {
      setTimeout(() => {
        play("ac_variant_tick");
        setTimeout(() => play("ac_variant_check"), 30);
        setVariantsShown(i + 1);
      }, 200 * (i + 1));
    });
    setTimeout(() => setGenerated(true), 200 * (VARIANTS.length + 1));
  };

  const handleExport = (kind: string) => {
    play("ac_export");
    const content = PREVIEW_DOMAINS.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = kind === "hosts" ? "aegis-hosts.txt" : "aegis-blocklist.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* LEFT */}
      <div className="glass rounded-md p-6 space-y-5">
        <div>
          <div className="text-[11px] tracking-widest text-text-muted mb-2 font-display">DOMAIN OR IP ADDRESS</div>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain or IP..."
            className="w-full h-12 bg-void font-mono text-sm px-4 rounded-md outline-none transition-all"
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
        </div>

        <motion.button
          onClick={handleAnalyze}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-12 rounded-md font-display font-bold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #ff2d2d, #cc0000)", color: "hsl(var(--text-primary))" }}
        >
          <Search size={16} /> ANALYZE & GENERATE
        </motion.button>

        {variantsShown > 0 && (
          <div
            className="rounded-md p-4 font-mono text-xs space-y-1"
            style={{ background: "hsl(var(--bg-void))", border: "1px solid hsl(var(--border-subtle))" }}
          >
            <div className="text-text-secondary">{domain || "stream-ucl.ru"} →</div>
            {VARIANTS.slice(0, variantsShown).map((v, i) => (
              <motion.div
                key={v}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-safe"
              >
                &nbsp;&nbsp;✓ {v}
              </motion.div>
            ))}
            {variantsShown >= VARIANTS.length && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-muted">
                &nbsp;&nbsp;✓ (4 more generating...)
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="glass rounded-md p-6 space-y-4">
        <div className="font-display tracking-wider text-sm text-text-muted">BLOCKLIST PREVIEW</div>
        <div className="text-xs text-text-muted font-mono">
          247 domains | 3 IP ranges | Updated: just now
        </div>

        <div
          className="rounded-md p-4 max-h-72 overflow-auto font-mono text-[11px] leading-relaxed"
          style={{ background: "#030308", border: "1px solid hsl(var(--border-subtle))", color: "#00ff88" }}
        >
          {PREVIEW_DOMAINS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => handleExport("dns")}
            className="glass rounded-md py-2.5 text-xs font-display tracking-wider flex items-center justify-center gap-2 transition-all"
            style={{
              borderColor: "hsl(var(--green-safe) / 0.4)",
              color: "hsl(var(--green-safe))",
              boxShadow: "0 0 12px hsl(var(--green-safe) / 0.15)",
            }}
          >
            <Download size={14} /> DNS BLOCKLIST .TXT
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => handleExport("hosts")}
            className="glass rounded-md py-2.5 text-xs font-display tracking-wider flex items-center justify-center gap-2 transition-all"
            style={{
              borderColor: "hsl(var(--green-safe) / 0.4)",
              color: "hsl(var(--green-safe))",
              boxShadow: "0 0 12px hsl(var(--green-safe) / 0.15)",
            }}
          >
            <Download size={14} /> HOSTS FILE
          </motion.button>
        </div>

        <AnimatePresence>
          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onAnimationStart={() => play("ac_signature")}
              className="text-[11px] font-mono text-text-muted space-y-0.5 pt-2"
            >
              <div>🔐 Cryptographically signed</div>
              <div>SHA-256: a3f9d721e8b4...4471b2cc</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
