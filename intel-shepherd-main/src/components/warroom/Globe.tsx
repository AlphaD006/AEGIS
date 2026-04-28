import { useEffect, useRef, useState } from "react";
import GlobeGL from "react-globe.gl";
import * as THREE from "three";
import { THREAT_POINTS, type ThreatPoint } from "./threats";
import { useThreatStore } from "@/store/threatStore";
import { play } from "@/lib/sounds";

interface SnapTarget {
  lat: number;
  lng: number;
  ts: number;
}

interface Props {
  snapTarget?: SnapTarget;
}

export function Globe({ snapTarget }: Props) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const threatLevel = useThreatStore((s) => s.level);
  const lastSnapTs = useRef(0);
  const lastCriticalSnap = useRef(false);

  // Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = containerRef.current!.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-rotate + initial config
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = false;

    // ambient light from above
    const scene = g.scene();
    const dir = new THREE.DirectionalLight(0x4fc3f7, 0.6);
    dir.position.set(0, 200, 0);
    scene.add(dir);
  }, []);

  // Snap to Moscow on CRITICAL
  useEffect(() => {
    if (threatLevel === "CRITICAL" && !lastCriticalSnap.current) {
      lastCriticalSnap.current = true;
      globeRef.current?.pointOfView({ lat: 55.75, lng: 37.61, altitude: 1.8 }, 1500);
      play("globe_snap");
    } else if (threatLevel !== "CRITICAL") {
      lastCriticalSnap.current = false;
    }
  }, [threatLevel]);

  // Snap on new feed entry
  useEffect(() => {
    if (!snapTarget || snapTarget.ts === lastSnapTs.current) return;
    lastSnapTs.current = snapTarget.ts;
    globeRef.current?.pointOfView(
      { lat: snapTarget.lat, lng: snapTarget.lng, altitude: 1.8 },
      1500,
    );
    play("globe_snap");
  }, [snapTarget]);

  // Stagger threat dot pulse sounds (very subtle)
  useEffect(() => {
    const intervals = THREAT_POINTS.map((_, i) =>
      setInterval(() => play("heartbeat"), 2200 + i * 137),
    );
    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {size.w > 0 && (
        <GlobeGL
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#4fc3f7"
          atmosphereAltitude={0.18}
          showGlobe
          globeMaterial={
            new THREE.MeshPhongMaterial({
              color: new THREE.Color(0x05050f),
              emissive: new THREE.Color(0x0a0a20),
              shininess: 4,
            })
          }
          hexPolygonsData={[]}
          pointsData={THREAT_POINTS}
          pointLat={(d: any) => (d as ThreatPoint).lat}
          pointLng={(d: any) => (d as ThreatPoint).lng}
          pointColor={() => "#ff2d2d"}
          pointAltitude={(d: any) => ((d as ThreatPoint).size / 600)}
          pointRadius={(d: any) => (d as ThreatPoint).size / 30}
          pointLabel={(d: any) => {
            const p = d as ThreatPoint;
            return `<div style="background:hsl(240 50% 6% / 0.95);border:1px solid hsl(0 100% 59% / 0.5);padding:6px 10px;border-radius:6px;font-family:'JetBrains Mono',monospace;color:#f0f0ff;font-size:12px"><div style="color:#ff2d2d;font-weight:600">${p.city}</div><div style="color:#a0a0c0;font-size:11px">${p.viewers} viewers</div></div>`;
          }}
          ringsData={THREAT_POINTS}
          ringLat={(d: any) => (d as ThreatPoint).lat}
          ringLng={(d: any) => (d as ThreatPoint).lng}
          ringColor={() => (t: number) => `rgba(255,45,45,${1 - t})`}
          ringMaxRadius={(d: any) => (d as ThreatPoint).size / 3}
          ringPropagationSpeed={2}
          ringRepeatPeriod={700}
        />
      )}
    </div>
  );
}
