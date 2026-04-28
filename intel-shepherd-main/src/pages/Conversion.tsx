import { motion } from "framer-motion";
import { useEffect } from "react";
import { play } from "@/lib/sounds";
import { FlowDiagram } from "@/components/conversion/FlowDiagram";
import { AppetiteScore } from "@/components/conversion/AppetiteScore";
import { OfferCards } from "@/components/conversion/OfferCards";
import { Dashboard } from "@/components/conversion/Dashboard";
import { ScanlineOverlay, GreenParticles } from "@/components/conversion/Ambient";
import { Breadcrumb } from "@/components/conversion/Breadcrumb";

const Conversion = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = "AEGIS — Conversion Engine";
    return () => {
      document.title = prev;
    };
  }, []);

  // Cinematic entry sounds
  useEffect(() => {
    const t0 = setTimeout(() => play("conv_entry_thud"), 0);
    const t1 = setTimeout(() => play("conv_entry_tick"), 400);
    const t2 = setTimeout(() => play("conv_entry_ready"), 800);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-full p-6 md:p-8 relative"
      style={{ background: "#03030a" }}
      data-demo="conversion"
    >
      <GreenParticles />
      <ScanlineOverlay />

      <div className="relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
        >
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight">
            CONVERSION ENGINE
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-1 mb-6"
        >
          <Breadcrumb text="AEGIS // SECTOR // CONVERSION" delay={400} />
        </motion.div>

        {/* Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <FlowDiagram />
        </motion.div>

        {/* Appetite */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 140, damping: 20 }}
          className="mt-8"
        >
          <AppetiteScore />
        </motion.div>

        {/* Offers */}
        <div className="mt-8">
          <OfferCards />
        </div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="mt-8"
        >
          <Dashboard />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Conversion;
