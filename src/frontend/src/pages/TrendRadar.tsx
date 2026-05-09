import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const TREND_POOL = [
  { tag: "#GlowUpChallenge", topic: "Beauty & Lifestyle", emoji: "✨" },
  { tag: "#TechTuesday", topic: "Technology", emoji: "💻" },
  { tag: "#FitnessFriday", topic: "Health & Fitness", emoji: "💪" },
  { tag: "#ViralDance", topic: "Entertainment", emoji: "💃" },
  { tag: "#FoodieFinds", topic: "Food & Drink", emoji: "🍜" },
  { tag: "#TravelDiaries", topic: "Travel", emoji: "✈️" },
  { tag: "#GamersUnite", topic: "Gaming", emoji: "🎮" },
  { tag: "#AICreator", topic: "Technology", emoji: "🤖" },
  { tag: "#MotivationMonday", topic: "Mindset", emoji: "🔥" },
  { tag: "#StyleOTD", topic: "Fashion", emoji: "👗" },
  { tag: "#NightOwl", topic: "Lifestyle", emoji: "🦉" },
  { tag: "#CreatorLife", topic: "Content Creation", emoji: "🎬" },
];

function generateTrends(seed: number) {
  const shuffled = [...TREND_POOL].sort(() => Math.sin(seed) - 0.5);
  return shuffled.slice(0, 9).map((t, i) => ({
    ...t,
    heatScore: Math.floor(
      70 + Math.sin(seed + i * 0.7) * 25 + Math.random() * 10,
    ),
    reachBoost: `${(1.5 + (i % 4) * 0.3).toFixed(1)}x`,
    postsToday: Math.floor(
      12000 + Math.cos(seed * i) * 8000 + Math.random() * 5000,
    ),
  }));
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LS_KEY = "mindforge-trend-radar";

export default function TrendRadar() {
  const { navigate, setCreatorCoins, addNotification } = useApp();
  const [trends, setTrends] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Date.now() - d.ts < REFRESH_INTERVAL) return d.trends;
      }
    } catch (_) {}
    const t = generateTrends(Date.now());
    localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), trends: t }));
    return t;
  });
  const [nextRefresh, setNextRefresh] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return d.ts + REFRESH_INTERVAL;
      }
    } catch (_) {}
    return Date.now() + REFRESH_INTERVAL;
  });
  const [timeLeft, setTimeLeft] = useState("");
  const [riddenTags, setRiddenTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, nextRefresh - Date.now());
      if (diff === 0) {
        const t = generateTrends(Date.now());
        setTrends(t);
        const newTs = Date.now();
        setNextRefresh(newTs + REFRESH_INTERVAL);
        localStorage.setItem(LS_KEY, JSON.stringify({ ts: newTs, trends: t }));
        setTimeLeft("Just refreshed!");
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`Refreshes in ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRefresh]);

  function handleRide(tag: string) {
    if (riddenTags.has(tag)) {
      toast.info(`Already riding ${tag}!`);
      return;
    }
    setRiddenTags((prev) => new Set([...prev, tag]));
    setCreatorCoins((c) => c + 150);
    addNotification({
      icon: "📈",
      message: `You rode the trend ${tag}! +150 coins & 2x reach on next post.`,
      type: "boost",
    });
    toast.success(`🔥 Riding ${tag}! +150 coins & 2x reach on your next post!`);
  }

  const heatColor = (score: number) =>
    score >= 90
      ? "oklch(0.72 0.22 25)"
      : score >= 75
        ? "oklch(0.78 0.18 80)"
        : "oklch(0.62 0.15 145)";

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
    >
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
          data-ocid="trend-radar.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Trend Radar</h1>
          <p className="text-xs text-muted-foreground">{timeLeft}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5" />
          Auto-refresh
        </div>
      </div>

      <div className="px-4 py-5 space-y-3">
        <div
          className="rounded-2xl p-3 flex items-center gap-2 text-sm"
          style={{
            background: "oklch(0.55 0.22 25 / 0.12)",
            border: "1px solid oklch(0.55 0.22 25 / 0.3)",
          }}
        >
          <Zap className="w-4 h-4" style={{ color: "oklch(0.72 0.22 25)" }} />
          <span style={{ color: "oklch(0.82 0.1 260)" }}>
            Ride a trend to get <b>2x reach</b> on your next post +{" "}
            <b>+150 coins</b>
          </span>
        </div>

        {trends.map((trend, idx) => {
          const isRidden = riddenTags.has(trend.tag);
          return (
            <div
              key={trend.tag}
              data-ocid={`trend-radar.item.${idx + 1}`}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: isRidden
                  ? "oklch(0.14 0.03 145 / 0.5)"
                  : "oklch(0.13 0.016 280 / 0.95)",
                border: `1px solid ${isRidden ? "oklch(0.45 0.15 145 / 0.4)" : "oklch(0.22 0.025 280 / 0.5)"}`,
              }}
            >
              <span className="text-2xl">{trend.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-foreground">
                    {trend.tag}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${heatColor(trend.heatScore)}22`,
                      color: heatColor(trend.heatScore),
                      border: `1px solid ${heatColor(trend.heatScore)}44`,
                    }}
                  >
                    🔥 {trend.heatScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trend.topic} · {trend.postsToday.toLocaleString()} posts
                  today · {trend.reachBoost} reach
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleRide(trend.tag)}
                disabled={isRidden}
                className="flex-shrink-0 text-xs h-8"
                style={
                  isRidden
                    ? {
                        background: "oklch(0.28 0.05 145)",
                        color: "oklch(0.72 0.22 145)",
                      }
                    : {
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.5 0.28 300))",
                        color: "white",
                      }
                }
                data-ocid={`trend-radar.ride.button.${idx + 1}`}
              >
                {isRidden ? "Riding" : "Ride"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
