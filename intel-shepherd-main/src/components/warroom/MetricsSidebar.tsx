import { useEffect, useState } from "react";
import { Radio, DollarSign, Zap, Network, Dna } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { usePiracyStore } from "@/store/piracyStore";

const SPARK_LEN = 7;

function pushSpark(arr: number[], v: number) {
  const n = [...arr, v];
  if (n.length > SPARK_LEN) n.shift();
  return n;
}

export function MetricsSidebar() {
  const { totalFlagged, scanRunning } = usePiracyStore();

  const [streams, setStreams] = useState(2847);
  const [revenue, setRevenue] = useState(94200);
  const [notice, setNotice] = useState(8.3);
  const [chains, setChains] = useState(847);
  const [leaks, setLeaks] = useState(23);

  const [streamsSpark, setStreamsSpark] = useState([2820, 2825, 2830, 2835, 2840, 2843, 2847]);
  const [revenueSpark, setRevenueSpark] = useState([93400, 93600, 93800, 93950, 94050, 94150, 94200]);
  const [noticeSpark, setNoticeSpark] = useState([8.1, 8.4, 8.2, 8.5, 8.3, 8.4, 8.3]);
  const [chainsSpark, setChainsSpark] = useState([835, 838, 840, 842, 844, 846, 847]);
  const [leaksSpark, setLeaksSpark] = useState([20, 20, 21, 21, 22, 22, 23]);

  // Sync real flagged count into streams metric
  useEffect(() => {
    if (totalFlagged > 0) {
      setStreams((prev) => {
        const next = Math.max(prev, 2847 + totalFlagged);
        setStreamsSpark((s) => pushSpark(s, next));
        return next;
      });
    }
  }, [totalFlagged]);

  useEffect(() => {
    const i1 = setInterval(() => {
      const inc = 1 + Math.floor(Math.random() * 3);
      setStreams((p) => {
        const n = p + inc;
        setStreamsSpark((s) => pushSpark(s, n));
        return n;
      });
    }, 2000 + Math.random() * 1000);

    const i2 = setInterval(() => {
      const inc = 50 + Math.floor(Math.random() * 150);
      setRevenue((p) => {
        const n = p + inc;
        setRevenueSpark((s) => pushSpark(s, n));
        return n;
      });
    }, 3000 + Math.random() * 1000);

    const i3 = setInterval(() => {
      setNotice((p) => {
        const n = +(p + (Math.random() * 0.4 - 0.2)).toFixed(1);
        setNoticeSpark((s) => pushSpark(s, n));
        return n;
      });
    }, 5000);

    const i4 = setInterval(() => {
      setChains((p) => {
        const n = p + 1;
        setChainsSpark((s) => pushSpark(s, n));
        return n;
      });
    }, 4000 + Math.random() * 1000);

    const i5 = setInterval(() => {
      setLeaks((p) => {
        const n = p + 1;
        setLeaksSpark((s) => pushSpark(s, n));
        return n;
      });
    }, 15000 + Math.random() * 5000);

    return () => [i1, i2, i3, i4, i5].forEach(clearInterval);
  }, []);

  const streamsSubtitle = scanRunning
    ? `+${totalFlagged} flagged this session`
    : totalFlagged > 0
      ? `+${totalFlagged} flagged • IPL 2026`
      : "IPL 2026 LIVE";

  return (
    <div className="w-[280px] flex-shrink-0 space-y-2 p-3 overflow-y-auto">
      <MetricCard
        icon={Radio}
        label="UNAUTHORIZED STREAMS"
        value={streams.toLocaleString()}
        subtitle={streamsSubtitle}
        spark={streamsSpark}
        color="red"
        delay={0.6}
      />
      <MetricCard
        icon={DollarSign}
        label="REVENUE RECOVERED"
        value={`$${revenue.toLocaleString()}`}
        subtitle="+$340 this minute"
        spark={revenueSpark}
        color="green"
        delay={0.7}
      />
      <MetricCard
        icon={Zap}
        label="AVG NOTICE TIME"
        value={`${notice.toFixed(1)}s`}
        subtitle="industry avg: 4.2 hours"
        spark={noticeSpark}
        color="blue"
        delay={0.8}
      />
      <MetricCard
        icon={Network}
        label="PROPAGATION CHAINS"
        value={chains.toLocaleString()}
        subtitle="+3 chains mapped"
        spark={chainsSpark}
        color="orange"
        delay={0.9}
      />
      <MetricCard
        icon={Dna}
        label="LEAK SOURCES"
        value={leaks.toString()}
        subtitle="2 attributed today"
        spark={leaksSpark}
        color="purple"
        delay={1.0}
      />
    </div>
  );
}
