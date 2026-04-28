import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { play } from "@/lib/sounds";
import { ScanlineOverlay, RedParticles } from "@/components/action/Ambient";
import { Typewriter } from "@/components/action/Typewriter";
import { TabBar, type ActionTabId } from "@/components/action/TabBar";
import { DMCATab } from "@/components/action/DMCATab";
import { QueueTab } from "@/components/action/QueueTab";
import { BlocklistTab } from "@/components/action/BlocklistTab";
import { NukeTab, NukeVignette } from "@/components/action/NukeTab";

const ActionCenter = () => {
  const [active, setActive] = useState<ActionTabId>("dmca");
  const [headerIn, setHeaderIn] = useState(false);
  const [tabsIn, setTabsIn] = useState(false);
  const [contentIn, setContentIn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => play("ac_entry_thud"), 0);
    const t2 = setTimeout(() => setHeaderIn(true), 100);
    const t3 = setTimeout(() => play("ac_entry_ticks"), 300);
    const t4 = setTimeout(() => setTabsIn(true), 500);
    const t5 = setTimeout(() => {
      play("ac_entry_chord");
      setContentIn(true);
    }, 700);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: "#03030a" }}>
      <ScanlineOverlay />
      <RedParticles />
      <NukeVignette visible={active === "nuke"} />

      <div className="relative z-10 px-6 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <AnimatePresence>
          {headerIn && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight text-text-primary">
                ACTION CENTER
              </h1>
              <div className="mt-2 font-mono text-xs tracking-wider text-text-muted">
                <Typewriter
                  text="AEGIS // SECTOR // ACTION CENTER"
                  speed={30}
                  startDelay={300}
                  showCursor
                  silent
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        {tabsIn && (
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <TabBar active={active} onChange={setActive} />
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {contentIn && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                {active === "dmca" && <DMCATab />}
                {active === "queue" && <QueueTab />}
                {active === "blocklist" && <BlocklistTab />}
                {active === "nuke" && <NukeTab />}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActionCenter;
