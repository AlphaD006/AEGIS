import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { play, type SoundName } from "@/lib/sounds";
import { Slider } from "@/components/ui/slider";

const COUNTRIES: { code: string; flag: string; name: string; sound: SoundName }[] = [
  { code: "IN", flag: "🇮🇳", name: "India", sound: "conv_country_in" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", sound: "conv_country_uk" },
  { code: "US", flag: "🇺🇸", name: "United States", sound: "conv_country_us" },
  { code: "BR", flag: "🇧🇷", name: "Brazil", sound: "conv_country_br" },
  { code: "RU", flag: "🇷🇺", name: "Russia", sound: "conv_country_ru" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia", sound: "conv_country_id" },
  { code: "TR", flag: "🇹🇷", name: "Turkey", sound: "conv_country_tr" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan", sound: "conv_country_pk" },
];

const DEVICES: { id: string; label: string; icon: string; sound: SoundName }[] = [
  { id: "mobile", label: "Mobile", icon: "📱", sound: "conv_dev_mobile" },
  { id: "desktop", label: "Desktop", icon: "💻", sound: "conv_dev_desktop" },
  { id: "tv", label: "Smart TV", icon: "📺", sound: "conv_dev_tv" },
  { id: "stb", label: "Set-top Box", icon: "📡", sound: "conv_dev_stb" },
];

const BEHAVIORS: { id: string; label: string; sound: SoundName }[] = [
  { id: "direct", label: "Direct URL", sound: "conv_beh_direct" },
  { id: "search", label: "Searched", sound: "conv_beh_search" },
  { id: "ref", label: "Referred", sound: "conv_beh_referred" },
  { id: "repeat", label: "Repeat Visitor", sound: "conv_beh_repeat" },
];

const CONTENTS = [
  { id: "sports", label: "Live Sports", icon: "⚽" },
  { id: "movie", label: "Movie", icon: "🎬" },
  { id: "series", label: "Series", icon: "📺" },
  { id: "ppv", label: "PPV", icon: "🥊" },
];

function timePeriod(h: number) {
  if (h < 6) return { label: "🌙 Night", sound: "conv_slide_night" as SoundName };
  if (h < 12) return { label: "🌅 Morning", sound: "conv_slide_morning" as SoundName };
  if (h < 18) return { label: "☀️ Afternoon", sound: "conv_slide_afternoon" as SoundName };
  if (h < 22) return { label: "🌆 Evening", sound: "conv_slide_evening" as SoundName };
  return { label: "🌙 Late Night", sound: "conv_slide_late" as SoundName };
}

function zoneFor(score: number) {
  if (score <= 40) return { color: "hsl(var(--green-safe))", label: "LIKELY TO CONVERT", sound: "conv_score_low" as SoundName };
  if (score <= 70) return { color: "hsl(var(--orange-high))", label: "MODERATE RESISTANCE", sound: "conv_score_med" as SoundName };
  return { color: "hsl(var(--red-critical))", label: "HIGH PIRACY INTENT", sound: "conv_score_high" as SoundName };
}

export function AppetiteScore() {
  const [country, setCountry] = useState("IN");
  const [device, setDevice] = useState("mobile");
  const [behavior, setBehavior] = useState("repeat");
  const [content, setContent] = useState("sports");
  const [hour, setHour] = useState(21);
  const [calculating, setCalculating] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const lastSlideRef = useRef(0);

  const period = timePeriod(hour);

  const onCountry = (code: string) => {
    setCountry(code);
    const c = COUNTRIES.find((x) => x.code === code);
    if (c) play(c.sound);
  };

  const calculate = () => {
    play("conv_calc_press");
    setCalculating(true);
    setScore(null);
    setTimeout(() => {
      // pseudo-deterministic
      const base =
        (country === "IN" ? 35 : country === "GB" ? 45 : country === "US" ? 50 : 55) +
        (device === "mobile" ? 5 : device === "tv" ? 12 : 8) +
        (behavior === "repeat" ? 0 : behavior === "search" ? 8 : behavior === "ref" ? 12 : 18) +
        (content === "sports" ? -5 : content === "ppv" ? 3 : 5) +
        (hour >= 18 && hour <= 22 ? -8 : 5);
      const final = Math.max(8, Math.min(96, Math.round(base)));
      setCalculating(false);
      setScore(final);
      const z = zoneFor(final);
      setTimeout(() => play(z.sound), 200);
    }, 3000);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="font-display font-bold text-xl text-text-primary">
          PIRACY APPETITE SCORE ENGINE
        </h2>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold text-white"
          style={{
            background: "hsl(var(--purple-ai))",
            border: "1px solid hsl(var(--purple-ai) / 0.7)",
            boxShadow: "0 0 12px hsl(var(--purple-ai) / 0.2)",
          }}
        >
          <Zap className="w-3 h-3" /> AI POWERED — CLAUDE
        </span>
      </div>

      <div
        className="glass rounded-xl p-6 grid gap-6 md:grid-cols-2"
        style={{ boxShadow: "0 0 20px hsl(var(--purple-ai) / 0.13)", borderColor: "hsl(var(--purple-ai) / 0.3)" }}
      >
        <div className="space-y-5">
          <Field label="TARGET COUNTRY">
            <select
              value={country}
              onChange={(e) => onCountry(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-md px-3 py-2 text-text-primary hover:border-border-glow focus:outline-none focus:border-purple-ai transition-colors"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="DEVICE TYPE">
            <ToggleGroup
              options={DEVICES.map((d) => ({ id: d.id, label: `${d.icon} ${d.label}` }))}
              value={device}
              onChange={(v) => {
                setDevice(v);
                const d = DEVICES.find((x) => x.id === v);
                if (d) play(d.sound);
              }}
            />
          </Field>

          <Field label="BEHAVIOR SIGNAL">
            <ToggleGroup
              options={BEHAVIORS.map((b) => ({ id: b.id, label: b.label }))}
              value={behavior}
              onChange={(v) => {
                setBehavior(v);
                const b = BEHAVIORS.find((x) => x.id === v);
                if (b) play(b.sound);
              }}
            />
          </Field>
        </div>

        <div className="space-y-5">
          <Field label="CONTENT TYPE">
            <ToggleGroup
              options={CONTENTS.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` }))}
              value={content}
              onChange={(v) => {
                setContent(v);
                play("conv_content");
              }}
            />
          </Field>

          <Field label="TIME OF DAY">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-2xl text-text-primary">
                {String(hour).padStart(2, "0")}:00
              </span>
              <span className="text-sm text-text-secondary">{period.label}</span>
            </div>
            <Slider
              value={[hour]}
              onValueChange={(v) => {
                const h = v[0];
                setHour(h);
                const now = Date.now();
                if (now - lastSlideRef.current > 60) {
                  lastSlideRef.current = now;
                  play(timePeriod(h).sound);
                }
              }}
              min={0}
              max={24}
              step={1}
            />
          </Field>

          <button
            onClick={calculate}
            disabled={calculating}
            className="w-full px-6 py-3 rounded-md font-display font-bold text-white transition-shadow disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, hsl(var(--purple-ai)), #9c5aff)",
              boxShadow: "0 0 12px hsl(var(--purple-ai) / 0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 30px hsl(var(--purple-ai) / 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 12px hsl(var(--purple-ai) / 0.4)";
            }}
          >
            ⚡ CALCULATE APPETITE SCORE
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {calculating && <LoadingCard key="loading" />}
        {!calculating && score !== null && (
          <ResultGauge key="result" score={score} country={country} device={device} />
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-display font-bold tracking-widest text-text-secondary mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
              active
                ? "text-white border-purple-ai"
                : "text-text-muted border-border-subtle hover:border-border-glow"
            }`}
            style={{
              background: active ? "hsl(var(--purple-ai))" : "hsl(var(--bg-surface))",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass rounded-xl p-8 mt-4 text-center relative overflow-hidden"
      style={{ borderColor: "hsl(var(--purple-ai) / 0.3)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-ai/40"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0,
            }}
            animate={{
              y: ["100%", "0%"],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      <p className="text-text-primary font-display mb-4">
        AEGIS AI analyzing behavioral vectors...
      </p>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-purple-ai"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ResultGauge({ score, country, device }: { score: number; country: string; device: string }) {
  const zone = zoneFor(score);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const dur = 1200;
    let raf = 0;
    const loop = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setDisplayed(Math.round(t * score));
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  // Gauge: half-circle from -90° to +90°
  // SVG arc setup
  const cx = 140, cy = 160, r = 110;
  const angleFor = (v: number) => -90 + (v / 100) * 180;
  const polar = (deg: number, rad = r) => {
    const rd = (deg - 90) * (Math.PI / 180);
    return { x: cx + rad * Math.cos(rd), y: cy + rad * Math.sin(rd) };
  };
  const arc = (start: number, end: number, color: string) => {
    const s = polar(angleFor(start) + 90);
    const e = polar(angleFor(end) + 90);
    const large = end - start > 50 ? 1 : 0;
    return (
      <path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`}
        stroke={color}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  const reasoning = `Based on ${device} device usage in ${country === "IN" ? "India" : country} during ${timePeriod(21).label.replace(/[^a-zA-Z ]/g, "").trim()} hours, this user shows ${zone.label.toLowerCase()} potential. Recommended: targeted legal offer with trial period.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="glass rounded-xl p-6 mt-4 grid md:grid-cols-2 gap-6 items-center"
      style={{ borderColor: "hsl(var(--purple-ai) / 0.3)" }}
    >
      <div className="flex flex-col items-center">
        <svg width="280" height="200" viewBox="0 0 280 200">
          {arc(0, 40, "hsl(var(--green-safe))")}
          {arc(40, 70, "hsl(var(--orange-high))")}
          {arc(70, 100, "hsl(var(--red-critical))")}
          {/* Needle */}
          <motion.line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 20}
            stroke={zone.color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ rotate: -90, originX: `${cx}px`, originY: `${cy}px` }}
            animate={{ rotate: angleFor(score) + 3 }}
            transition={{ type: "spring", stiffness: 100, damping: 8, delay: 0.1 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          <motion.line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 20}
            stroke={zone.color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ rotate: angleFor(score) + 3, originX: `${cx}px`, originY: `${cy}px`, opacity: 0 }}
            animate={{ rotate: angleFor(score), opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 8, delay: 1.0 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          <circle cx={cx} cy={cy} r="6" fill={zone.color} />
        </svg>
        <div
          className="font-mono text-5xl font-bold -mt-12"
          style={{ color: zone.color, textShadow: `0 0 16px ${zone.color}` }}
        >
          {displayed}
        </div>
        <div
          className="mt-3 font-display font-bold tracking-wider text-sm"
          style={{ color: zone.color }}
        >
          {zone.label}
        </div>
      </div>

      <div
        className="rounded-md p-4 bg-surface/60 border-l-4"
        style={{ borderLeftColor: "hsl(var(--purple-ai))" }}
      >
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-display font-bold text-white mb-2"
          style={{ background: "hsl(var(--purple-ai))" }}
        >
          <Zap className="w-3 h-3" /> AI POWERED
        </span>
        <p className="text-text-secondary italic text-sm leading-relaxed">{reasoning}</p>
      </div>
    </motion.div>
  );
}
