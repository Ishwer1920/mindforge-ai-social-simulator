import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Swords } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { AI_CREATORS } from "../utils/aiInfluencers";

const COOLDOWN_KEY = "mindforge-fan-wars-cooldown";
const BATTLE_DURATION = 60; // seconds

const RIVAL_POOL = AI_CREATORS.slice(0, 15);

export default function FanArmyWars() {
  const {
    navigate,
    profile,
    creatorCoins,
    setCreatorCoins,
    addNotification,
    audienceMoodScore,
  } = useApp();

  const [cooldownEnds, setCooldownEnds] = useState<number>(() => {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    return raw ? Number(raw) : 0;
  });
  const [selectedRival, setSelectedRival] = useState<
    (typeof RIVAL_POOL)[0] | null
  >(null);
  const [battleActive, setBattleActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [playerScore, setPlayerScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [result, setResult] = useState<"win" | "lose" | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cooldownRemaining = Math.max(
    0,
    Math.floor((cooldownEnds - Date.now()) / 1000),
  );
  const onCooldown = cooldownRemaining > 0;

  function formatCooldown(secs: number): string {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function startBattle() {
    if (!selectedRival || onCooldown) return;
    setBattleActive(true);
    setTimeLeft(BATTLE_DURATION);
    setPlayerScore(0);
    setRivalScore(0);
    setResult(null);

    const moodMult = audienceMoodScore / 50; // 0..2
    const followerPower = Math.log10(Math.max(profile.followers, 100)) / 5;

    timerRef.current = setInterval(() => {
      const playerTick =
        Math.floor(Math.random() * 80 + 20) * (1 + followerPower) * moodMult;
      const rivalTick =
        Math.floor(Math.random() * 80 + 20) *
        (1 + Math.log10(Math.max(selectedRival.followerCount, 100)) / 5);

      setPlayerScore((p) => p + playerTick);
      setRivalScore((r) => r + rivalTick);
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (!battleActive || timeLeft > 0) return;
    // Battle ended
    const won = playerScore >= rivalScore;
    setResult(won ? "win" : "lose");
    setBattleActive(false);

    const cooldownEnd = Date.now() + 4 * 3600 * 1000;
    setCooldownEnds(cooldownEnd);
    localStorage.setItem(COOLDOWN_KEY, String(cooldownEnd));

    if (won) {
      setCreatorCoins((c) => c + 500);
      addNotification({
        type: "smart",
        icon: "✅",
        message: "🏆 Fan Army War won! +2000 followers & 500 coins!",
      });
      toast.success("Victory! Fan Army crushed the rival!");
    } else {
      addNotification({
        type: "shadow_ban",
        icon: "⚠️",
        message: `💔 Fan Army War lost against ${selectedRival?.username}`,
      });
      toast.error("Defeated! Your fan army was outmatched.");
    }
  }, [
    battleActive,
    timeLeft,
    playerScore,
    rivalScore,
    selectedRival,
    setCreatorCoins,
    addNotification,
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const total = playerScore + rivalScore || 1;
  const playerPct = Math.round((playerScore / total) * 100);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
      data-ocid="fan_army_wars.page"
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
          data-ocid="fan_army_wars.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            ⚔️ Fan Army Wars
          </h1>
          <p className="text-xs text-muted-foreground">
            Your fans vs a rival's army
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

      <div className="px-4 py-5 space-y-4">
        {/* Rewards info */}
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{
            background: "oklch(0.18 0.04 80 / 0.15)",
            border: "1px solid oklch(0.65 0.2 80 / 0.3)",
          }}
        >
          <span className="text-sm text-muted-foreground">Win rewards</span>
          <span
            className="text-sm font-bold"
            style={{ color: "oklch(0.78 0.2 80)" }}
          >
            +2,000 followers · +500 coins
          </span>
        </div>

        {onCooldown && (
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background: "oklch(0.18 0.04 295 / 0.2)",
              border: "1px solid oklch(0.55 0.2 295 / 0.3)",
            }}
          >
            <p className="text-sm text-muted-foreground">
              ⏳ Next war available in
            </p>
            <p
              className="text-2xl font-black mt-1"
              style={{ color: "oklch(0.72 0.2 295)" }}
            >
              {formatCooldown(cooldownRemaining)}
            </p>
          </div>
        )}

        {/* Battle arena */}
        <AnimatePresence>
          {battleActive || result ? (
            <motion.div
              key="arena"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: "oklch(0.13 0.016 280 / 0.95)",
                border: `1px solid ${
                  result === "win"
                    ? "oklch(0.7 0.22 145 / 0.5)"
                    : result === "lose"
                      ? "oklch(0.6 0.22 25 / 0.5)"
                      : "oklch(0.55 0.22 295 / 0.4)"
                }`,
              }}
              data-ocid="fan_army_wars.battle.panel"
            >
              {battleActive && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Time remaining
                  </p>
                  <p
                    className="text-3xl font-black"
                    style={{
                      color:
                        timeLeft <= 10
                          ? "oklch(0.72 0.22 25)"
                          : "oklch(0.72 0.2 295)",
                    }}
                  >
                    {timeLeft}s
                  </p>
                </div>
              )}

              {result && (
                <div className="text-center py-2">
                  <div className="text-5xl mb-2">
                    {result === "win" ? "🏆" : "💔"}
                  </div>
                  <p
                    className="text-xl font-black"
                    style={{
                      color:
                        result === "win"
                          ? "oklch(0.75 0.22 145)"
                          : "oklch(0.72 0.22 25)",
                    }}
                  >
                    {result === "win" ? "VICTORY!" : "DEFEATED"}
                  </p>
                  {result === "win" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      +2,000 followers · +500 coins
                    </p>
                  )}
                </div>
              )}

              {/* Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "oklch(0.75 0.22 145)" }}>
                      {profile.username} (You)
                    </span>
                    <span className="text-muted-foreground">
                      {Math.floor(playerScore).toLocaleString()} pts
                    </span>
                  </div>
                  <Progress
                    value={playerPct}
                    className="h-4"
                    style={{ background: "oklch(0.18 0.02 280)" }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "oklch(0.72 0.22 25)" }}>
                      {selectedRival?.username}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.floor(rivalScore).toLocaleString()} pts
                    </span>
                  </div>
                  <Progress
                    value={100 - playerPct}
                    className="h-4"
                    style={{ background: "oklch(0.18 0.02 280)" }}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Rival selection */}
        {!battleActive && !result && (
          <>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Choose Your Rival
            </h2>
            <div className="space-y-2">
              {RIVAL_POOL.slice(0, 8).map((rival, idx) => (
                <button
                  key={rival.id}
                  type="button"
                  onClick={() => setSelectedRival(rival)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background:
                      selectedRival?.id === rival.id
                        ? "oklch(0.18 0.04 295 / 0.3)"
                        : "oklch(0.13 0.016 280 / 0.95)",
                    border:
                      selectedRival?.id === rival.id
                        ? "1px solid oklch(0.55 0.22 295 / 0.5)"
                        : "1px solid oklch(0.22 0.025 280 / 0.5)",
                  }}
                  data-ocid={`fan_army_wars.rival.${idx + 1}`}
                >
                  <img
                    src={rival.avatar}
                    alt={rival.username}
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {rival.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rival.followerCount.toLocaleString()} followers
                    </p>
                  </div>
                  {selectedRival?.id === rival.id && (
                    <span className="text-xs text-violet-400">Selected</span>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={startBattle}
              disabled={!selectedRival || onCooldown}
              className="w-full gap-2 h-12 text-base font-bold"
              style={{
                background:
                  selectedRival && !onCooldown
                    ? "linear-gradient(135deg, oklch(0.6 0.22 25), oklch(0.55 0.2 350))"
                    : undefined,
              }}
              data-ocid="fan_army_wars.start_battle.button"
            >
              <Swords className="w-5 h-5" />
              {onCooldown ? "On cooldown" : "Start Fan Army War!"}
            </Button>
          </>
        )}

        {result && (
          <Button
            onClick={() => {
              setResult(null);
              setSelectedRival(null);
              setPlayerScore(0);
              setRivalScore(0);
            }}
            variant="outline"
            className="w-full"
            data-ocid="fan_army_wars.reset.button"
          >
            Back to Rival Selection
          </Button>
        )}
      </div>
    </div>
  );
}
