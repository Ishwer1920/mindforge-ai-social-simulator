import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Flame,
  Gift,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { WeeklyChallenge } from "../context/AppContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "Easy" | "Medium" | "Hard";

interface DailyChallenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  target: number;
  difficulty: Difficulty;
  rewardCoins: number;
  rewardFollowers: number;
  rewardXP: number;
  rewardLabel: string;
  getProgress: (state: ProgressState) => number;
  resetKey: string; // date string for reset tracking
}

interface DailyChallengeState {
  id: string;
  claimed: boolean;
  claimedAt: number | null;
}

interface ProgressState {
  followers: number;
  postCount: number;
  totalViews: number;
  loginStreak: number;
  coins: number;
}

// ─── Daily challenge definitions ──────────────────────────────────────────────

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily-post",
    emoji: "📸",
    title: "Post Creator",
    description: "Create 2 new posts today to engage your audience",
    target: 2,
    difficulty: "Easy",
    rewardCoins: 75,
    rewardFollowers: 200,
    rewardXP: 150,
    rewardLabel: "+200 followers & 75 coins",
    getProgress: (s) => Math.min(s.postCount, 2),
    resetKey: "",
  },
  {
    id: "daily-views",
    emoji: "👁️",
    title: "View Chaser",
    description: "Accumulate 5,000 views across all posts",
    target: 5000,
    difficulty: "Medium",
    rewardCoins: 150,
    rewardFollowers: 500,
    rewardXP: 300,
    rewardLabel: "+500 followers & 150 coins",
    getProgress: (s) => Math.min(s.totalViews, 5000),
    resetKey: "",
  },
  {
    id: "daily-streak",
    emoji: "🔥",
    title: "Streak Keeper",
    description: "Maintain a login streak of 3 or more days",
    target: 3,
    difficulty: "Easy",
    rewardCoins: 50,
    rewardFollowers: 100,
    rewardXP: 100,
    rewardLabel: "+100 followers & 50 coins",
    getProgress: (s) => Math.min(s.loginStreak, 3),
    resetKey: "",
  },
  {
    id: "daily-coins",
    emoji: "💰",
    title: "Coin Collector",
    description: "Accumulate 500 Creator Coins total",
    target: 500,
    difficulty: "Hard",
    rewardCoins: 300,
    rewardFollowers: 1000,
    rewardXP: 600,
    rewardLabel: "+1,000 followers & 300 coins",
    getProgress: (s) => Math.min(s.coins, 500),
    resetKey: "",
  },
];

// ─── Difficulty helpers ───────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    gradient: string;
    accentColor: string;
    borderColor: string;
    badgeBg: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  Easy: {
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.2 145), oklch(0.48 0.18 160))",
    accentColor: "oklch(0.72 0.2 145)",
    borderColor: "oklch(0.55 0.2 145 / 0.4)",
    badgeBg: "oklch(0.15 0.04 145 / 0.5)",
    label: "Easy",
    icon: <Star className="w-3 h-3" />,
  },
  Medium: {
    gradient: "linear-gradient(135deg, oklch(0.68 0.22 60), oklch(0.6 0.2 40))",
    accentColor: "oklch(0.78 0.2 60)",
    borderColor: "oklch(0.68 0.22 60 / 0.4)",
    badgeBg: "oklch(0.15 0.05 60 / 0.5)",
    label: "Medium",
    icon: <Flame className="w-3 h-3" />,
  },
  Hard: {
    gradient:
      "linear-gradient(135deg, oklch(0.58 0.26 15), oklch(0.52 0.24 340))",
    accentColor: "oklch(0.72 0.22 15)",
    borderColor: "oklch(0.58 0.26 15 / 0.4)",
    badgeBg: "oklch(0.15 0.06 15 / 0.5)",
    label: "Hard",
    icon: <Zap className="w-3 h-3" />,
  },
};

// Weekly challenge meta mapping
const WEEKLY_META: Record<
  string,
  {
    emoji: string;
    difficulty: Difficulty;
    gradient: string;
    accentColor: string;
    borderColor: string;
  }
