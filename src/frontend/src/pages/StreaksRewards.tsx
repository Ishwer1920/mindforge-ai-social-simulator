import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

/* ─── helpers ─── */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "Ready!";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${h}h ${m}m ${s}s`;
}

/* ─── XP config ─── */
const XP_PER_LEVEL = 500;
function xpToNextLevel(xp: number) {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}
function currentLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
function levelProgress(xp: number) {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}

/* ─── daily reward table (day index → coins) ─── */
const DAILY_COINS = [50, 75, 100, 150, 200, 250, 400];

/* ─── milestones ─── */
const MILESTONES = [
  {
    days: 3,
    label: "Starter Pack",
    emoji: "📦",
    tier: "bronze",
    coins: 200,
    xp: 100,
    followers: 500,
    color: "oklch(0.65 0.12 50)",
    glow: "oklch(0.65 0.12 50 / 0.4)",
  },
  {
    days: 7,
    label: "Bronze Chest",
    emoji: "🥉",
    tier: "bronze",
    coins: 500,
    xp: 250,
    followers: 1_000,
    color: "oklch(0.65 0.18 55)",
    glow: "oklch(0.65 0.18 55 / 0.4)",
  },
  {
    days: 14,
    label: "Silver Chest",
    emoji: "🥈",
    tier: "silver",
    coins: 1_200,
    xp: 600,
    followers: 2_500,
    color: "oklch(0.7 0.04 230)",
    glow: "oklch(0.7 0.04 230 / 0.4)",
  },
  {
    days: 30,
    label: "Gold Chest",
    emoji: "🥇",
    tier: "gold",
    coins: 3_000,
    xp: 1_500,
    followers: 7_500,
    color: "oklch(0.78 0.2 80)",
    glow: "oklch(0.78 0.2 80 / 0.4)",
  },
  {
    days: 60,
    label: "Legendary Chest",
    emoji: "👑",
    tier: "legendary",
    coins: 10_000,
    xp: 5_000,
    followers: 25_000,
    color: "oklch(0.72 0.22 295)",
    glow: "oklch(0.72 0.22 295 / 0.4)",
  },
];

/* ─── claimed milestones key ─── */
const CLAIMED_KEY = "mindforge-claimed-milestones";
function loadClaimed(): Set<number> {
  try {
    const raw = localStorage.getItem(CLAIMED_KEY);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch (_) {}
  return new Set();
}
function saveClaimed(s: Set<number>) {
  localStorage.setItem(CLAIMED_KEY, JSON.stringify([...s]));
}

function loadWeeklyClaimed(): Set<number> {
  try {
    const raw = localStorage.getItem("mindforge-weekly-claimed");
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch (_) {}
  return new Set();
}

/* ─── Confetti particle ─── */
function Confetti({ active }: { active: boolean }) {
  const PARTICLES = 40;
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: PARTICLES }, (_, i) => {
        const hue = (i * 30) % 360;
        const left = `${(i / PARTICLES) * 100}%`;
        const delay = (i * 0.05) % 0.8;
        const dur = 1.8 + (i % 4) * 0.3;
        const cfKey = `cf-pos-${Math.round((i / PARTICLES) * 100)}-hue-${hue}`;
        return (
          <motion.div
            key={cfKey}
            className="absolute top-0 w-2.5 h-2.5 rounded-sm"
            style={{ left, background: `oklch(0.7 0.22 ${hue})` }}
            initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ y: "110vh", opacity: 0, rotate: 720, scale: 0.5 }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

/* ─── Chest open overlay ─── */
function ChestOpenOverlay({
  show,
  onDone,
}: { show: boolean; onDone: () => void }) {
  const calledRef = useRef(false);
  useEffect(() => {
    if (!show) {
      calledRef.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onDone();
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "oklch(0.05 0.01 280 / 0.85)" }}
    >
      <motion.div
        className="text-8xl"
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: [0.3, 1.4, 1.1, 1.2], rotate: [0, 15, -10, 0] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        🎁
      </motion.div>
      <motion.div
        className="absolute text-4xl"
        initial={{ opacity: 0, scale: 0, y: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1.5, 1.3, 0.8],
          y: [-20, -80],
        }}
        transition={{ delay: 0.6, duration: 1.4 }}
      >
        ✨
      </motion.div>
    </div>
  );
}

/* ─── Weekly Box ─── */
function WeeklyBox({
  week,
  streak,
  claimed,
  onClaim,
}: {
  week: number;
  streak: number;
  claimed: boolean;
  onClaim: () => void;
}) {
  const threshold = week * 7;
  const unlocked = streak >= threshold;
  const pct = Math.min(100, (streak / threshold) * 100);
  return (
    <motion.div
      whileHover={unlocked && !claimed ? { scale: 1.04, y: -2 } : {}}
      className="p-4 rounded-2xl"
      style={{
        background: claimed
          ? "oklch(0.14 0.02 280 / 0.7)"
          : unlocked
            ? "linear-gradient(135deg, oklch(0.2 0.06 70 / 0.9), oklch(0.17 0.04 55 / 0.9))"
            : "oklch(0.13 0.016 280 / 0.7)",
        border: claimed
          ? "1px solid oklch(0.25 0.02 280 / 0.4)"
          : unlocked
            ? "1.5px solid oklch(0.68 0.2 75 / 0.55)"
            : "1px solid oklch(0.22 0.02 280 / 0.35)",
        backdropFilter: "blur(12px)",
        boxShadow:
          unlocked && !claimed ? "0 0 20px oklch(0.62 0.2 75 / 0.2)" : "none",
        cursor: unlocked && !claimed ? "pointer" : "default",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">
          {claimed ? "✅" : unlocked ? "🎁" : "🔒"}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: unlocked
              ? "oklch(0.22 0.05 75 / 0.5)"
              : "oklch(0.17 0.018 280 / 0.5)",
            color: unlocked ? "oklch(0.82 0.2 80)" : "oklch(0.45 0.02 280)",
          }}
        >
          Week {week}
        </span>
      </div>
      <p
        className="text-sm font-black mb-0.5"
        style={{
          color: unlocked ? "oklch(0.88 0.15 80)" : "oklch(0.45 0.02 280)",
        }}
      >
        +{(week * 300).toLocaleString()} 🪙
      </p>
      <p
        className="text-xs mb-2"
        style={{
          color: unlocked ? "oklch(0.68 0.1 80)" : "oklch(0.38 0.02 280)",
        }}
      >
        +{(week * 500).toLocaleString()} followers
      </p>
      {!claimed && (
        <>
          <div
            className="relative h-1.5 rounded-full overflow-hidden mb-2"
            style={{ background: "oklch(0.2 0.02 280)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: unlocked
                  ? "linear-gradient(90deg, oklch(0.68 0.2 75), oklch(0.78 0.22 85))"
                  : "oklch(0.28 0.03 280)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          {unlocked ? (
            <Button
              data-ocid={`streaks.weekly_box.${week}.claim_button`}
              size="sm"
              className="w-full text-xs h-7 font-black border-none"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.2 75), oklch(0.64 0.22 55))",
                color: "oklch(0.05 0.01 280)",
                boxShadow: "0 0 12px oklch(0.65 0.2 75 / 0.4)",
              }}
              onClick={onClaim}
            >
              Claim!
            </Button>
          ) : (
            <p
              className="text-[10px] text-center"
              style={{ color: "oklch(0.4 0.02 280)" }}
            >
              {threshold - streak} days to unlock
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

/* ─── Main export ─── */
export default function StreaksRewards() {
  const {
    navigate,
    profile,
    setProfile,
    creatorCoins,
    setCreatorCoins,
    loginStreak,
    lastLoginDate,
    postingStreak,
    lastPostTime,
    dailyRewardClaimed,
    setDailyRewardClaimed,
    setLastRewardDate,
    addNotification,
    triggerSave,
  } = useApp();

  const now = useNow();

  const [milestoneClaimed, setMilestoneClaimed] =
    useState<Set<number>>(loadClaimed);
  const [weeklyClaimed, setWeeklyClaimed] =
    useState<Set<number>>(loadWeeklyClaimed);
  const [chestAnim, setChestAnim] = useState(false);
  const [confetti, setConfetti] = useState(false);

  /* XP derived */
  const xp = profile.xp ?? 0;
  const lvl = currentLevel(xp);
  const xpPct = levelProgress(xp);
  const xpToNext = xpToNextLevel(xp);

  /* timing */
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now;

  /* posting streak state */
  const msSincePost = lastPostTime > 0 ? now - lastPostTime : null;
  const postStreakWarning =
    msSincePost !== null && msSincePost > 10 * 3_600_000;
  const postStreakBroken = msSincePost !== null && msSincePost > 12 * 3_600_000;
  const postStreakMsLeft =
    msSincePost !== null ? Math.max(0, 12 * 3_600_000 - msSincePost) : null;
  const postStreakUrgent =
    postStreakMsLeft !== null &&
    postStreakMsLeft < 2 * 3_600_000 &&
    !postStreakBroken;

  /* daily reward */
  const dayIdx = Math.min(Math.max(loginStreak - 1, 0), DAILY_COINS.length - 1);
  const dailyCoins = DAILY_COINS[dayIdx];

  const handleDailyClaim = () => {
    if (dailyRewardClaimed) return;
    setCreatorCoins((c) => c + dailyCoins);
    setProfile((p) => ({ ...p, xp: (p.xp ?? 0) + 50 }));
    setDailyRewardClaimed(true);
    setLastRewardDate(new Date().toISOString().slice(0, 10));
    triggerSave();
    addNotification({
      icon: "🎁",
      message: `Daily reward: +${dailyCoins} coins & +50 XP!`,
      type: "achievement",
    });
    toast.success(`+${dailyCoins} coins & +50 XP!`, { duration: 3000 });
  };

  const handleMilestoneClaim = useCallback(
    (days: number) => {
      if (loginStreak < days || milestoneClaimed.has(days)) return;
      const m = MILESTONES.find((x) => x.days === days);
      if (!m) return;
      setChestAnim(true);
      setTimeout(() => {
        setChestAnim(false);
        setCreatorCoins((c) => c + m.coins);
        setProfile((p) => ({
          ...p,
          xp: (p.xp ?? 0) + m.xp,
          followers: p.followers + m.followers,
        }));
        const next = new Set(milestoneClaimed);
        next.add(days);
        setMilestoneClaimed(next);
        saveClaimed(next);
        triggerSave();
        addNotification({
          icon: m.emoji,
          message: `${m.label} opened! +${m.coins} coins, +${m.xp} XP, +${m.followers.toLocaleString()} followers!`,
          type: "achievement",
        });
        toast.success(
          `${m.emoji} ${m.label}! +${m.followers.toLocaleString()} followers!`,
        );
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }, 1400);
    },
    [
      loginStreak,
      milestoneClaimed,
      setCreatorCoins,
      setProfile,
      triggerSave,
      addNotification,
    ],
  );

  const handleWeeklyClaim = (week: number) => {
    if (weeklyClaimed.has(week) || loginStreak < week * 7) return;
    const coins = week * 300;
    const follows = week * 500;
    setCreatorCoins((c) => c + coins);
    setProfile((p) => ({
      ...p,
      xp: (p.xp ?? 0) + week * 150,
      followers: p.followers + follows,
    }));
    const next = new Set(weeklyClaimed);
    next.add(week);
    setWeeklyClaimed(next);
    localStorage.setItem("mindforge-weekly-claimed", JSON.stringify([...next]));
    triggerSave();
    addNotification({
      icon: "📅",
      message: `Week ${week} reward: +${coins} coins & +${follows.toLocaleString()} followers!`,
      type: "achievement",
    });
    toast.success(`Week ${week} reward claimed!`);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2500);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "oklch(0.08 0.01 280)" }}
    >
      <Confetti active={confetti} />
      <ChestOpenOverlay show={chestAnim} onDone={() => setChestAnim(false)} />

      {/* Ambient radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 35% at 50% -5%, oklch(0.55 0.18 65 / 0.12), transparent)",
        }}
      />

      <div className="max-w-2xl mx-auto px-4 pb-24 pt-4 space-y-5 relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 pt-2"
        >
          <button
            type="button"
            data-ocid="streaks.back.button"
            onClick={() => navigate("hub")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              background: "oklch(0.15 0.02 280 / 0.7)",
              border: "1px solid oklch(0.3 0.025 280 / 0.4)",
            }}
          >
            <span className="text-base font-bold">←</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black tracking-tight">
              🔥 Streaks &amp; Rewards
            </h1>
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 280)" }}>
              Stay consistent · Earn more · Level up
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
            style={{
              background: "oklch(0.17 0.04 75 / 0.4)",
              border: "1px solid oklch(0.6 0.2 75 / 0.35)",
            }}
          >
            <span className="text-sm">🪙</span>
            <span
              className="text-sm font-black"
              style={{ color: "oklch(0.82 0.2 80)" }}
            >
              {creatorCoins.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* ── XP Level Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-2xl"
          style={{
            background: "oklch(0.13 0.02 280 / 0.92)",
            border: "1px solid oklch(0.28 0.04 295 / 0.4)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.22 295), oklch(0.52 0.2 270))",
                  boxShadow: "0 0 16px oklch(0.55 0.22 295 / 0.5)",
                }}
              >
                {lvl}
              </div>
              <div>
                <p className="text-sm font-black">Level {lvl}</p>
                <p className="text-xs" style={{ color: "oklch(0.5 0.04 280)" }}>
                  {xpToNext.toLocaleString()} XP to Level {lvl + 1}
                </p>
              </div>
            </div>
            <Badge
              data-ocid="streaks.xp.badge"
              className="text-xs font-bold border-none"
              style={{
                background: "oklch(0.2 0.04 295 / 0.5)",
                color: "oklch(0.78 0.2 295)",
                border: "1px solid oklch(0.5 0.2 295 / 0.4)",
              }}
            >
              {xp.toLocaleString()} XP
            </Badge>
          </div>
          <div
            className="relative h-3 rounded-full overflow-hidden"
            style={{ background: "oklch(0.17 0.02 280)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.6 0.22 295), oklch(0.72 0.24 320))",
                boxShadow: "0 0 8px oklch(0.65 0.22 295 / 0.6)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p
            className="text-[10px] mt-1 text-right"
            style={{ color: "oklch(0.42 0.03 280)" }}
          >
            {Math.round(xpPct)}% progress
          </p>
        </motion.div>

        {/* ── Urgent break warning ── */}
        <AnimatePresence>
          {postStreakUrgent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.1 25 / 0.85), oklch(0.17 0.08 15 / 0.85))",
                border: "2px solid oklch(0.6 0.22 30 / 0.7)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 28px oklch(0.55 0.22 30 / 0.3)",
              }}
              data-ocid="streaks.break_warning"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 0.9,
                  }}
                  className="text-2xl"
                >
                  ⚠️
                </motion.span>
                <div>
                  <p
                    className="font-black text-sm"
                    style={{ color: "oklch(0.85 0.22 35)" }}
                  >
                    Posting streak about to break!
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.7 0.15 35)" }}
                  >
                    ⏰ Only{" "}
                    {postStreakMsLeft !== null
                      ? fmtCountdown(postStreakMsLeft)
                      : "--"}{" "}
                    left — post now!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Login Streak Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-5 rounded-2xl"
          style={{
            background: "oklch(0.13 0.02 280 / 0.92)",
            border: "1px solid oklch(0.28 0.025 280 / 0.5)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8 }}
              className="text-xl"
            >
              🔥
            </motion.span>
            <h2 className="text-base font-black">Login Streak</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 3 }}
              className="rounded-2xl flex flex-col items-center justify-center shrink-0"
              style={{
                width: 76,
                height: 76,
                background:
                  "linear-gradient(135deg, oklch(0.73 0.22 55), oklch(0.65 0.22 35))",
                boxShadow: "0 0 26px oklch(0.65 0.2 55 / 0.55)",
              }}
            >
              <span
                className="text-2xl font-black leading-none"
                style={{ color: "oklch(0.05 0.01 280)" }}
              >
                {loginStreak}
              </span>
              <span
                className="text-[10px] font-black"
                style={{ color: "oklch(0.15 0.02 280)" }}
              >
                DAYS
              </span>
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm">
                {loginStreak >= 60
                  ? "👑 Legendary!"
                  : loginStreak >= 30
                    ? "🏆 Incredible streak!"
                    : loginStreak >= 7
                      ? "💪 On a roll!"
                      : loginStreak > 1
                        ? "Keep it going!"
                        : "Just getting started!"}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.5 0.03 280)" }}
              >
                Last login: {lastLoginDate || "Today"}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.6 0.12 295)" }}>
                Resets in: {fmtCountdown(msUntilMidnight)}
              </p>
            </div>
          </div>

          {/* 7-day calendar */}
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "oklch(0.48 0.03 280)" }}
          >
            Last 7 days
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => {
              const dayNum = i + 1;
              const filled = loginStreak >= dayNum;
              const isToday = dayNum === Math.min(loginStreak, 7);
              return (
                <motion.div
                  key={`cal-${dayNum}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-xl flex items-center justify-center"
                    style={{
                      height: 38,
                      background: filled
                        ? isToday
                          ? "linear-gradient(135deg, oklch(0.75 0.22 55), oklch(0.65 0.22 38))"
                          : "oklch(0.22 0.06 65 / 0.75)"
                        : "oklch(0.15 0.018 280)",
                      border: isToday
                        ? "1.5px solid oklch(0.8 0.2 60 / 0.8)"
                        : "1.5px solid transparent",
                      boxShadow: isToday
                        ? "0 0 10px oklch(0.65 0.2 55 / 0.45)"
                        : "none",
                    }}
                  >
                    {filled ? (
                      <motion.span
                        animate={isToday ? { scale: [1, 1.25, 1] } : {}}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.8,
                        }}
                      >
                        🔥
                      </motion.span>
                    ) : (
                      <span
                        style={{ color: "oklch(0.28 0.02 280)", fontSize: 18 }}
                      >
                        ·
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[9px] font-medium"
                    style={{
                      color: filled
                        ? "oklch(0.68 0.15 65)"
                        : "oklch(0.3 0.02 280)",
                    }}
                  >
                    D{dayNum}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Daily Reward Box ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <motion.div
            animate={
              !dailyRewardClaimed
                ? {
                    boxShadow: [
                      "0 0 12px oklch(0.65 0.2 75 / 0.2)",
                      "0 0 30px oklch(0.65 0.2 75 / 0.55)",
                      "0 0 12px oklch(0.65 0.2 75 / 0.2)",
                    ],
                  }
                : { boxShadow: "none" }
            }
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
            className="p-5 rounded-2xl"
            style={{
              background: dailyRewardClaimed
                ? "oklch(0.13 0.02 280 / 0.9)"
                : "linear-gradient(135deg, oklch(0.17 0.055 75 / 0.95), oklch(0.15 0.04 55 / 0.95))",
              border: dailyRewardClaimed
                ? "1px solid oklch(0.26 0.025 280 / 0.4)"
                : "1.5px solid oklch(0.7 0.2 80 / 0.55)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.span
                animate={
                  !dailyRewardClaimed ? { rotate: [0, 18, -12, 8, 0] } : {}
                }
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.8 }}
                className="text-xl"
              >
                🎁
              </motion.span>
              <h2 className="text-base font-black">Daily Reward</h2>
              {!dailyRewardClaimed && (
                <motion.div
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.4,
                  }}
                  className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.6 0.22 80 / 0.22)",
                    border: "1px solid oklch(0.72 0.22 80 / 0.55)",
                    color: "oklch(0.88 0.2 80)",
                  }}
                >
                  READY!
                </motion.div>
              )}
            </div>

            {/* 7-day strip */}
            <div className="flex gap-1 mb-4">
              {DAILY_COINS.map((coins, i) => {
                const active = i === dayIdx;
                const past = i < loginStreak && i < dayIdx;
                return (
                  <div
                    key={`day-coin-d${i + 1}`}
                    className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2"
                    style={{
                      background:
                        active && !dailyRewardClaimed
                          ? "linear-gradient(135deg, oklch(0.22 0.06 80 / 0.85), oklch(0.2 0.05 65 / 0.85))"
                          : past
                            ? "oklch(0.19 0.04 70 / 0.55)"
                            : "oklch(0.14 0.014 280 / 0.55)",
                      border:
                        active && !dailyRewardClaimed
                          ? "1.5px solid oklch(0.72 0.2 80 / 0.7)"
                          : "1px solid transparent",
                      boxShadow:
                        active && !dailyRewardClaimed
                          ? "0 0 12px oklch(0.65 0.2 78 / 0.38)"
                          : "none",
                    }}
                  >
                    <span className="text-xs">{past ? "✅" : "🪙"}</span>
                    <p
                      className="text-[10px] font-black leading-none"
                      style={{
                        color:
                          active && !dailyRewardClaimed
                            ? "oklch(0.9 0.2 80)"
                            : past
                              ? "oklch(0.68 0.14 75)"
                              : "oklch(0.38 0.02 280)",
                      }}
                    >
                      {coins}
                    </p>
                    <p
                      className="text-[9px]"
                      style={{ color: "oklch(0.36 0.02 280)" }}
                    >
                      D{i + 1}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-3xl font-black leading-none"
                  style={{
                    color: dailyRewardClaimed
                      ? "oklch(0.5 0.05 280)"
                      : "oklch(0.88 0.2 80)",
                  }}
                >
                  +{dailyCoins} 🪙
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.48 0.03 280)" }}
                >
                  {dailyRewardClaimed
                    ? `✓ Claimed · Next in ${fmtCountdown(msUntilMidnight)}`
                    : `Day ${loginStreak} reward · +50 XP included`}
                </p>
              </div>
              <Button
                data-ocid="streaks.daily_reward.primary_button"
                size="lg"
                disabled={dailyRewardClaimed}
                onClick={handleDailyClaim}
                className="font-black border-none shrink-0"
                style={{
                  background: dailyRewardClaimed
                    ? "oklch(0.21 0.02 280)"
                    : "linear-gradient(135deg, oklch(0.76 0.2 75), oklch(0.65 0.22 55))",
                  color: dailyRewardClaimed
                    ? "oklch(0.42 0.03 280)"
                    : "oklch(0.05 0.01 280)",
                  boxShadow: dailyRewardClaimed
                    ? "none"
                    : "0 0 22px oklch(0.65 0.2 75 / 0.5)",
                }}
              >
                {dailyRewardClaimed ? "Claimed ✓" : "Claim!"}
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Posting Streak ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="p-5 rounded-2xl"
          style={{
            background: "oklch(0.13 0.02 280 / 0.92)",
            border: postStreakBroken
              ? "1.5px solid oklch(0.55 0.22 25 / 0.65)"
              : postStreakWarning
                ? "1.5px solid oklch(0.65 0.2 50 / 0.5)"
                : "1px solid oklch(0.25 0.025 280 / 0.5)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📸</span>
            <h2 className="text-base font-black">Posting Streak</h2>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="rounded-2xl flex flex-col items-center justify-center shrink-0"
              style={{
                width: 76,
                height: 76,
                background: postStreakBroken
                  ? "linear-gradient(135deg, oklch(0.5 0.2 25), oklch(0.44 0.18 10))"
                  : "linear-gradient(135deg, oklch(0.62 0.22 295), oklch(0.54 0.2 270))",
                boxShadow: `0 0 20px ${postStreakBroken ? "oklch(0.5 0.2 25 / 0.45)" : "oklch(0.55 0.22 295 / 0.45)"}`,
              }}
            >
              <span
                className="text-2xl font-black leading-none"
                style={{ color: "#fff" }}
              >
                {postingStreak}
              </span>
              <span
                className="text-[10px] font-black"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                POSTS
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm">
                {postingStreak} post{postingStreak !== 1 ? "s" : ""} streak
              </p>
              {lastPostTime > 0 ? (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.5 0.03 280)" }}
                >
                  Last: {new Date(lastPostTime).toLocaleTimeString()}
                </p>
              ) : (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.5 0.03 280)" }}
                >
                  No posts yet
                </p>
              )}
              {postStreakBroken && (
                <p
                  className="text-xs font-black mt-1"
                  style={{ color: "oklch(0.65 0.22 25)" }}
                >
                  ⚠️ Streak broken — post now to restart
                </p>
              )}
              {postStreakWarning &&
                !postStreakBroken &&
                postStreakMsLeft !== null && (
                  <p
                    className="text-xs font-bold mt-1"
                    style={{ color: "oklch(0.72 0.2 50)" }}
                  >
                    ⏰ Breaks in {fmtCountdown(postStreakMsLeft)}
                  </p>
                )}
            </div>
          </div>
        </motion.div>

        {/* ── Weekly Reward Boxes ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-black mb-3 flex items-center gap-2">
            <span>📅</span> Weekly Reward Boxes
            <span
              className="text-xs font-normal ml-1"
              style={{ color: "oklch(0.48 0.03 280)" }}
            >
              7-day milestones
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((week) => (
              <WeeklyBox
                key={`wk-${week}`}
                week={week}
                streak={loginStreak}
                claimed={weeklyClaimed.has(week)}
                onClaim={() => handleWeeklyClaim(week)}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Milestone Chests ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <h2 className="text-sm font-black mb-3 flex items-center gap-2">
            <span>🏆</span> Creator Milestone Chests
          </h2>
          <div className="space-y-3">
            {MILESTONES.map((m, idx) => {
              const unlocked = loginStreak >= m.days;
              const isClaimed = milestoneClaimed.has(m.days);
              const progressPct = Math.min(100, (loginStreak / m.days) * 100);
              return (
                <motion.div
                  key={m.days}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24 + idx * 0.07 }}
                  className="p-4 rounded-2xl"
                  style={{
                    background: isClaimed
                      ? "oklch(0.12 0.015 280 / 0.75)"
                      : unlocked
                        ? "oklch(0.15 0.03 280 / 0.92)"
                        : "oklch(0.11 0.014 280 / 0.8)",
                    border: isClaimed
                      ? "1px solid oklch(0.24 0.02 280 / 0.35)"
                      : unlocked
                        ? `1.5px solid ${m.color}`
                        : "1px solid oklch(0.2 0.018 280 / 0.4)",
                    backdropFilter: "blur(12px)",
                    boxShadow:
                      unlocked && !isClaimed ? `0 0 22px ${m.glow}` : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={
                        unlocked && !isClaimed
                          ? { scale: [1, 1.12, 1], rotate: [0, 6, -4, 0] }
                          : {}
                      }
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                      }}
                      className="text-3xl shrink-0"
                    >
                      {isClaimed ? "✅" : m.emoji}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <p className="font-black text-sm">{m.label}</p>
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: unlocked
                              ? `${m.color}22`
                              : "oklch(0.17 0.018 280)",
                            color: unlocked ? m.color : "oklch(0.38 0.02 280)",
                          }}
                        >
                          {m.days}d streak
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span
                          className="text-[11px]"
                          style={{ color: "oklch(0.72 0.16 80)" }}
                        >
                          +{m.coins.toLocaleString()} 🪙
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "oklch(0.68 0.16 295)" }}
                        >
                          +{m.xp.toLocaleString()} XP
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "oklch(0.7 0.16 145)" }}
                        >
                          +{m.followers.toLocaleString()} followers
                        </span>
                      </div>
                      {!isClaimed && (
                        <div className="mt-2">
                          <div
                            className="relative h-1.5 rounded-full overflow-hidden"
                            style={{ background: "oklch(0.17 0.018 280)" }}
                          >
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                background: unlocked
                                  ? `linear-gradient(90deg, ${m.color}, oklch(0.85 0.22 80))`
                                  : "oklch(0.26 0.035 280)",
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </div>
                          {!unlocked && (
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: "oklch(0.38 0.02 280)" }}
                            >
                              {m.days - loginStreak} more days to unlock
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {unlocked && !isClaimed && (
                      <Button
                        data-ocid={`streaks.milestone.${m.days}.claim_button`}
                        size="sm"
                        className="shrink-0 font-black border-none text-xs"
                        style={{
                          background: `linear-gradient(135deg, ${m.color}, oklch(0.82 0.22 80))`,
                          color: "oklch(0.05 0.01 280)",
                          boxShadow: `0 0 16px ${m.glow}`,
                        }}
                        onClick={() => handleMilestoneClaim(m.days)}
                      >
                        Open!
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Streak Perks ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl"
          style={{
            background: "oklch(0.13 0.02 280 / 0.92)",
            border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            backdropFilter: "blur(16px)",
          }}
        >
          <h2 className="text-sm font-black mb-3 flex items-center gap-2">
            <span>⚡</span> Active Streak Perks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { days: 3, perk: "+5% engagement bonus", icon: "💬" },
              { days: 7, perk: "+10% reach boost", icon: "📡" },
              { days: 14, perk: "+15% follower growth", icon: "📈" },
              { days: 30, perk: "+20% all bonuses", icon: "🚀" },
              { days: 60, perk: "Legend badge unlocked", icon: "👑" },
            ].map((perk) => {
              const unlocked = loginStreak >= perk.days;
              return (
                <div
                  key={`perk-${perk.days}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: unlocked
                      ? "oklch(0.18 0.04 75 / 0.28)"
                      : "oklch(0.14 0.016 280 / 0.55)",
                    border: unlocked
                      ? "1px solid oklch(0.62 0.18 80 / 0.32)"
                      : "1px solid oklch(0.2 0.018 280 / 0.3)",
                  }}
                >
                  <span className="text-base shrink-0">
                    {unlocked ? perk.icon : "🔒"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-bold truncate"
                      style={{
                        color: unlocked
                          ? "oklch(0.85 0.16 80)"
                          : "oklch(0.42 0.02 280)",
                      }}
                    >
                      {perk.perk}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{
                        color: unlocked
                          ? "oklch(0.58 0.08 80)"
                          : "oklch(0.33 0.02 280)",
                      }}
                    >
                      Day {perk.days} streak
                    </p>
                  </div>
                  {unlocked && <span className="text-sm shrink-0">✅</span>}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="h-4" />
      </div>
    </div>
  );
}
