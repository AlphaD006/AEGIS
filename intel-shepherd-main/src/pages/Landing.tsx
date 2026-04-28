import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogoAssemble } from "@/components/landing/LogoAssemble";
import { Tagline } from "@/components/landing/Tagline";
import { GhostGlobe } from "@/components/landing/GhostGlobe";
import { PersonaCard } from "@/components/landing/PersonaCard";
import { PERSONAS, usePersonaStore, type Persona } from "@/store/personaStore";
import { play, resumeAudio } from "@/lib/sounds";
import { SoundToggle } from "@/components/SoundToggle";

/**
 * Cinematic boot sequence + clearance selection.
 * Timeline:
 *   0.0s  Logo letters assemble
 *   1.0s  Tagline types in
 *   2.0s  Ghost globe fades in
 *   3.0s  Red horizontal scanline sweep
 *   3.5s  "SELECT CLEARANCE LEVEL" appears
 *   4.0s  Persona cards slide up, staggered
 */
const Landing = () => {
  const navigate = useNavigate();
  const setPersona = usePersonaStore((s) => s.setPersona);
  const [accessFlash, setAccessFlash] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [bootedSoundOnce, setBootedSoundOnce] = useState(false);

  // SEO
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "AEGIS — Anti-Piracy Intelligence Platform";

    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "AEGIS: AI-powered anti-piracy intelligence. Protect, detect, and recover stolen streams in real time.",
    );
    if (!meta.parentNode) document.head.appendChild(meta);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/";

    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Trigger boot sound 0.5s after mount
  useEffect(() => {
    const t = setTimeout(() => {
      void resumeAudio();
      play("boot");
      setBootedSoundOnce(true);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (p: Persona) => {
    setAccessFlash(true);
    play("access");
    setTimeout(() => setWipe(true), 500);
    setTimeout(() => {
      setPersona(p);
      navigate("/war-room");
    }, 1100);
  };

  // Mark unused warning silent
  void bootedSoundOnce;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-void noise text-text-primary">
      {/* Sound toggle - top right, always visible */}
      <div className="absolute top-5 right-5 z-50">
        <SoundToggle />
      </div>

      {/* Ghost globe behind everything */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <GhostGlobe className="w-[80vmin] h-[80vmin] max-w-[700px] max-h-[700px]" />
      </div>

      {/* Hero block */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-[12vh] gap-6">
        <h1 className="sr-only">AEGIS — Anti-Piracy Intelligence Platform</h1>
        <LogoAssemble />
        <Tagline />
      </section>

      {/* Red horizontal scan sweep at t=3s */}
      <motion.div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{
          top: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, hsl(var(--red-critical)) 50%, transparent)",
          boxShadow: "0 0 24px hsl(var(--red-critical) / 0.9), 0 0 8px hsl(var(--red-critical))",
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: ["-10px", "100vh"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.4, delay: 3, times: [0, 0.1, 0.9, 1], ease: "linear" }}
      />

      {/* Clearance selection */}
      <section className="relative z-10 mt-12 md:mt-16 px-6 pb-16 flex flex-col items-center">
        <motion.h2
          className="font-mono text-text-muted text-[11px] uppercase mb-8"
          style={{ letterSpacing: "0.4em" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 3.5 }}
        >
          ▾ SELECT CLEARANCE LEVEL ▾
        </motion.h2>

        <div className="flex flex-col md:flex-row gap-5 md:gap-6 w-full max-w-4xl items-center justify-center">
          {PERSONAS.map((p, i) => (
            <PersonaCard key={p.id} persona={p} index={i} onSelect={handleSelect} />
          ))}
        </div>

        <motion.p
          className="font-mono text-text-muted text-[10px] uppercase mt-12 text-center max-w-md"
          style={{ letterSpacing: "0.25em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 4.6 }}
        >
          AEGIS v2.1 • SECURE TERMINAL • ALL ACCESS LOGGED
        </motion.p>
      </section>

      {/* ACCESS GRANTED flash */}
      <AnimatePresence>
        {accessFlash && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-red-critical/15" />
            <motion.div
              className="font-display font-bold text-3xl md:text-5xl text-red-critical text-glow-red tracking-[0.3em]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [0.85, 1.05, 1], opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              ACCESS GRANTED
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wipe transition */}
      <AnimatePresence>
        {wipe && (
          <motion.div
            key="wipe"
            className="fixed inset-0 z-50 bg-void"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Landing;