> = {
  "ch-followers": {
    emoji: "👥",
    difficulty: "Hard",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 230))",
    accentColor: "oklch(0.72 0.2 260)",
    borderColor: "oklch(0.55 0.22 260 / 0.4)",
  },
  "ch-explore": {
    emoji: "🔭",
    difficulty: "Medium",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.2 200), oklch(0.5 0.18 180))",
    accentColor: "oklch(0.72 0.2 200)",
    borderColor: "oklch(0.55 0.2 200 / 0.4)",
  },
  "ch-views": {
    emoji: "👁️",
    difficulty: "Hard",
    gradient:
      "linear-gradient(135deg, oklch(0.68 0.22 50), oklch(0.62 0.2 30))",
    accentColor: "oklch(0.78 0.2 50)",
    borderColor: "oklch(0.68 0.22 50 / 0.4)",
  },
  "ch-hashtag": {
    emoji: "#️⃣",
    difficulty: "Medium",
    gradient:
      "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.55 0.2 270))",
    accentColor: "oklch(0.72 0.2 295)",
    borderColor: "oklch(0.6 0.22 295 / 0.4)",
  },
};

const WEEKLY_FALLBACK = {
  emoji: "🎯",
  difficulty: "Medium" as Difficulty,
  gradient: "linear-gradient(135deg, oklch(0.6 0.2 295), oklch(0.55 0.18 270))",
  accentColor: "oklch(0.72 0.2 295)",
  borderColor: "oklch(0.6 0.2 295 / 0.4)",
};

// ─── Sparkle overlay ─────────────────────────────────────────────────────────

