import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flame, Gift, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const DAILY_REWARDS = [50, 75, 100, 150, 200, 250, 400];

function getRewardForStreak(streak: number) {
  const idx = Math.min(streak - 1, DAILY_REWARDS.length - 1);
  return DAILY_REWARDS[Math.max(0, idx)];
}

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "Now!";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

const STREAK_PERKS = [
  { days: 3, perk: "+5% engagement bonus" },
  { days: 7, perk: "+10% reach boost" },
  { days: 14, perk: "+15% follower growth" },
  { days: 30, perk: "+20% all bonuses" },
  { days: 60, perk: "Legend badge unlocked" },
];

const LOGIN_DOT_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"];
const REWARD_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7"];

export default function StreaksRewards() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    loginStreak,
    lastLoginDate,
    postingStreak,
    lastPostTime,
    dailyRewardClaimed,
    setDailyRewardClaimed,
    setLastRewardDate,
    triggerSave,
  } = useApp();
  const now = useNow();

  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now;

  const msSincePost = lastPostTime > 0 ? now - lastPostTime : null;
  const postStreakWarning =
    msSincePost !== null && msSincePost > 10 * 60 * 60 * 1000;
  const postStreakBroken =
    msSincePost !== null && msSincePost > 12 * 60 * 60 * 1000;

  const reward = getRewardForStreak(loginStreak);

  const handleClaim = () => {
    if (dailyRewardClaimed) return;
    setCreatorCoins((c) => c + reward);
    setDailyRewardClaimed(true);
    setLastRewardDate(new Date().toISOString().slice(0, 10));
    triggerSave();
    toast.success(`Daily reward claimed! +${reward} \uD83E\uDE99`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="streaks.back.button"
          onClick={() => navigate("hub")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          style={{
            background: "oklch(0.15 0.02 280 / 0.5)",
            border: "1px solid oklch(0.3 0.025 280 / 0.3)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Streaks &amp; Rewards</h1>
          <p className="text-xs text-muted-foreground">
            Stay consistent, earn more
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            border: "1px solid oklch(0.55 0.2 80 / 0.3)",
          }}
        >
          <span className="text-sm">{"\uD83E\uDE99"}</span>
          <span
            className="text-sm font-bold"
            style={{ color: "oklch(0.8 0.18 80)" }}
          >
            {creatorCoins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Login Streak */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.25 0.025 280 / 0.4)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame
                className="w-5 h-5"
                style={{ color: "oklch(0.7 0.22 50)" }}
              />
              Login Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.22 50), oklch(0.65 0.2 30))",
                  boxShadow: "0 0 20px oklch(0.65 0.2 50 / 0.4)",
                }}
              >
                {loginStreak}
              </div>
              <div>
                <p className="font-bold">
                  {"\uD83D\uDD25"} {loginStreak} day
                  {loginStreak !== 1 ? "s" : ""} streak
                </p>
                <p className="text-xs text-muted-foreground">
                  Last login: {lastLoginDate || "Today"}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.72 0.18 295)" }}
                >
                  Next reset in: {fmtCountdown(msUntilMidnight)}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {LOGIN_DOT_KEYS.map((key, i) => (
                <div
                  key={key}
                  className="h-2 flex-1 rounded-full"
                  style={{
                    background:
                      i < Math.min(loginStreak, 7)
                        ? "linear-gradient(90deg, oklch(0.7 0.22 50), oklch(0.65 0.2 30))"
                        : "oklch(0.22 0.02 280)",
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Posting Streak */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: postStreakBroken
              ? "1px solid oklch(0.55 0.2 25 / 0.4)"
              : postStreakWarning
                ? "1px solid oklch(0.65 0.2 50 / 0.4)"
                : "1px solid oklch(0.25 0.025 280 / 0.4)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-lg">{"\uD83D\uDCF8"}</span>
              Posting Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black"
                style={{
                  background: postStreakBroken
                    ? "linear-gradient(135deg, oklch(0.5 0.2 25), oklch(0.45 0.18 10))"
                    : "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.55 0.2 270))",
                }}
              >
                {postingStreak}
              </div>
              <div>
                <p className="font-bold">
                  {postingStreak} post{postingStreak !== 1 ? "s" : ""} streak
                </p>
                {lastPostTime > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Last post: {new Date(lastPostTime).toLocaleTimeString()}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No posts yet</p>
                )}
                {postStreakBroken && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.65 0.22 25)" }}
                  >
                    {"\u26A0\uFE0F"} Streak broken! Post now to restart
                  </p>
                )}
                {postStreakWarning && !postStreakBroken && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.72 0.2 50)" }}
                  >
                    {"\u23F0"} Post soon — streak breaks in{" "}
                    {fmtCountdown(12 * 60 * 60 * 1000 - (msSincePost ?? 0))}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Reward */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <Card
          style={{
            background: dailyRewardClaimed
              ? "oklch(0.13 0.016 280 / 0.95)"
              : "oklch(0.16 0.04 80 / 0.5)",
            border: dailyRewardClaimed
              ? "1px solid oklch(0.25 0.025 280 / 0.4)"
              : "1px solid oklch(0.65 0.2 80 / 0.4)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift
                className="w-5 h-5"
                style={{ color: "oklch(0.75 0.2 80)" }}
              />
              Daily Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-2xl font-black"
                  style={{ color: "oklch(0.8 0.2 80)" }}
                >
                  {reward} {"\uD83E\uDE99"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Day {loginStreak} reward
                </p>
                {dailyRewardClaimed && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.18 145)" }}
                  >
                    {"\u2713"} Claimed today · Next in{" "}
                    {fmtCountdown(msUntilMidnight)}
                  </p>
                )}
              </div>
              <Button
                data-ocid="streaks.daily_reward.primary_button"
                size="lg"
                className="text-white border-none"
                style={{
                  background: dailyRewardClaimed
                    ? "oklch(0.3 0.02 280)"
                    : "linear-gradient(135deg, oklch(0.72 0.2 75), oklch(0.65 0.22 55))",
                  boxShadow: dailyRewardClaimed
                    ? "none"
                    : "0 0 20px oklch(0.65 0.2 75 / 0.4)",
                }}
                disabled={dailyRewardClaimed}
                onClick={handleClaim}
              >
                {dailyRewardClaimed ? "Claimed" : "Claim!"}
              </Button>
            </div>
            {/* Reward progression */}
            <div className="flex gap-1">
              {DAILY_REWARDS.map((r, i) => (
                <div
                  key={REWARD_KEYS[i]}
                  className="flex-1 text-center rounded-lg py-1.5"
                  style={{
                    background:
                      i < loginStreak
                        ? "oklch(0.22 0.04 80 / 0.5)"
                        : "oklch(0.18 0.02 280 / 0.5)",
                    border:
                      i === Math.min(loginStreak - 1, DAILY_REWARDS.length - 1)
                        ? "1px solid oklch(0.65 0.2 80 / 0.6)"
                        : "1px solid transparent",
                  }}
                >
                  <p
                    className="text-[10px] font-bold"
                    style={{
                      color:
                        i < loginStreak
                          ? "oklch(0.78 0.18 80)"
                          : "oklch(0.5 0.02 280)",
                    }}
                  >
                    {r}
                  </p>
                  <p className="text-[9px] text-muted-foreground">D{i + 1}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Perks */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <Card
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.25 0.025 280 / 0.4)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy
                className="w-5 h-5"
                style={{ color: "oklch(0.72 0.18 80)" }}
              />
              Streak Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STREAK_PERKS.map((perk) => {
                const unlocked = loginStreak >= perk.days;
                return (
                  <div
                    key={perk.days}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{
                      background: unlocked
                        ? "oklch(0.18 0.04 80 / 0.2)"
                        : "oklch(0.16 0.018 280 / 0.5)",
                    }}
                  >
                    <div>
                      <p className="text-xs font-medium">{perk.perk}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Day {perk.days} streak
                      </p>
                    </div>
                    <span className="text-sm">
                      {unlocked ? "\u2705" : "\uD83D\uDD12"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
