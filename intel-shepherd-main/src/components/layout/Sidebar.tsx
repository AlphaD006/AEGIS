import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Network,
  Dna,
  RefreshCw,
  Zap,
  ShieldAlert,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { play } from "@/lib/sounds";

const NAV = [
  { to: "/war-room", label: "War Room", Icon: Home },
  { to: "/propagation", label: "Propagation", Icon: Network },
  { to: "/leak-attribution", label: "Leak Attribution", Icon: Dna },
  { to: "/conversion", label: "Conversion", Icon: RefreshCw },
  { to: "/action-center", label: "Action Center", Icon: Zap },
  { to: "/prediction", label: "Prediction", Icon: ShieldAlert },
  { to: "/dashboard", label: "Dashboard", Icon: BarChart3 },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const location = useLocation();

  const handleToggle = () => {
    play("sidebar_toggle");
    toggle();
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="relative z-30 h-screen bg-surface/80 backdrop-blur-md border-r border-border-subtle flex flex-col shrink-0"
    >
      {/* Toggle */}
      <button
        onClick={handleToggle}
        className="h-12 flex items-center justify-end pr-3 border-b border-border-subtle text-text-muted hover:text-text-primary transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="flex flex-col gap-1 px-2">
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname === to;
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => play("select")}
                  className={`group relative flex items-center gap-3 h-10 px-2.5 rounded-md transition-colors ${
                    active
                      ? "bg-elevated text-text-primary"
                      : "text-text-secondary hover:bg-elevated/60 hover:text-text-primary"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="active-accent"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-red-critical"
                      style={{ boxShadow: "0 0 12px hsl(var(--red-critical) / 0.7)" }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={active ? "text-red-critical" : "text-text-secondary group-hover:text-blue-intel"}
                    style={active ? { filter: "drop-shadow(0 0 6px hsl(var(--red-critical) / 0.7))" } : undefined}
                  />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-xs uppercase tracking-wider whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-safe" style={{ boxShadow: "0 0 10px hsl(var(--green-safe))" }} />
            <span className="absolute inset-0 rounded-full bg-green-safe animate-ping opacity-60" />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[10px] uppercase tracking-widest text-text-secondary whitespace-nowrap"
              >
                ⚡ AEGIS v2.1 ACTIVE
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