function SparkleBlast() {
  const sparks = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    distance: 40 + Math.random() * 40,
    color: [
      "oklch(0.78 0.22 60)",
      "oklch(0.72 0.2 145)",
      "oklch(0.72 0.2 295)",
      "oklch(0.9 0.1 80)",
    ][i % 4],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
          style={{ background: spark.color }}
          initial={{ x: "-50%", y: "-50%", scale: 0, opacity: 1 }}
          animate={{
            x: `calc(-50% + ${Math.cos((spark.angle * Math.PI) / 180) * spark.distance}px)`,
            y: `calc(-50% + ${Math.sin((spark.angle * Math.PI) / 180) * spark.distance}px)`,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Reward popup ─────────────────────────────────────────────────────────────

interface RewardPopupData {
  label: string;
  coins: number;
  followers: number;
  xp: number;
}

function RewardPopup({
  data,
  onDone,
}: { data: RewardPopupData; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-2 px-8 py-6 rounded-3xl text-center"
        style={{
          background: "oklch(0.12 0.025 280 / 0.95)",
          border: "2px solid oklch(0.72 0.2 60 / 0.7)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 60px oklch(0.72 0.2 60 / 0.3)",
        }}
        initial={{ scale: 0.3, y: 40 }}
        animate={{ scale: [0.3, 1.15, 1], y: [40, -8, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, -10, 10, -6, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          🎁
        </motion.div>
        <p
          className="text-xl font-bold"
          style={{ color: "oklch(0.9 0.15 60)" }}
        >
          Reward Claimed!
        </p>
        <p className="text-sm" style={{ color: "oklch(0.78 0.12 80)" }}>
          {data.label}
        </p>
        <div className="flex gap-3 mt-1">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: "oklch(0.55 0.22 60 / 0.25)",
              color: "oklch(0.78 0.2 60)",
            }}
          >
            +{data.coins} coins
          </span>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: "oklch(0.55 0.2 145 / 0.25)",
              color: "oklch(0.72 0.2 145)",
            }}
          >
            +{data.followers} followers
          </span>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: "oklch(0.55 0.22 260 / 0.25)",
              color: "oklch(0.72 0.2 260)",
            }}
          >
            +{data.xp} XP
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Daily Challenge Card ─────────────────────────────────────────────────────

function DailyChallengeCard({
  challenge,
  progress,
  state,
  onClaim,
}: {
  challenge: DailyChallenge;
  progress: number;
  state: DailyChallengeState;
  onClaim: (id: string) => void;
}) {
  const [showSparks, setShowSparks] = useState(false);
  const diff = DIFFICULTY_CONFIG[challenge.difficulty];
  const pct = Math.min(100, Math.round((progress / challenge.target) * 100));
  const isComplete = progress >= challenge.target;
  const isClaimed = state.claimed;

  const handleClaim = () => {
    if (!isComplete || isClaimed) return;
    setShowSparks(true);
    onClaim(challenge.id);
    setTimeout(() => setShowSparks(false), 800);
  };

  return (
    <motion.div
      layout
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: isClaimed
          ? "oklch(0.13 0.025 145 / 0.6)"
          : isComplete
            ? "oklch(0.13 0.025 60 / 0.7)"
            : "oklch(0.13 0.018 280 / 0.95)",
        border: `1px solid ${
          isClaimed
            ? "oklch(0.55 0.2 145 / 0.5)"
            : isComplete
              ? "oklch(0.68 0.22 60 / 0.6)"
              : diff.borderColor
        }`,
        boxShadow:
          isComplete && !isClaimed
            ? "0 0 20px oklch(0.68 0.22 60 / 0.2)"
            : undefined,
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {showSparks && <SparkleBlast />}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: diff.gradient }}
            animate={
              isClaimed ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}
            }
            transition={{ duration: 0.5 }}
          >
            {isClaimed ? "✅" : challenge.emoji}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-foreground leading-tight">
                {challenge.title}
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  background: diff.badgeBg,
                  color: diff.accentColor,
                  border: `1px solid ${diff.borderColor}`,
                }}
              >
                {diff.icon}
                {diff.label}
              </span>
              {isClaimed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: "oklch(0.55 0.2 145 / 0.2)",
                    color: "oklch(0.72 0.2 145)",
                    border: "1px solid oklch(0.55 0.2 145 / 0.4)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" /> Done
                </motion.span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground">
              {progress.toLocaleString()} / {challenge.target.toLocaleString()}
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ color: diff.accentColor }}
            >
              {pct}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ background: "oklch(0.18 0.02 280 / 0.7)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{ background: diff.gradient }}
            >
              {pct === 100 && !isClaimed && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  style={{ background: "oklch(1 0 0 / 0.25)" }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Reward pill */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
          style={{
            background: "oklch(0.18 0.04 80 / 0.2)",
            border: "1px solid oklch(0.45 0.1 80 / 0.2)",
          }}
        >
          <Gift
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "oklch(0.78 0.2 80)" }}
          />
          <span className="text-xs" style={{ color: "oklch(0.78 0.15 80)" }}>
            {challenge.rewardLabel}
          </span>
          <Sparkles
            className="w-3 h-3 ml-auto flex-shrink-0"
            style={{ color: "oklch(0.72 0.18 60)" }}
          />
        </div>

        {/* CTA */}
        {!isClaimed && isComplete && (
          <motion.button
            type="button"
            onClick={handleClaim}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: diff.gradient }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 0px transparent",
                `0 0 16px ${diff.accentColor.replace(")", " / 0.6)")}`,
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            data-ocid={`challenges.daily.${challenge.id}.claim_button`}
          >
            <Gift className="w-4 h-4" /> Claim Reward
          </motion.button>
        )}
        {isClaimed && (
          <div className="flex items-center justify-center gap-2 py-2">
            <CheckCircle2
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.2 145)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.72 0.2 145)" }}
            >
              Reward collected!
            </span>
          </div>
        )}
        {!isComplete && (
          <p className="text-center text-[10px] text-muted-foreground">
            {(challenge.target - progress).toLocaleString()} more to complete
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Weekly Challenge Card ─────────────────────────────────────────────────────

function WeeklyChallengeCard({
  challenge,
  onClaim,
}: { challenge: WeeklyChallenge; onClaim: (id: string) => void }) {
  const [showSparks, setShowSparks] = useState(false);
  const meta = WEEKLY_META[challenge.id] ?? WEEKLY_FALLBACK;
  const diff = DIFFICULTY_CONFIG[meta.difficulty];
  const pct = Math.min(
    100,
    Math.round((challenge.current / Math.max(challenge.target, 1)) * 100),
  );
  const isComplete = challenge.completed;
  const isClaimed = challenge.rewardClaimed;

  const handleClaim = () => {
    if (!isComplete || isClaimed) return;
    setShowSparks(true);
    onClaim(challenge.id);
    setTimeout(() => setShowSparks(false), 800);
  };

  return (
    <motion.div
      layout
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: isClaimed
          ? "oklch(0.13 0.025 145 / 0.6)"
          : isComplete
            ? "oklch(0.13 0.025 60 / 0.7)"
            : "oklch(0.13 0.018 280 / 0.95)",
        border: `1px solid ${
          isClaimed
            ? "oklch(0.55 0.2 145 / 0.5)"
            : isComplete
              ? "oklch(0.68 0.22 60 / 0.6)"
              : meta.borderColor
        }`,
        boxShadow:
          isComplete && !isClaimed
            ? "0 0 20px oklch(0.68 0.22 60 / 0.2)"
            : undefined,
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {showSparks && <SparkleBlast />}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: meta.gradient }}
          >
            {isClaimed ? "✅" : meta.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-foreground leading-tight">
                {challenge.title}
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  background: diff.badgeBg,
                  color: diff.accentColor,
                  border: `1px solid ${diff.borderColor}`,
                }}
              >
                {diff.icon}
                {diff.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground">
              {challenge.current.toLocaleString()} /{" "}
              {challenge.target.toLocaleString()}
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ color: meta.accentColor }}
            >
              {pct}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ background: "oklch(0.18 0.02 280 / 0.7)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{ background: meta.gradient }}
            >
              {pct === 100 && !isClaimed && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  style={{ background: "oklch(1 0 0 / 0.25)" }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Reward pill */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
          style={{
            background: "oklch(0.18 0.04 80 / 0.2)",
            border: "1px solid oklch(0.45 0.1 80 / 0.2)",
          }}
        >
          <Gift
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "oklch(0.78 0.2 80)" }}
          />
          <span className="text-xs" style={{ color: "oklch(0.78 0.15 80)" }}>
            {challenge.reward}
          </span>
        </div>

        {/* CTA */}
        {!isClaimed && isComplete && (
          <motion.button
            type="button"
            onClick={handleClaim}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: meta.gradient }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 0px transparent",
                `0 0 16px ${meta.accentColor.replace(")", " / 0.6)")}`,
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            data-ocid={`challenges.weekly.${challenge.id}.claim_button`}
          >
            <Gift className="w-4 h-4" /> Claim Reward
          </motion.button>
        )}
        {isClaimed && (
          <div className="flex items-center justify-center gap-2 py-2">
            <CheckCircle2
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.2 145)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.72 0.2 145)" }}
            >
              Reward collected!
            </span>
          </div>
        )}
        {!isComplete && (
          <p className="text-center text-[10px] text-muted-foreground">
            {(challenge.target - challenge.current).toLocaleString()} more to go
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Daily reset countdown ────────────────────────────────────────────────────

function DailyResetTimer() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="text-[10px] font-mono"
      style={{ color: "oklch(0.72 0.18 60)" }}
    >
      Resets in {timeLeft}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DAILY_STATE_KEY = "mindforge-daily-challenge-state";

function loadDailyState(): {
  date: string;
  states: DailyChallengeState[];
} | null {
  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY);
    if (raw)
      return JSON.parse(raw) as { date: string; states: DailyChallengeState[] };
  } catch (_) {}
  return null;
}

