import { motion } from "framer-motion";
import { play, type SoundName } from "@/lib/sounds";
import { useState } from "react";

interface Row {
  rank: number;
  domain: string;
  platform: string;
  country: string;
  flag: string;
  impact: number;
  viewers: number;
  severity: "crit" | "high" | "med";
}

const ROWS: Row[] = [
  { rank: 1, domain: "stream-ucl-hd.ru", platform: "Custom IPTV", country: "Russia", flag: "🇷🇺", impact: 94, viewers: 41200, severity: "crit" },
  { rank: 2, domain: "t.me/UCLstreams", platform: "Telegram", country: "Russia", flag: "🇷🇺", impact: 87, viewers: 18400, severity: "high" },
  { rank: 3, domain: "discord.gg/UCLlive", platform: "Discord", country: "USA", flag: "🇺🇸", impact: 76, viewers: 8900, severity: "high" },
  { rank: 4, domain: "iptv-sports.net", platform: "Custom IPTV", country: "Poland", flag: "🇵🇱", impact: 71, viewers: 12100, severity: "med" },
  { rank: 5, domain: "reddit.com/r/soccer", platform: "Reddit", country: "USA", flag: "🇺🇸", impact: 58, viewers: 6200, severity: "med" },
];

const SEVERITY_COLOR: Record<Row["severity"], string> = {
  crit: "red-critical",
  high: "orange-high",
  med: "yellow-medium",
};
const SEVERITY_DOT: Record<Row["severity"], string> = { crit: "🔴", high: "🟠", med: "🟡" };
const HOVER_SOUND: Record<Row["severity"], SoundName> = {
  crit: "ac_row_hover_crit",
  high: "ac_row_hover_high",
  med: "ac_row_hover_med",
};

export function QueueTab() {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (rank: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(rank)) {
        play("ac_uncheck");
        n.delete(rank);
      } else {
        play("ac_check");
        n.add(rank);
      }
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === ROWS.length) {
      setSelected(new Set());
      return;
    }
    ROWS.forEach((_, i) => setTimeout(() => play("ac_check"), i * 40));
    setSelected(new Set(ROWS.map((r) => r.rank)));
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-md px-5 py-3 flex items-center gap-3"
        style={{ borderLeft: "3px solid hsl(var(--orange-high))", background: "hsl(var(--orange-high) / 0.05)" }}
      >
        <span className="text-orange-high">⚡</span>
        <span className="text-sm text-text-secondary">
          Top 3 nodes control <span className="text-text-primary font-mono font-semibold">78%</span> of network
          traffic — prioritize these first
        </span>
      </motion.div>

      <div className="glass rounded-md p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-[11px] tracking-widest font-display">
                <th className="text-left py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={selected.size === ROWS.length}
                    onChange={selectAll}
                    className="accent-red-critical cursor-pointer"
                  />
                </th>
                <th className="text-left py-2 pr-3">RANK</th>
                <th className="text-left py-2 pr-3">DOMAIN</th>
                <th className="text-left py-2 pr-3">PLATFORM</th>
                <th className="text-left py-2 pr-3">COUNTRY</th>
                <th className="text-left py-2 pr-3">IMPACT</th>
                <th className="text-right py-2 pr-3">VIEWERS</th>
                <th className="text-left py-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <motion.tr
                  key={r.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onMouseEnter={() => play(HOVER_SOUND[r.severity])}
                  className="border-t hover:bg-elevated/40 transition-colors"
                  style={{ borderColor: "hsl(var(--border-subtle))" }}
                >
                  <td className="py-3 pr-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.rank)}
                      onChange={() => toggle(r.rank)}
                      className="accent-red-critical cursor-pointer"
                    />
                  </td>
                  <td className="py-3 pr-3 font-mono">
                    {SEVERITY_DOT[r.severity]} {r.rank}
                  </td>
                  <td className="py-3 pr-3 font-mono text-text-primary">{r.domain}</td>
                  <td className="py-3 pr-3 text-text-secondary">{r.platform}</td>
                  <td className="py-3 pr-3 text-text-secondary">
                    {r.flag} {r.country}
                  </td>
                  <td className="py-3 pr-3" style={{ minWidth: 140 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded bg-void overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${r.impact}%` }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                          className="h-full"
                          style={{ background: `hsl(var(--${SEVERITY_COLOR[r.severity]}))` }}
                        />
                      </div>
                      <span className="font-mono text-xs w-12 text-right" style={{ color: `hsl(var(--${SEVERITY_COLOR[r.severity]}))` }}>
                        {r.impact}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-mono text-right">{r.viewers.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => play("ac_btn_notice")}
                        className="px-2 py-1 text-[11px] rounded glass hover:border-red-critical transition-all text-text-secondary"
                      >
                        Notice
                      </button>
                      <button
                        onClick={() => play("ac_btn_blocklist")}
                        className="px-2 py-1 text-[11px] rounded glass hover:border-blue-intel transition-all text-text-secondary"
                      >
                        Blocklist
                      </button>
                      <button
                        onClick={() => play("ac_btn_nuke")}
                        className="px-2 py-1 text-[11px] rounded glass hover:border-red-critical transition-all"
                        style={{ color: "hsl(var(--red-critical))" }}
                      >
                        Nuke
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
