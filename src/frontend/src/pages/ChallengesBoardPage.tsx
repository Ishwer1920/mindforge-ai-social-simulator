import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const LS_KEY = "mindforge-challenges-board";

interface DailyChallenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  progressKey: "posts" | "likes" | "followers" | "hashtags" | "replies";
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "dc-posts",
    emoji: "📸",
    title: "Post Machine",
    description: "Post 3 times today",
    target: 3,
    reward: 300,
    progressKey: "posts",
  },
  {
    id: "dc-likes",
    emoji: "❤️",
    title: "Like Magnet",
    description: "Get 1000 likes total today",
    target: 1000,
    reward: 500,
    progressKey: "likes",
  },
  {
    id: "dc-followers",
    emoji: "👥",
    title: "Follower Drive",
    description: "Gain 100 followers today",
    target: 100,
    reward: 400,
    progressKey: "followers",
  },
  {
    id: "dc-hashtags",
    emoji: "#️⃣",
    title: "Hashtag Hero",
    description: "Use 5 different hashtags today",
    target: 5,
    reward: 250,
    progressKey: "hashtags",
  },
  {
    id: "dc-replies",
    emoji: "💬",
    title: "Community Builder",
    description: "Reply to 5 comments",
    target: 5,
    reward: 200,
    progressKey: "replies",
  },
];

interface ChallengesState {
  date: string;
  progress: Record<string, number>;
  claimed: Record<string, boolean>;
  streakDays: number;
}

function loadState(): ChallengesState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const d = JSON.parse(raw) as ChallengesState;
      const today = new Date().toISOString().slice(0, 10);
      if (d.date === today) return d;
      return {
        date: today,
        progress: {},
        claimed: {},
        streakDays: d.streakDays,
      };
    }
  } catch (_) {}
  return {
    date: new Date().toISOString().slice(0, 10),
    progress: {},
    claimed: {},
    streakDays: 0,
  };
}

