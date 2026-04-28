import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { play } from "@/lib/sounds";

type Metric = {
  icon: string;
  label: string;
  value: number;
  format: (n: number) => string;
  subtitle: string;
  accent: string;
  cash?: boolean;
};

const METRICS: Metric[] = [
  {
    icon: "🔄",
    label: "REDIRECTS SERVED",
    value: 48291,
    format: (n) => n.toLocaleString("en-US"),
    subtitle: "+2,847 today",
    accent: "hsl(var(--blue-intel))",
  },
  {
    icon: "✅",
    label: "CONVERTED TO PAID",
    value: 3847,
    format: (n) => n.toLocaleString("en-US"),
    subtitle: "7.96% conversion rate",
    accent: "hsl(var(--green-safe))",
  },
  {
    icon: "💰",
    label: "REVENUE ATTRIBUTED",
    value: 38088000,
    format: (n) => "₹" + n.toLocaleString("en-IN"),
    subtitle: "This month",
    accent: "hsl(var(--green-safe))",
    cash: true,
  },
  {
    icon: "⏱️",
    label: "AVG TIME TO CONVERT",
    value: 134,
    format: (n) => {
      const m = Math.floor(n / 60);
      const s = n % 60;
      return `${m}m ${s}s`;
    },
    subtitle: "From redirect to payment",
    accent: "hsl(var(--purple-ai))",
  },
];

const BAR_DATA = [
  { day: "Mon", v: 412 },
  { day: "Tue", v: 389 },
  { day: "Wed", v: 521 },
  { day: "Thu", v: 478 },
  { day: "Fri", v: 634 },
  { day: "Sat", v: 891 },
  { day: "Sun", v: 522 },
];

const PIE_DATA = [
  { name: "India", value: 44, color: "hsl(var(--red-critical))" },
  { name: "UK", value: 28, color: "hsl(var(--orange-high))" },
  { name: "USA", value: 18, color: "hsl(var(--blue-intel))" },
  { name: "Other", value: 10, color: "hsl(var(--text-muted))" },
];

export function Dashboard() {
  return (
    <section>
      <h2 className="font-display font-bold text-xl text-text-primary">
        CONVERSION DASHBOARD
      </h2>
      <p className="text-text-secondary text-sm mb-4">Real-time revenue attribution</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} metric={m} delay={2.2 + i * 0.1} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6 }}
          className="glass rounded-xl p-5"
        >
          <h3 className="font-display font-bold text-text-primary mb-4">
            Daily Conversions — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BAR_DATA}>
              <XAxis dataKey="day" stroke="hsl(var(--text-muted))" fontSize={11} />
              <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--bg-elevated))",
                  border: "1px solid hsl(var(--border-glow))",
                  borderRadius: 6,
                  color: "hsl(var(--text-primary))",
                }}
                cursor={{ fill: "hsl(var(--green-safe) / 0.08)" }}
              />
              <Bar
                dataKey="v"
                fill="hsl(var(--green-safe))"
                fillOpacity={0.7}
                radius={[4, 4, 0, 0]}
                animationBegin={0}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7 }}
          className="glass rounded-xl p-5 relative"
        >
          <h3 className="font-display font-bold text-text-primary mb-4">
            Conversions by Region
          </h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {PIE_DATA.map((d) => (
                    <Cell key={d.name} fill={d.color} stroke="hsl(var(--bg-void))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--bg-elevated))",
                    border: "1px solid hsl(var(--border-glow))",
                    borderRadius: 6,
                    color: "hsl(var(--text-primary))",
                  }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11, color: "hsl(var(--text-secondary))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none top-[-20px]">
              <div className="font-mono text-2xl font-bold text-green-safe">7.96%</div>
              <div className="text-[10px] text-text-secondary tracking-wider">
                Conversion Rate
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({ metric, delay }: { metric: Metric; delay: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const playT = setTimeout(() => {
      try {
        play(metric.cash ? "conv_metric_cash" : "conv_metric_load");
      } catch {
        /* noop */
      }
    }, delay * 1000);
    const start = Date.now() + delay * 1000;
    const dur = 1200;
    let raf = 0;
    const loop = () => {
      const t = Math.max(0, Math.min(1, (Date.now() - start) / dur));
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * metric.value));
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      clearTimeout(playT);
      cancelAnimationFrame(raf);
    };
  }, [metric, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-4 relative overflow-hidden"
      style={{ borderColor: metric.accent.replace(")", " / 0.3)") }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{metric.icon}</span>
        <span
          className="text-[10px] font-display font-bold tracking-widest"
          style={{ color: metric.accent }}
        >
          {metric.label}
        </span>
      </div>
      <div
        className="font-mono font-bold text-2xl"
        style={{ color: metric.accent, textShadow: `0 0 12px ${metric.accent.replace(")", " / 0.5)")}` }}
      >
        {metric.format(val)}
      </div>
      <div className="text-xs text-text-secondary mt-1">{metric.subtitle}</div>
    </motion.div>
  );
}
