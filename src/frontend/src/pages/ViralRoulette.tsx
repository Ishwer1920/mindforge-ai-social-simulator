import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const SPIN_COST = 500;

const OUTCOMES = [
  {
    id: "mega_viral",
    emoji: "🚀",
    label: "MEGA VIRAL",
    color: "oklch(0.72 0.2 295)",
    bg: "oklch(0.22 0.06 295 / 0.3)",
    probability: 0.05,
  },
  {
    id: "viral",
    emoji: "🔥",
    label: "VIRAL",
    color: "oklch(0.78 0.18 30)",
    bg: "oklch(0.22 0.06 30 / 0.3)",
    probability: 0.25,
  },
  {
    id: "flop",
    emoji: "😐",
    label: "FLOP",
    color: "oklch(0.6 0.04 280)",
    bg: "oklch(0.18 0.02 280 / 0.3)",
    probability: 0.4,
  },
  {
    id: "mega_flop",
    emoji: "💀",
    label: "MEGA FLOP",
    color: "oklch(0.72 0.18 25)",
    bg: "oklch(0.22 0.06 25 / 0.3)",
    probability: 0.2,
  },
  {
    id: "shadow_risk",
    emoji: "⚠️",
    label: "SHADOW RISK",
    color: "oklch(0.75 0.18 80)",
    bg: "oklch(0.22 0.06 80 / 0.3)",
    probability: 0.1,
  },
];

interface SpinResult {
  outcome: (typeof OUTCOMES)[number];
  timestamp: number;
}

function pickOutcome() {
  const rand = Math.random();
  let cumulative = 0;
  for (const outcome of OUTCOMES) {
    cumulative += outcome.probability;
    if (rand < cumulative) return outcome;
  }
  return OUTCOMES[2]; // fallback: flop
}

const SEGMENT_COUNT = 12;
const SEGMENT_COLORS = [
  "oklch(0.55 0.22 260)",
  "oklch(0.65 0.2 30)",
  "oklch(0.45 0.04 280)",
  "oklch(0.55 0.25 25)",
  "oklch(0.65 0.2 80)",
  "oklch(0.55 0.22 295)",
];

