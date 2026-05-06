import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Battery,
  BatteryCharging,
  BatteryLow,
  Coffee,
  Timer,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const REST_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const _REST_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function getEnergyConfig(level: number) {
  if (level >= 90)
    return {
      label: "⚡ Energized",
      shortLabel: "Energized",
      color: "oklch(0.72 0.2 145)",
      bg: "oklch(0.16 0.06 145 / 0.3)",
      border: "oklch(0.55 0.2 145 / 0.45)",
      bar: "linear-gradient(90deg, oklch(0.65 0.22 145), oklch(0.72 0.2 160))",
      modifier: "+10% content quality",
      icon: Zap,
    };
  if (level >= 70)
    return {
      label: "😊 Focused",
      shortLabel: "Focused",
      color: "oklch(0.72 0.18 240)",
      bg: "oklch(0.15 0.04 240 / 0.3)",
      border: "oklch(0.5 0.15 240 / 0.4)",
      bar: "linear-gradient(90deg, oklch(0.6 0.2 240), oklch(0.68 0.18 260))",
      modifier: "Normal output",
      icon: Battery,
    };
  if (level >= 50)
    return {
      label: "😐 Tired",
      shortLabel: "Tired",
      color: "oklch(0.78 0.18 80)",
      bg: "oklch(0.18 0.05 80 / 0.3)",
      border: "oklch(0.6 0.18 80 / 0.4)",
      bar: "linear-gradient(90deg, oklch(0.72 0.2 80), oklch(0.78 0.18 90))",
      modifier: "-10% engagement",
      icon: BatteryLow,
    };
  if (level >= 30)
    return {
      label: "😓 Exhausted",
      shortLabel: "Exhausted",
      color: "oklch(0.75 0.22 55)",
      bg: "oklch(0.18 0.07 55 / 0.3)",
      border: "oklch(0.62 0.22 55 / 0.4)",
      bar: "linear-gradient(90deg, oklch(0.68 0.24 55), oklch(0.75 0.22 65))",
      modifier: "-25% engagement, slower growth",
      icon: BatteryLow,
    };
  return {
    label: "🔥 Burned Out",
    shortLabel: "Burned Out",
    color: "oklch(0.72 0.25 25)",
    bg: "oklch(0.18 0.07 25 / 0.35)",
    border: "oklch(0.6 0.28 25 / 0.5)",
    bar: "linear-gradient(90deg, oklch(0.65 0.28 25), oklch(0.72 0.25 15))",
    modifier: "-50% engagement, burnout event",
    icon: Coffee,
  };
}

