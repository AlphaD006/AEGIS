import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  spark: number[];
  color: "red" | "green" | "blue" | "orange" | "purple";
  delay?: number;
}

const colorMap = {
  red: { token: "hsl(var(--red-critical))", text: "text-red-critical" },
  green: { token: "hsl(var(--green-safe))", text: "text-green-safe" },
  blue: { token: "hsl(var(--blue-intel))", text: "text-blue-intel" },
  orange: { token: "hsl(var(--orange-high))", text: "text-orange-high" },
  purple: { token: "hsl(var(--purple-ai))", text: "text-purple-ai" },
};

export function MetricCard({ icon: Icon, label, value, subtitle, spark, color, delay = 0 }: Props) {
  const c = colorMap[color];
  const data = spark.map((v, i) => ({ i, v }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="glass-elevated rounded-lg p-3 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
            {label}
          </span>
        </div>
      </div>
      <div className={`font-mono font-semibold text-2xl ${c.text}`} style={{ textShadow: `0 0 12px ${c.token}66` }}>
        {value}
      </div>
      <div className="h-8 -mx-1 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={c.token}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-[10px] text-text-muted mt-1">{subtitle}</p>
    </motion.div>
  );
}
