import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

interface TrendPair {
  a: string;
  b: string;
  description: string;
}

// Weekly rotation based on date
const TREND_PAIRS: TrendPair[] = [
  {
    a: "#TechVsFitness",
    b: "#FitnessFirst",
    description: "Tech enthusiasts vs fitness warriors",
  },
  {
    a: "#ComedyKing",
    b: "#MemeLord",
    description: "Comedy creators vs meme makers",
  },
  {
    a: "#TravelGoals",
    b: "#HomeVibes",
    description: "Travel bloggers vs home creators",
  },
  {
    a: "#GamingLife",
    b: "#ArtCreator",
    description: "Gaming content vs art creation",
  },
  {
    a: "#FoodPhotography",
    b: "#NightlifeVibes",
    description: "Food creators vs nightlife influencers",
  },
];

const BATTLE_STATE_KEY = "mindforge-trend-battles";

interface BattleState {
  weekKey: string;
  chosenSide: "a" | "b" | null;
  battleStarted: number | null;
  playerWon: boolean | null;
  coinsClaimed: boolean;
}

function getWeekKey(): string {
  const d = new Date();
  const week = Math.floor(d.getTime() / (7 * 86400 * 1000));
  return String(week);
}

function getCurrentPair(): TrendPair {
  const week = Math.floor(Date.now() / (7 * 86400 * 1000));
  return TREND_PAIRS[week % TREND_PAIRS.length];
}

function loadBattleState(): BattleState {
  try {
    const raw = localStorage.getItem(BATTLE_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BattleState;
      if (parsed.weekKey === getWeekKey()) return parsed;
    }
  } catch (_) {}
  return {
    weekKey: getWeekKey(),
    chosenSide: null,
    battleStarted: null,
    playerWon: null,
    coinsClaimed: false,
  };
}

function saveBattleState(state: BattleState) {
  localStorage.setItem(BATTLE_STATE_KEY, JSON.stringify(state));
}