export default function CreatorEnergy() {
  const {
    navigate,
    creatorEnergy,
    restModeActive,
    restModeExpiresAt,
    lastRestModeUsed,
    activateRestMode,
    burnoutActive,
    burnoutExpiresAt,
  } = useApp();

  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const cfg = getEnergyConfig(creatorEnergy);
  const EnergyIcon = cfg.icon;

  // Rest mode availability
  const restCooldownRemaining = lastRestModeUsed
    ? Math.max(0, lastRestModeUsed + REST_COOLDOWN_MS - now)
    : 0;
  const restAvailable = restCooldownRemaining === 0 && !restModeActive;
  const restTimeLeft =
    restModeActive && restModeExpiresAt
      ? Math.max(0, restModeExpiresAt - now)
      : 0;

  // Recovery time estimate to reach 70
  const minutesToFocused =
    creatorEnergy >= 70
      ? 0
      : Math.ceil((70 - creatorEnergy) / (restModeActive ? 2 : 1));

  // Burnout recovery
  const burnoutTimeLeft =
    burnoutActive && burnoutExpiresAt ? Math.max(0, burnoutExpiresAt - now) : 0;

  function formatMs(ms: number) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }

  const handleRestMode = () => {
    if (!restAvailable) return;
    activateRestMode();
    toast.success(
      "🛌 Rest Mode active! Energy recovers 2x faster for 5 minutes.",
    );
  };

  // Simulated history (last 24h entries from energy + fake historical)
  const historyPoints = Array.from({ length: 24 }, (_, i) => {
    const hour = (new Date().getHours() - 23 + i + 24) % 24;
    // Simulate a realistic energy curve
    const base = 40 + Math.sin((i / 24) * Math.PI * 2 + 1) * 25;
    const noise = (Math.sin(i * 7.3) + Math.sin(i * 3.7)) * 8;
    const val = Math.max(5, Math.min(100, Math.round(base + noise)));
    return { hour, val };
  });
  // Replace last point with actual energy
  historyPoints[23] = { hour: new Date().getHours(), val: creatorEnergy };

  const maxVal = Math.max(...historyPoints.map((p) => p.val), 100);

  const tips = [
    "Post less frequently to maintain energy — quality over quantity.",
    "Claim your daily reward each session for a free +30 energy boost.",
    "Going live drains -15 energy. Make sure you're Focused or Energized first.",
    "Energy regenerates passively at +1/min when you're not grinding.",
    "Fan Army Wars cost -10 energy. Save them for when you're Energized.",
    "Use Rest Mode before a big posting session to maximize your output.",
  ];

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.11 0.018 280 / 0.95)",
          borderBottom: "1px solid oklch(0.2 0.025 280 / 0.4)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("hub")}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="energy.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Creator Energy
          </h1>
          <p className="text-xs text-muted-foreground">
            Your mental stamina tracker
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: `${cfg.bg}`,
            border: `1px solid ${cfg.border}`,
            color: cfg.color,
          }}
          data-ocid="energy.status.panel"
        >
          <EnergyIcon className="w-4 h-4" />
          {creatorEnergy}/100
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Burnout warning */}
        {burnoutActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            data-ocid="energy.burnout.panel"
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.07 25 / 0.9), oklch(0.15 0.06 10 / 0.9))",
              border: "1px solid oklch(0.6 0.28 25 / 0.5)",
              boxShadow: "0 0 30px oklch(0.55 0.28 25 / 0.3)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🔥</span>
              <span
                className="text-sm font-bold"
                style={{ color: "oklch(0.88 0.22 25)" }}
              >
                Burned Out!
              </span>
              {burnoutTimeLeft > 0 && (
                <span
                  className="ml-auto text-xs font-mono"
                  style={{ color: "oklch(0.72 0.18 25)" }}
                >
                  Recovers in {formatMs(burnoutTimeLeft)}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.75 0.16 25)" }}>
              Your audience notices the drop in quality. Engagement is down 50%.
              Rest to recover.
            </p>
          </motion.div>
        )}

        {/* Main energy card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: `1px solid ${cfg.border}`,
          }}
          data-ocid="energy.main.card"
        >
          {/* Level display */}
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-2xl font-black"
                style={{
                  color: cfg.color,
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
              >
                {cfg.label}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                {cfg.modifier}
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <span
                className="text-3xl font-black"
                style={{ color: cfg.color }}
              >
                {creatorEnergy}
              </span>
            </div>
          </div>

          {/* Energy bar */}
          <div className="space-y-1.5">
            <div
              className="flex justify-between text-xs"
              style={{ color: "oklch(0.5 0.04 280)" }}
            >
              <span>0</span>
              <span>30</span>
              <span>50</span>
              <span>70</span>
              <span>90</span>
              <span>100</span>
            </div>
            <div
              className="h-4 rounded-full overflow-hidden relative"
              style={{ background: "oklch(0.18 0.02 280)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${creatorEnergy}%`, background: cfg.bar }}
              />
              {/* Zone markers */}
              {[30, 50, 70, 90].map((mark) => (
                <div
                  key={mark}
                  className="absolute top-0 h-full w-px"
                  style={{
                    left: `${mark}%`,
                    background: "oklch(0.3 0.02 280 / 0.6)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            {restModeActive ? (
              <div
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: "oklch(0.18 0.06 145 / 0.3)",
                  border: "1px solid oklch(0.55 0.2 145 / 0.4)",
                  color: "oklch(0.72 0.2 145)",
                }}
              >
                <BatteryCharging className="w-3 h-3" />
                Rest Mode active — {formatMs(restTimeLeft)} left
              </div>
            ) : (
              minutesToFocused > 0 && (
                <div
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: "oklch(0.16 0.03 280 / 0.4)",
                    border: "1px solid oklch(0.3 0.03 280 / 0.4)",
                    color: "oklch(0.6 0.05 280)",
                  }}
                >
                  <Timer className="w-3 h-3" />
                  Recovery to Focused: ~{minutesToFocused} min
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Rest Mode button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
        >
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Coffee
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.18 50)" }}
              />
              Rest Mode
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Boosts energy recovery 2x for 5 minutes. Recharges after 1 hour.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleRestMode}
            disabled={!restAvailable}
            size="sm"
            className="w-full gap-1.5 font-semibold"
            style={
              restAvailable
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 295))",
                    color: "white",
                    border: "none",
                  }
                : undefined
            }
            data-ocid="energy.rest_mode.button"
          >
            {restModeActive
              ? `Resting… ${formatMs(restTimeLeft)}`
              : restCooldownRemaining > 0
                ? `Available in ${formatMs(restCooldownRemaining)}`
                : "🛌 Activate Rest Mode"}
          </Button>
        </motion.div>

        {/* Energy history graph */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
          data-ocid="energy.history.panel"
        >
          <h3 className="text-sm font-semibold text-foreground">
            ⚡ Energy History (24h)
          </h3>
          <div className="flex items-end gap-0.5 h-20">
            {historyPoints.map((point, i) => {
              const pct = (point.val / maxVal) * 100;
              const barCfg = getEnergyConfig(point.val);
              return (
                <div
                  key={point.hour}
                  className="flex-1 flex flex-col items-center gap-0.5 group"
                  title={`${point.hour}:00 — ${point.val} energy`}
                >
                  <div
                    className="relative w-full flex items-end"
                    style={{ height: "64px" }}
                  >
                    <div
                      className="w-full rounded-sm transition-all duration-300"
                      style={{
                        height: `${Math.max(4, pct)}%`,
                        background: i === 23 ? cfg.bar : barCfg.bar,
                        opacity: i === 23 ? 1 : 0.65,
                      }}
                    />
                  </div>
                  {i % 6 === 0 && (
                    <span
                      className="text-[9px]"
                      style={{ color: "oklch(0.4 0.02 280)" }}
                    >
                      {point.hour}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div
            className="flex justify-between text-xs"
            style={{ color: "oklch(0.45 0.03 280)" }}
          >
            <span>24h ago</span>
            <span>Now: {creatorEnergy}</span>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
          data-ocid="energy.tips.panel"
        >
          <h3 className="text-sm font-semibold text-foreground">
            💡 Energy Tips
          </h3>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={tip} className="flex gap-2.5 items-start">
                <span
                  className="text-xs font-bold mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.2 0.04 295 / 0.5)",
                    color: "oklch(0.65 0.2 295)",
                  }}
                >
                  {i + 1}
                </span>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.62 0.04 280)" }}
                >
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Energy drain breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.26 }}
          className="rounded-2xl p-4"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
          data-ocid="energy.breakdown.panel"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            🔋 Energy Drain / Gain
          </h3>
          <div className="space-y-2">
            {[
              {
                action: "Creating a post",
                change: "-8",
                color: "oklch(0.72 0.22 25)",
              },
              {
                action: "Going live",
                change: "-15",
                color: "oklch(0.72 0.22 25)",
              },
              {
                action: "Viral Roulette spin",
                change: "-5",
                color: "oklch(0.72 0.22 25)",
              },
              {
                action: "Starting Fan Army War",
                change: "-10",
                color: "oklch(0.72 0.22 25)",
              },
              {
                action: "Claiming daily reward",
                change: "+30",
                color: "oklch(0.68 0.2 145)",
              },
              {
                action: "Rest Mode (5 min)",
                change: "+10",
                color: "oklch(0.68 0.2 145)",
              },
              {
                action: "Passive regen (per min)",
                change: "+1",
                color: "oklch(0.62 0.15 200)",
              },
            ].map((row) => (
              <div
                key={row.action}
                className="flex items-center justify-between"
              >
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.6 0.04 280)" }}
                >
                  {row.action}
                </span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: row.color }}
                >
                  {row.change}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
