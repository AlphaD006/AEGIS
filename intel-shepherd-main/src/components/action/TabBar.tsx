import { motion } from "framer-motion";
import { play, type SoundName } from "@/lib/sounds";

export type ActionTabId = "dmca" | "queue" | "blocklist" | "nuke";

const TABS: { id: ActionTabId; label: string; icon: string; sound: SoundName }[] = [
  { id: "dmca", label: "DMCA GENERATOR", icon: "⚡", sound: "ac_tab_dmca" },
  { id: "queue", label: "PRIORITY QUEUE", icon: "📋", sound: "ac_tab_queue" },
  { id: "blocklist", label: "BLOCKLIST GENERATOR", icon: "🔒", sound: "ac_tab_blocklist" },
  { id: "nuke", label: "ONE-CLICK NUKE", icon: "💀", sound: "ac_tab_nuke" },
];

interface Props {
  active: ActionTabId;
  onChange: (id: ActionTabId) => void;
}

export function TabBar({ active, onChange }: Props) {
  return (
    <div
      className="grid grid-cols-4 glass rounded-md overflow-hidden"
      style={{ borderBottom: "1px solid hsl(var(--border-subtle))" }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onMouseEnter={() => !isActive && play("ac_tab_indicator")}
            onClick={() => {
              if (isActive) return;
              play(t.sound);
              play("ac_tab_indicator");
              onChange(t.id);
            }}
            className="relative h-[52px] px-4 flex items-center justify-center gap-2 transition-colors font-display tracking-wider text-sm"
            style={{
              color: isActive ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))",
              background: isActive ? "hsl(var(--red-critical) / 0.05)" : "transparent",
              borderLeft: isActive ? "3px solid hsl(var(--red-critical))" : "3px solid transparent",
            }}
            onMouseOver={(e) => {
              if (!isActive) e.currentTarget.style.color = "hsl(var(--text-secondary))";
            }}
            onMouseOut={(e) => {
              if (!isActive) e.currentTarget.style.color = "hsl(var(--text-muted))";
            }}
          >
            <span>{t.icon}</span>
            <span className="hidden md:inline">{t.label}</span>
            {isActive && (
              <motion.div
                layoutId="acTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: "hsl(var(--red-critical))", boxShadow: "0 0 8px hsl(var(--red-critical))" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
