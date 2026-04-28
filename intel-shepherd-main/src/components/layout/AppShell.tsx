import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DemoGuide } from "./DemoGuide";
import { CriticalBleed } from "./ThreatBadge";
import { usePersonaStore, PERSONAS } from "@/store/personaStore";
import { useThreatStore } from "@/store/threatStore";

/**
 * Authenticated app shell. Wraps all protected routes.
 * Starts threat auto-escalation on mount.
 * Auto-selects IPL persona if none is active (for demo convenience).
 */
export function AppShell() {
  const persona = usePersonaStore((s) => s.current);
  const setPersona = usePersonaStore((s) => s.setPersona);
  const startAutoEscalation = useThreatStore((s) => s.startAutoEscalation);
  const stopAutoEscalation = useThreatStore((s) => s.stopAutoEscalation);

  useEffect(() => {
    startAutoEscalation();
    return () => stopAutoEscalation();
  }, [startAutoEscalation, stopAutoEscalation]);

  // Auto-select IPL persona if none chosen — avoids redirect to landing during dev
  useEffect(() => {
    if (!persona) {
      const ipl = PERSONAS.find((p) => p.id === "ipl");
      if (ipl) setPersona(ipl);
    }
  }, [persona, setPersona]);

  if (!persona) return <Navigate to="/" replace />;

  return (
    <div className="relative min-h-screen w-full bg-void noise text-text-primary flex">
      <CriticalBleed />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <DemoGuide />
    </div>
  );
}