function saveDailyState(date: string, states: DailyChallengeState[]) {
  localStorage.setItem(DAILY_STATE_KEY, JSON.stringify({ date, states }));
}

export default function ChallengesPage() {
  const {
    navigate,
    weeklyChallenges,
    claimChallengeReward,
    profile,
    posts,
    loginStreak,
    creatorCoins,
    setCreatorCoins,
    setProfile,
    addNotification,
    triggerSave,
  } = useApp();

  // ── Daily challenge state (persisted to localStorage, resets daily) ──
  const today = new Date().toISOString().slice(0, 10);
  const [dailyStates, setDailyStates] = useState<DailyChallengeState[]>(() => {
    const saved = loadDailyState();
    if (saved && saved.date === today) return saved.states;
    // New day or first time: fresh states
    return DAILY_CHALLENGES.map((c) => ({
      id: c.id,
      claimed: false,
      claimedAt: null,
    }));
  });

  // Persist daily state on change
  useEffect(() => {
    saveDailyState(today, dailyStates);
  }, [dailyStates, today]);

  // ── Progress from AppContext ──
  const userPosts = posts.filter((p) => p.authorUsername === profile.username);
  const totalViews = userPosts.reduce((sum, p) => sum + p.views, 0);
  const progressState: ProgressState = {
    followers: profile.followers,
    postCount: userPosts.length,
    totalViews,
    loginStreak,
    coins: creatorCoins,
  };

  // ── Reward popup ──
  const [rewardPopup, setRewardPopup] = useState<RewardPopupData | null>(null);

  // ── Claim daily ──
  const handleClaimDaily = useCallback(
    (challengeId: string) => {
      const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
      if (!challenge) return;
      const state = dailyStates.find((s) => s.id === challengeId);
      if (!state || state.claimed) return;

      setDailyStates((prev) =>
        prev.map((s) =>
          s.id === challengeId
            ? { ...s, claimed: true, claimedAt: Date.now() }
            : s,
        ),
      );
      setCreatorCoins((c) => c + challenge.rewardCoins);
      setProfile((p) => ({
        ...p,
        followers: p.followers + challenge.rewardFollowers,
        xp: p.xp + challenge.rewardXP,
      }));
      addNotification({
        icon: "🎁",
        message: `Daily challenge "${challenge.title}" completed! ${challenge.rewardLabel}`,
        type: "challenge",
      });
      toast.success(`🎯 ${challenge.title} complete! ${challenge.rewardLabel}`);
      setRewardPopup({
        label: challenge.rewardLabel,
        coins: challenge.rewardCoins,
        followers: challenge.rewardFollowers,
        xp: challenge.rewardXP,
      });
      triggerSave();
    },
    [dailyStates, setCreatorCoins, setProfile, addNotification, triggerSave],
  );

  // ── Claim weekly ──
  const handleClaimWeekly = useCallback(
    (challengeId: string) => {
      const challenge = weeklyChallenges.find((c) => c.id === challengeId);
      if (!challenge || !challenge.completed || challenge.rewardClaimed) return;
      claimChallengeReward(challengeId);
      toast.success(`🏆 Weekly challenge "${challenge.title}" reward claimed!`);
      setRewardPopup({
        label: challenge.reward,
        coins: 200,
        followers: 500,
        xp: 500,
      });
    },
    [weeklyChallenges, claimChallengeReward],
  );

  // ── Stats ──
  const dailyClaimed = dailyStates.filter((s) => s.claimed).length;
  const weeklyClaimed = weeklyChallenges.filter((c) => c.rewardClaimed).length;
  const weeklyReady = weeklyChallenges.filter(
    (c) => c.completed && !c.rewardClaimed,
  ).length;
  const dailyReady = dailyStates.filter((s, i) => {
    const ch = DAILY_CHALLENGES[i];
    if (!ch) return false;
    return (
      progressState && ch.getProgress(progressState) >= ch.target && !s.claimed
    );
  }).length;

  const notifRef = useRef(false);
  // Fire notifications for newly-completed challenges
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount using notifRef guard
  useEffect(() => {
    if (notifRef.current) return;
    notifRef.current = true;
    DAILY_CHALLENGES.forEach((ch, i) => {
      const state = dailyStates[i];
      if (!state || state.claimed) return;
      const prog = ch.getProgress(progressState);
      if (prog >= ch.target) {
        addNotification({
          icon: "🎯",
          message: `Challenge ready to claim: "${ch.title}" — tap Challenges to collect your reward!`,
          type: "challenge",
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.11 0.018 280 / 0.97)",
          borderBottom: "1px solid oklch(0.2 0.025 280 / 0.5)",
          backdropFilter: "blur(24px)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("hub")}
          data-ocid="challenges.back.button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground leading-tight">
            ⚡ Challenges
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete goals · earn rewards · grow faster
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold flex-shrink-0"
          style={{
            background: "oklch(0.18 0.04 295 / 0.3)",
            border: "1px solid oklch(0.55 0.2 295 / 0.4)",
            color: "oklch(0.72 0.2 295)",
          }}
          data-ocid="challenges.progress.panel"
        >
          <Target className="w-3.5 h-3.5" />
          {dailyClaimed + weeklyClaimed} done
        </div>
      </div>

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-6">
        {/* ── Stats banner ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 295 / 0.18), oklch(0.55 0.2 260 / 0.1))",
              border: "1px solid oklch(0.55 0.22 295 / 0.3)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "oklch(0.55 0.22 295 / 0.25)" }}
            >
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">
                {profile.name}'s Challenge Board
              </p>
              <p className="text-xs text-muted-foreground">
                {dailyReady + weeklyReady > 0
                  ? `🎁 ${dailyReady + weeklyReady} reward${dailyReady + weeklyReady > 1 ? "s" : ""} ready to claim!`
                  : "Keep creating to unlock rewards"}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.78 0.2 60)" }}
              >
                {dailyClaimed + weeklyClaimed}
              </p>
              <p className="text-[10px] text-muted-foreground">completed</p>
            </div>
          </div>
        </motion.div>

        {/* ── Daily Challenges ──────────────────────────────────────────── */}
        <section data-ocid="challenges.daily.section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.22 60), oklch(0.6 0.2 40))",
                }}
              >
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Daily Challenges
                </h2>
                <DailyResetTimer />
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold"
              style={{
                background: "oklch(0.18 0.04 60 / 0.4)",
                color: "oklch(0.78 0.2 60)",
                border: "1px solid oklch(0.55 0.2 60 / 0.4)",
              }}
            >
              {dailyClaimed}/{DAILY_CHALLENGES.length} done
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DAILY_CHALLENGES.map((challenge, i) => {
              const state = dailyStates.find((s) => s.id === challenge.id) ?? {
                id: challenge.id,
                claimed: false,
                claimedAt: null,
              };
              const progress = challenge.getProgress(progressState);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  data-ocid={`challenges.daily.item.${i + 1}`}
                >
                  <DailyChallengeCard
                    challenge={challenge}
                    progress={progress}
                    state={state}
                    onClaim={handleClaimDaily}
                  />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Weekly Challenges ─────────────────────────────────────────── */}
        <section data-ocid="challenges.weekly.section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 230))",
                }}
              >
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Weekly Challenges
                </h2>
                <span className="text-[10px] text-muted-foreground">
                  Resets every 7 days
                </span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold"
              style={{
                background: "oklch(0.18 0.04 260 / 0.4)",
                color: "oklch(0.72 0.2 260)",
                border: "1px solid oklch(0.55 0.2 260 / 0.4)",
              }}
            >
              {weeklyClaimed}/{weeklyChallenges.length} done
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weeklyChallenges.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                data-ocid={`challenges.weekly.item.${i + 1}`}
              >
                <WeeklyChallengeCard
                  challenge={challenge}
                  onClaim={handleClaimWeekly}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Tips card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "oklch(0.12 0.018 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.2 295)" }}
              />
              <h3
                className="text-xs font-semibold"
                style={{ color: "oklch(0.72 0.2 295)" }}
              >
                Pro Tips to Complete Challenges Faster
              </h3>
            </div>
            <ul className="space-y-1.5">
              {[
                {
                  tip: "Post consistently every 12 hours to grow followers faster",
                  icon: "⏰",
                },
                {
                  tip: "Use trending hashtags to boost Explore visibility and views",
                  icon: "#️⃣",
                },
                {
                  tip: "Upgrade Content Quality skill for higher reach per post",
                  icon: "🚀",
                },
                {
                  tip: "Join Creator Houses to unlock collab opportunities and coin bonuses",
                  icon: "🏠",
                },
              ].map(({ tip, icon }) => (
                <li
                  key={tip}
                  className="text-xs text-muted-foreground flex gap-2 items-start"
                >
                  <span className="flex-shrink-0">{icon}</span>
                  {tip}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => navigate("hub")}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              style={{ border: "1px solid oklch(0.25 0.025 280 / 0.5)" }}
              data-ocid="challenges.back_to_hub.button"
            >
              Back to Creator Hub <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Reward Popup ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {rewardPopup && (
          <RewardPopup data={rewardPopup} onDone={() => setRewardPopup(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