export default function ViralRoulette() {
  const { creatorCoins, setCreatorCoins, setPosts, setShadowBan, navigate } =
    useApp();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<(typeof OUTCOMES)[number] | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const rotationRef = useRef(0);

  const spin = () => {
    if (creatorCoins < SPIN_COST || spinning) return;
    setCreatorCoins((c) => c - SPIN_COST);
    setSpinning(true);
    setResult(null);

    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalAngle = spins * 360 + Math.random() * 360;
    const targetRotation = rotationRef.current + finalAngle;
    rotationRef.current = targetRotation;
    setRotation(targetRotation);

    setTimeout(() => {
      const outcome = pickOutcome();
      setSpinning(false);
      setResult(outcome);
      setHistory((h) => [{ outcome, timestamp: Date.now() }, ...h].slice(0, 5));
      applyOutcome(outcome);
    }, 2800);
  };

  const applyOutcome = (outcome: (typeof OUTCOMES)[number]) => {
    if (outcome.id === "mega_viral") {
      setPosts?.((prev) => {
        if (!prev.length) return prev;
        const latest = prev[0];
        return [
          {
            ...latest,
            likes: latest.likes + 10000,
            followersGained: latest.followersGained + 50000,
          },
          ...prev.slice(1),
        ];
      });
      toast.success("🚀 MEGA VIRAL! +50K followers incoming!", {
        duration: 5000,
      });
    } else if (outcome.id === "viral") {
      setPosts?.((prev) => {
        if (!prev.length) return prev;
        const latest = prev[0];
        return [
          {
            ...latest,
            likes: latest.likes + 2000,
            followersGained: latest.followersGained + 5000,
          },
          ...prev.slice(1),
        ];
      });
      toast.success("🔥 You went viral! +5K followers!", { duration: 4000 });
    } else if (outcome.id === "flop") {
      toast("😐 Flopped. Coins gone, nothing happened.", { duration: 3000 });
    } else if (outcome.id === "mega_flop") {
      setPosts?.((prev) => {
        if (!prev.length) return prev;
        const latest = prev[0];
        return [
          { ...latest, likes: Math.max(0, latest.likes - 500) },
          ...prev.slice(1),
        ];
      });
      toast.error("💀 MEGA FLOP! Latest post lost 500 likes.", {
        duration: 4000,
      });
    } else if (outcome.id === "shadow_risk") {
      setShadowBan({ active: true, endsAt: Date.now() + 2 * 60 * 60 * 1000 });
      toast.error("⚠️ Shadow ban activated for 2 hours!", { duration: 5000 });
    }
  };

  // Draw wheel
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 240;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;
    const sliceAngle = (2 * Math.PI) / SEGMENT_COUNT;
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const start = i * sliceAngle - Math.PI / 2;
      const end = start + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "oklch(0.08 0.015 280)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.translate(r * 0.65, 0);
      ctx.rotate(Math.PI / 2);
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icons = [
        "🚀",
        "🔥",
        "😐",
        "💀",
        "⚠️",
        "🔥",
        "😐",
        "🚀",
        "💀",
        "😐",
        "🔥",
        "⚠️",
      ];
      ctx.fillText(icons[i % icons.length], 0, 0);
      ctx.restore();
    }
    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "oklch(0.12 0.02 280)";
    ctx.fill();
    ctx.strokeStyle = "oklch(0.4 0.08 280)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.08 0.015 280)" }}
      data-ocid="roulette.page"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 sticky top-0 z-10"
        style={{
          background: "oklch(0.08 0.015 280 / 0.95)",
          borderBottom: "1px solid oklch(0.2 0.02 280 / 0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          data-ocid="roulette.back.button"
          onClick={() => navigate("hub")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-base font-bold text-white">🎰 Viral Roulette</h1>
        <div className="flex items-center gap-1.5 text-sm">
          <Coins className="w-4 h-4" style={{ color: "oklch(0.78 0.18 80)" }} />
          <span style={{ color: "oklch(0.78 0.18 80)" }}>
            {creatorCoins.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Wheel */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Pointer */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "20px solid oklch(0.78 0.18 80)",
                filter: "drop-shadow(0 2px 4px oklch(0.78 0.18 80 / 0.5))",
              }}
            />
            <div
              style={{
                width: 240,
                height: 240,
                transition: spinning
                  ? "transform 2.8s cubic-bezier(0.17, 0.67, 0.12, 1)"
                  : "none",
                transform: `rotate(${rotation}deg)`,
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow:
                  "0 0 40px oklch(0.55 0.2 295 / 0.3), 0 0 80px oklch(0.55 0.2 295 / 0.1)",
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ display: "block", borderRadius: "50%" }}
              />
            </div>
          </div>

          {/* Cost label */}
          <p className="text-xs text-muted-foreground text-center">
            Cost per spin:{" "}
            <span style={{ color: "oklch(0.78 0.18 80)" }}>500 coins</span>
          </p>
        </div>

        {/* Result */}
        {result && !spinning && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: result.bg,
              border: `1px solid ${result.color}40`,
              boxShadow: `0 0 30px ${result.color}20`,
            }}
            data-ocid="roulette.result.panel"
          >
            <div className="text-5xl mb-2">{result.emoji}</div>
            <div
              className="text-xl font-bold mb-1"
              style={{ color: result.color }}
            >
              {result.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {result.id === "mega_viral" &&
                "🚀 +50K followers & +10K engagement!"}
              {result.id === "viral" && "🔥 +5K followers & +2K engagement!"}
              {result.id === "flop" && "Coins lost. Better luck next time."}
              {result.id === "mega_flop" && "💀 Latest post lost 500 likes."}
              {result.id === "shadow_risk" &&
                "⚠️ Shadow ban active for 2 hours!"}
            </div>
          </div>
        )}

        {/* Spin button */}
        <Button
          data-ocid="roulette.spin.button"
          className="w-full h-14 text-lg font-bold text-white border-none"
          style={{
            background:
              creatorCoins >= SPIN_COST && !spinning
                ? "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 260))"
                : "oklch(0.22 0.03 280)",
            boxShadow:
              creatorCoins >= SPIN_COST && !spinning
                ? "0 4px 24px oklch(0.55 0.25 295 / 0.4)"
                : "none",
          }}
          disabled={creatorCoins < SPIN_COST || spinning}
          onClick={spin}
        >
          {spinning
            ? "⏳ Spinning..."
            : creatorCoins < SPIN_COST
              ? "Not enough coins"
              : "🎰 Spin (500 coins)"}
        </Button>

        {/* Outcomes legend */}
        <div
          className="rounded-2xl p-4 space-y-2"
          style={{
            background: "oklch(0.12 0.02 280)",
            border: "1px solid oklch(0.22 0.03 280 / 0.5)",
          }}
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Possible Outcomes
          </h3>
          {OUTCOMES.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span>{o.emoji}</span>
                <span style={{ color: o.color }}>{o.label}</span>
              </span>
              <span className="text-muted-foreground text-xs">
                {Math.round(o.probability * 100)}%
              </span>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: "oklch(0.12 0.02 280)",
              border: "1px solid oklch(0.22 0.03 280 / 0.5)",
            }}
            data-ocid="roulette.history.panel"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Last {history.length} Spins
            </h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={`${h.timestamp}-${i}`}
                  data-ocid={`roulette.history.item.${i + 1}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {h.outcome.emoji}{" "}
                    <span className="text-muted-foreground">
                      {h.outcome.label}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
