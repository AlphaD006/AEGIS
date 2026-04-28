import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Shield } from "lucide-react";
import { play } from "@/lib/sounds";

type Offer = {
  flag: string;
  country: string;
  platform: string;
  price: string;
  likelihood: number;
  recommended?: boolean;
  accent: string;
  hoverFreq: number;
};

const OFFERS: Offer[] = [
  {
    flag: "🇮🇳",
    country: "India",
    platform: "Hotstar",
    price: "₹99/month",
    likelihood: 68,
    recommended: true,
    accent: "hsl(var(--green-safe))",
    hoverFreq: 750,
  },
  {
    flag: "🇬🇧",
    country: "United Kingdom",
    platform: "Sky Sports",
    price: "£9.99/month",
    likelihood: 54,
    accent: "hsl(var(--blue-intel))",
    hoverFreq: 800,
  },
  {
    flag: "🇺🇸",
    country: "United States",
    platform: "ESPN+",
    price: "$10.99/month",
    likelihood: 47,
    accent: "hsl(var(--orange-high))",
    hoverFreq: 850,
  },
];

function likelihoodColor(p: number) {
  if (p > 60) return "hsl(var(--green-safe))";
  if (p >= 40) return "hsl(var(--orange-high))";
  return "hsl(var(--red-critical))";
}

export function OfferCards() {
  const [open, setOpen] = useState<Offer | null>(null);

  return (
    <section>
      <h2 className="font-display font-bold text-xl text-text-primary">
        PERSONALIZED OFFER ENGINE
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        Geo-aware legal platform redirect
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {OFFERS.map((o, i) => (
          <motion.div
            key={o.country}
            initial={{ opacity: 0, y: 30, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ delay: 1.8 + i * 0.15, type: "spring", stiffness: 140, damping: 18 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => play("conv_card_hover")}
            className="glass rounded-xl p-5 relative transition-shadow"
            style={{
              borderColor: o.accent.replace(")", " / 0.4)"),
              boxShadow: `0 0 20px ${o.accent.replace(")", " / 0.18)")}`,
            }}
          >
            {o.recommended && (
              <span
                className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-display font-bold text-bg-void"
                style={{ background: "hsl(var(--green-safe))" }}
              >
                RECOMMENDED
              </span>
            )}
            <div className="text-4xl mb-2">{o.flag}</div>
            <div className="text-text-secondary text-xs uppercase tracking-wider">
              {o.country}
            </div>
            <div className="font-display font-bold text-lg text-text-primary mt-1">
              {o.platform}
            </div>
            <div className="font-mono text-2xl text-text-primary mt-2">{o.price}</div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Conversion likelihood</span>
                <span style={{ color: likelihoodColor(o.likelihood) }}>{o.likelihood}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${o.likelihood}%` }}
                  transition={{ delay: 2.0 + i * 0.15, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: likelihoodColor(o.likelihood) }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setOpen(o);
                play("conv_modal_open");
              }}
              className="mt-4 w-full glass rounded-md py-2 text-xs font-display font-bold text-text-primary hover:border-border-glow transition-colors"
            >
              PREVIEW OFFER PAGE
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <OfferModal
            offer={open}
            onClose={() => {
              play("conv_modal_close");
              setOpen(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function OfferModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-elevated rounded-xl p-8 max-w-md w-full relative"
        style={{ borderColor: offer.accent }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-surface text-text-secondary"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-display font-bold tracking-widest text-text-secondary">
            AEGIS
          </span>
          <Shield className="w-6 h-6 text-red-critical" />
        </div>

        <h3 className="font-display font-bold text-2xl text-text-primary leading-tight">
          You were looking for a stream.
        </h3>
        <h3 className="font-display font-bold text-2xl text-text-primary leading-tight mb-6">
          Here's the real thing.
        </h3>

        <div className="bg-surface/60 rounded-md p-4 mb-4 text-center">
          <div className="text-4xl mb-2">{offer.flag}</div>
          <div className="font-display font-bold text-xl text-text-primary">
            {offer.platform}
          </div>
          <div className="font-mono text-2xl text-text-primary mt-2">{offer.price}</div>
          <div className="text-xs text-text-secondary mt-1">Cancel anytime</div>
        </div>

        <button
          className="w-full py-3 rounded-md font-display font-bold text-bg-void"
          style={{ background: "hsl(var(--green-safe))" }}
        >
          SUBSCRIBE NOW →
        </button>

        <p className="text-center text-text-muted text-[10px] mt-4">
          Powered by AEGIS Conversion Engine
        </p>
      </motion.div>
    </motion.div>
  );
}