export default function TrendBattles() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    addNotification,
    posts,
    setPosts,
  } = useApp();

  const pair = getCurrentPair();
  const [battleState, setBattleState] = useState<BattleState>(() =>
    loadBattleState(),
  );
  const [pctA, setPctA] = useState(48);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live bars update every 3s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPctA((p) => {
        const shift = (Math.random() - 0.5) * 4;
        return Math.max(20, Math.min(80, p + shift));
      });
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Battle end check (5 minutes)
  const battleEndsAt = battleState.battleStarted
    ? battleState.battleStarted + 5 * 60 * 1000
    : null;
  const battleOver = battleEndsAt ? Date.now() >= battleEndsAt : false;

  const winnerSide = pctA >= 50 ? "a" : "b";

  // Auto-resolve when battle ends
  useEffect(() => {
    if (
      !battleOver ||
      !battleState.battleStarted ||
      battleState.playerWon !== null
    )
      return;
    const playerWon = battleState.chosenSide === winnerSide;
    const next = { ...battleState, playerWon };
    setBattleState(next);
    saveBattleState(next);
  }, [battleOver, battleState, winnerSide]);

  function joinBattle(side: "a" | "b") {
    const hashtag = side === "a" ? pair.a : pair.b;
    const next = {
      ...battleState,
      chosenSide: side,
      battleStarted: Date.now(),
    };
    setBattleState(next);
    saveBattleState(next);

    // Give 2x reach bonus on next post by adding it to any recent post
    if (posts.length > 0) {
      const boostedPost = {
        ...posts[0],
        hashtags: [...(posts[0].hashtags ?? []), hashtag.toLowerCase()],
        reach: Math.floor(posts[0].reach * 2),
      };
      setPosts((prev) => [boostedPost, ...prev.slice(1)]);
    }

    addNotification({
      type: "smart",
      icon: "✅",
      message: `📊 Joined ${hashtag} trend battle! Your next post gets 2× reach.`,
    });
    toast.success(
      `Joined ${hashtag}! Battle started — check back in 5 minutes.`,
    );
  }

  function claimReward() {
    if (battleState.playerWon && !battleState.coinsClaimed) {
      setCreatorCoins((c) => c + 1000);
      const next = { ...battleState, coinsClaimed: true };
      setBattleState(next);
      saveBattleState(next);
      addNotification({
        type: "smart",
        icon: "✅",
        message: "🏆 Trend Battle reward claimed: +1,000 coins!",
      });
      toast.success("+1,000 coins claimed!");
    }
  }

  const timeUntilEnd = battleEndsAt
    ? Math.max(0, Math.floor((battleEndsAt - Date.now()) / 1000))
    : 0;
  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
      data-ocid="trend_battles.page"
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
          data-ocid="trend_battles.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            📊 Trend Battles
          </h1>
          <p className="text-xs text-muted-foreground">
            Pick a side — battle resets weekly
          </p>
        </div>
        <div
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            border: "1px solid oklch(0.65 0.2 80 / 0.3)",
            color: "oklch(0.78 0.2 80)",
          }}
        >
          🪙 {creatorCoins.toLocaleString()}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Current battle card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.55 0.22 260 / 0.4)",
          }}
          data-ocid="trend_battles.battle.card"
        >
          <p className="text-xs text-muted-foreground mb-1">
            This Week's Battle
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {pair.description}
          </p>

          {/* Live bars */}
          <div className="space-y-3 mb-5">
            <div>
              <div className="flex justify-between text-sm font-bold mb-1.5">
                <span style={{ color: "oklch(0.72 0.2 295)" }}>{pair.a}</span>
                <span style={{ color: "oklch(0.72 0.2 295)" }}>{pctA}%</span>
              </div>
              <Progress
                value={pctA}
                className="h-5"
                style={{ background: "oklch(0.18 0.02 280)" }}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1.5">
                <span style={{ color: "oklch(0.72 0.22 25)" }}>{pair.b}</span>
                <span style={{ color: "oklch(0.72 0.22 25)" }}>
                  {100 - pctA}%
                </span>
              </div>
              <Progress
                value={100 - pctA}
                className="h-5"
                style={{ background: "oklch(0.18 0.02 280)" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.7 0.22 145)" }}
            />
            Live — updates every 3 seconds
          </div>

          {/* Battle state: not joined yet */}
          {!battleState.chosenSide && (
            <div className="flex gap-3">
              <Button
                onClick={() => joinBattle("a")}
                className="flex-1"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 295))",
                }}
                data-ocid="trend_battles.join_a.button"
              >
                Join {pair.a}
              </Button>
              <Button
                onClick={() => joinBattle("b")}
                className="flex-1"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.6 0.22 25), oklch(0.55 0.2 350))",
                }}
                data-ocid="trend_battles.join_b.button"
              >
                Join {pair.b}
              </Button>
            </div>
          )}

          {/* In battle */}
          {battleState.chosenSide && !battleOver && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You joined{" "}
                <span
                  className="font-bold"
                  style={{ color: "oklch(0.75 0.22 260)" }}
                >
                  {battleState.chosenSide === "a" ? pair.a : pair.b}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                2× reach bonus applied to your next post
              </p>
              <div
                className="text-2xl font-black"
                style={{ color: "oklch(0.72 0.2 295)" }}
              >
                {timeUntilEnd > 0 ? formatTime(timeUntilEnd) : "Resolving..."}
              </div>
            </div>
          )}

          {/* Battle over */}
          {battleState.chosenSide &&
            battleOver &&
            battleState.playerWon !== null && (
              <div className="text-center space-y-3">
                <div className="text-4xl">
                  {battleState.playerWon ? "🏆" : "💔"}
                </div>
                <p
                  className="font-bold"
                  style={{
                    color: battleState.playerWon
                      ? "oklch(0.75 0.22 145)"
                      : "oklch(0.72 0.22 25)",
                  }}
                >
                  {battleState.playerWon
                    ? "Your side won! Claim your reward."
                    : "Your side lost. Better luck next week!"}
                </p>
                {battleState.playerWon && !battleState.coinsClaimed && (
                  <Button
                    onClick={claimReward}
                    className="w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.7 0.18 80), oklch(0.65 0.2 60))",
                    }}
                    data-ocid="trend_battles.claim_reward.button"
                  >
                    Claim +1,000 Coins 🎉
                  </Button>
                )}
                {battleState.coinsClaimed && (
                  <p className="text-sm text-muted-foreground">
                    ✅ Reward claimed! Check back next week.
                  </p>
                )}
                {!battleState.playerWon && (
                  <p className="text-sm text-muted-foreground">
                    New battle starts next week.
                  </p>
                )}
              </div>
            )}
        </motion.div>

        {/* Reward info */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.13 0.016 280 / 0.7)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
        >
          <h3 className="text-sm font-bold text-foreground mb-2">
            How it works
          </h3>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>📊 Pick a hashtag side — your next post gets 2× reach</li>
            <li>⏱️ Battle resolves after 5 minutes</li>
            <li>🏆 If your side wins: claim +1,000 coins</li>
            <li>🔄 New battle every week</li>
          </ul>
        </div>

        <p
          className="text-center text-xs pb-4"
          style={{ color: "oklch(0.38 0.03 280)" }}
        >
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
