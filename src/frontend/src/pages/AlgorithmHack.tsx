import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Lightbulb,
  Lock,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { getHackLabel } from "../hooks/useAlgoHackEngine";

const INTEL_TIPS = [
  "Hacks fire 2x more often while a Platform Event is active — stack the bonuses!",
  "Text-only hacks last the longest (60 min) — plan your post accordingly.",
  "Carousel hacks have the highest multiplier/duration ratio. Use 3+ images.",
  "Adding #collab to your caption can trigger the Collab Boost hack condition.",
  "Watch time still matters during a hack — longer captions boost retention.",
  "Posting within the first 5 minutes of a hack maximises your reach window.",
  "Hacks rotate through 5 types — track history to predict the next one.",
];

function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const MULTIPLIER_COLORS: Record<number, string> = {
  2: "oklch(0.72 0.18 145)",
  2.5: "oklch(0.72 0.2 80)",
  3: "oklch(0.72 0.22 295)",
};

export default function AlgorithmHack() {
  const { navigate, activeAlgoHack, algoHackHistory } = useApp();
  const [countdown, setCountdown] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeAlgoHack) {
      setCountdown("");
      return;
    }
    function update() {
      if (!activeAlgoHack) return;
      const remaining = activeAlgoHack.expiresAt - Date.now();
      setCountdown(formatMs(remaining));
    }
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeAlgoHack]);

  const isPulsing = activeAlgoHack
    ? activeAlgoHack.expiresAt - Date.now() < 5 * 60 * 1000
    : false;

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
          data-ocid="algo_hack.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            🔓 Algorithm Hacks
          </h1>
          <p className="text-xs text-muted-foreground">
            Leaked intel &amp; reach boosts
          </p>
        </div>
        {activeAlgoHack && (
          <Badge
            className="text-xs font-bold animate-pulse"
            style={{
              background: "oklch(0.55 0.25 295 / 0.2)",
              border: "1px solid oklch(0.55 0.25 295 / 0.5)",
              color: "oklch(0.72 0.22 295)",
            }}
          >
            LIVE
          </Badge>
        )}
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Active Hack Card */}
        {activeAlgoHack ? (
          <div
            data-ocid="algo_hack.active.panel"
            className="rounded-2xl p-5 space-y-4 overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.06 295 / 0.95), oklch(0.16 0.05 260 / 0.9))",
              border: "1px solid oklch(0.55 0.22 295 / 0.5)",
              boxShadow: "0 0 40px oklch(0.55 0.22 295 / 0.2)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% 0%, oklch(0.55 0.22 295 / 0.15), transparent)",
              }}
            />

            <div className="flex items-start justify-between relative">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.55 0.25 295 / 0.25)",
                    border: "1px solid oklch(0.55 0.22 295 / 0.4)",
                  }}
                >
                  <Lock
                    className="w-5 h-5"
                    style={{ color: "oklch(0.72 0.22 295)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.62 0.18 295)" }}
                  >
                    Algorithm Leaked
                  </p>
                  <p
                    className="text-lg font-black"
                    style={{ color: "oklch(0.92 0.08 260)" }}
                  >
                    {activeAlgoHack.type}
                  </p>
                </div>
              </div>

              {/* Multiplier badge */}
              <div
                className="px-3 py-1.5 rounded-xl font-black text-xl"
                style={{
                  background: "oklch(0.18 0.05 295 / 0.6)",
                  border: "1px solid oklch(0.55 0.22 295 / 0.4)",
                  color:
                    MULTIPLIER_COLORS[activeAlgoHack.multiplier] ??
                    "oklch(0.72 0.2 295)",
                }}
              >
                {activeAlgoHack.multiplier}x
              </div>
            </div>

            <p
              className="text-sm relative"
              style={{ color: "oklch(0.78 0.06 260)" }}
            >
              <span
                className="font-semibold"
                style={{ color: "oklch(0.88 0.12 295)" }}
              >
                {getHackLabel(activeAlgoHack.condition)}
              </span>{" "}
              get {activeAlgoHack.multiplier}x reach right now.
            </p>

            {/* Countdown */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 relative"
              style={{
                background: "oklch(0.14 0.04 280 / 0.7)",
                border: "1px solid oklch(0.3 0.06 280 / 0.4)",
              }}
            >
              <Timer
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "oklch(0.65 0.2 295)" }}
              />
              <div className="flex-1">
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.05 280)" }}
                >
                  Time remaining
                </p>
                <p
                  className="text-2xl font-black tabular-nums"
                  style={{
                    color: isPulsing
                      ? "oklch(0.72 0.25 25)"
                      : "oklch(0.88 0.12 295)",
                    animation: isPulsing
                      ? "pulse 1s ease-in-out infinite"
                      : undefined,
                  }}
                  data-ocid="algo_hack.countdown"
                >
                  {countdown}
                </p>
              </div>
              {isPulsing && (
                <span
                  className="text-xs font-bold animate-pulse"
                  style={{ color: "oklch(0.72 0.25 25)" }}
                >
                  &lt; 5 min!
                </span>
              )}
            </div>

            <p
              className="text-xs relative"
              style={{ color: "oklch(0.52 0.06 260)" }}
            >
              💡 Post now matching the condition above to receive the reach
              multiplier automatically.
            </p>
          </div>
        ) : (
          <div
            data-ocid="algo_hack.idle.panel"
            className="rounded-2xl p-6 text-center space-y-3"
            style={{
              background: "oklch(0.13 0.016 280)",
              border: "1px solid oklch(0.22 0.025 280 / 0.5)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: "oklch(0.18 0.03 280)",
                border: "1px solid oklch(0.28 0.04 280 / 0.5)",
              }}
            >
              <Lock
                className="w-7 h-7"
                style={{ color: "oklch(0.45 0.04 280)" }}
              />
            </div>
            <p
              className="text-base font-semibold"
              style={{ color: "oklch(0.75 0.04 280)" }}
            >
              No Active Hack
            </p>
            <p className="text-sm text-muted-foreground">
              Algorithm leaks fire every 20–40 minutes. Platform Events cut that
              time in half.
            </p>
          </div>
        )}

        {/* Algorithm Intel */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.13 0.016 280)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
          data-ocid="algo_hack.intel.panel"
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              borderBottom: "1px solid oklch(0.2 0.02 280 / 0.5)",
              background: "oklch(0.15 0.02 280)",
            }}
          >
            <Lightbulb
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.2 80)" }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.6 0.08 260)" }}
            >
              Algorithm Intel
            </span>
          </div>
          <div className="p-4 space-y-3">
            {INTEL_TIPS.map((tip, i) => (
              <div
                key={tip}
                data-ocid={`algo_hack.intel.item.${i + 1}`}
                className="flex items-start gap-3"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background: "oklch(0.55 0.22 295 / 0.15)",
                    border: "1px solid oklch(0.55 0.22 295 / 0.3)",
                    color: "oklch(0.65 0.18 295)",
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hack History */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.13 0.016 280)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
          data-ocid="algo_hack.history.panel"
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              borderBottom: "1px solid oklch(0.2 0.02 280 / 0.5)",
              background: "oklch(0.15 0.02 280)",
            }}
          >
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "oklch(0.65 0.2 145)" }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.6 0.08 260)" }}
            >
              Hack History
            </span>
            <span
              className="ml-auto text-xs"
              style={{ color: "oklch(0.42 0.04 280)" }}
            >
              {algoHackHistory.length} used
            </span>
          </div>

          {algoHackHistory.length === 0 ? (
            <div
              data-ocid="algo_hack.history.empty_state"
              className="px-4 py-8 text-center"
            >
              <Zap
                className="w-8 h-8 mx-auto mb-3"
                style={{ color: "oklch(0.35 0.04 280)" }}
              />
              <p className="text-sm text-muted-foreground">
                No hacks used yet. Post during an active hack to record it here.
              </p>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: "oklch(0.2 0.02 280 / 0.4)" }}
            >
              {algoHackHistory.map((item, i) => (
                <div
                  key={`${item.firedAt}-${i}`}
                  data-ocid={`algo_hack.history.item.${i + 1}`}
                  className="px-4 py-3.5 flex items-center gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "oklch(0.55 0.22 295 / 0.15)",
                      border: "1px solid oklch(0.55 0.22 295 / 0.25)",
                    }}
                  >
                    <Lock
                      className="w-4 h-4"
                      style={{ color: "oklch(0.65 0.2 295)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: "oklch(0.85 0.05 260)" }}
                      >
                        {item.type}
                      </span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: "oklch(0.55 0.22 295 / 0.15)",
                          color:
                            MULTIPLIER_COLORS[item.multiplier] ??
                            "oklch(0.65 0.18 295)",
                        }}
                      >
                        {item.multiplier}x
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.04 280)" }}
                    >
                      {item.postsBoosted} post
                      {item.postsBoosted !== 1 ? "s" : ""} boosted
                      {item.extraReach > 0 && (
                        <span style={{ color: "oklch(0.65 0.18 145)" }}>
                          {" "}
                          · +{item.extraReach.toLocaleString()} extra reach
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "oklch(0.42 0.04 280)" }}
                  >
                    {timeAgo(item.firedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