export default function ChallengesBoardPage() {
  const {
    navigate,
    posts,
    profile,
    creatorCoins: _creatorCoins,
    setCreatorCoins,
    addNotification,
  } = useApp();
  const [state, setState] = useState<ChallengesState>(loadState);
  const prevFollowersRef = useRef(profile.followers);
  const _prevPostsRef = useRef(posts.length);

  // Simulate progress based on current game state
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayPosts = posts.filter((p) => {
      const d = new Date(p.timestamp).toISOString().slice(0, 10);
      return d === today;
    });
    const todayLikes = todayPosts.reduce((s, p) => s + p.likes, 0);
    const usedHashtags = new Set(todayPosts.flatMap((p) => p.hashtags ?? []));
    const followersGained = Math.max(
      0,
      profile.followers - prevFollowersRef.current,
    );

    setState((prev) => {
      const updated = {
        ...prev,
        progress: {
          ...prev.progress,
          posts: Math.max(prev.progress.posts ?? 0, todayPosts.length),
          likes: Math.max(prev.progress.likes ?? 0, todayLikes),
          followers: Math.max(prev.progress.followers ?? 0, followersGained),
          hashtags: Math.max(prev.progress.hashtags ?? 0, usedHashtags.size),
          replies: prev.progress.replies ?? 0,
        },
      };
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [posts, profile.followers]);

  function handleClaim(challenge: DailyChallenge) {
    const progress = state.progress[challenge.progressKey] ?? 0;
    if (progress < challenge.target) return;
    if (state.claimed[challenge.id]) return;

    const newState = {
      ...state,
      claimed: { ...state.claimed, [challenge.id]: true },
    };
    // Check if all claimed for streak
    const allClaimed = DAILY_CHALLENGES.every(
      (c) => newState.claimed[c.id] || c.id === challenge.id,
    );
    if (allClaimed) newState.streakDays = (state.streakDays ?? 0) + 1;
    setState(newState);
    localStorage.setItem(LS_KEY, JSON.stringify(newState));

    setCreatorCoins((c) => c + challenge.reward);
    addNotification({
      icon: challenge.emoji,
      message: `Challenge "${challenge.title}" completed! +${challenge.reward} coins.`,
      type: "challenge",
    });
    toast.success(
      `${challenge.emoji} ${challenge.title} complete! +${challenge.reward} coins`,
    );
  }

  function simulateProgress(key: string, amount: number) {
    setState((prev) => {
      const updated = {
        ...prev,
        progress: {
          ...prev.progress,
          [key]: (prev.progress[key] ?? 0) + amount,
        },
      };
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  const allChallengesComplete = DAILY_CHALLENGES.every(
    (c) => state.claimed[c.id],
  );

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
          data-ocid="challenges-board.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            Daily Challenges
          </h1>
          <p className="text-xs text-muted-foreground">Resets every 24 hours</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: "oklch(0.18 0.04 50 / 0.3)",
            border: "1px solid oklch(0.65 0.2 50 / 0.3)",
            color: "oklch(0.78 0.2 50)",
          }}
        >
          🔥 {state.streakDays ?? 0}d streak
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {allChallengesComplete && (
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "oklch(0.55 0.22 145 / 0.15)",
              border: "1px solid oklch(0.55 0.22 145 / 0.4)",
            }}
          >
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold" style={{ color: "oklch(0.72 0.22 145)" }}>
              All challenges complete! Come back tomorrow!
            </p>
          </div>
        )}

        {DAILY_CHALLENGES.map((challenge, idx) => {
          const progress = state.progress[challenge.progressKey] ?? 0;
          const pct = Math.min(100, (progress / challenge.target) * 100);
          const isComplete = progress >= challenge.target;
          const isClaimed = !!state.claimed[challenge.id];
          return (
            <div
              key={challenge.id}
              data-ocid={`challenges-board.item.${idx + 1}`}
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: isClaimed
                  ? "oklch(0.14 0.03 145 / 0.4)"
                  : "oklch(0.13 0.016 280 / 0.95)",
                border: `1px solid ${isClaimed ? "oklch(0.45 0.15 145 / 0.4)" : isComplete ? "oklch(0.55 0.22 80 / 0.4)" : "oklch(0.22 0.025 280 / 0.5)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{challenge.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {challenge.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {challenge.description}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.78 0.18 80)" }}
                  >
                    +{challenge.reward}
                  </p>
                  <p className="text-[10px] text-muted-foreground">coins</p>
                </div>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    {Math.min(progress, challenge.target)}/{challenge.target}
                  </span>
                  <span
                    style={{
                      color: isComplete
                        ? "oklch(0.72 0.22 145)"
                        : "oklch(0.55 0.04 280)",
                    }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.18 0.02 280)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isClaimed
                        ? "oklch(0.55 0.22 145)"
                        : isComplete
                          ? "oklch(0.65 0.22 80)"
                          : "linear-gradient(90deg, oklch(0.55 0.22 260), oklch(0.55 0.22 295))",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleClaim(challenge)}
                  disabled={!isComplete || isClaimed}
                  className="flex-1 h-8 text-xs"
                  style={
                    isClaimed
                      ? {
                          background: "oklch(0.28 0.05 145)",
                          color: "oklch(0.72 0.22 145)",
                        }
                      : isComplete
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.65 0.22 80), oklch(0.6 0.2 60))",
                            color: "white",
                          }
                        : {}
                  }
                  data-ocid={`challenges-board.claim.button.${idx + 1}`}
                >
                  {isClaimed
                    ? "✓ Claimed"
                    : isComplete
                      ? "🎉 Claim Reward"
                      : "In Progress..."}
                </Button>
                {!isClaimed && challenge.progressKey === "replies" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateProgress("replies", 1)}
                    className="text-xs h-8 px-3"
                    data-ocid={`challenges-board.simulate.button.${idx + 1}`}
                  >
                    +Reply
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
