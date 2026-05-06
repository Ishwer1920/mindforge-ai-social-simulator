import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Image, Send, Sparkles, Timer, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PostCard from "../components/PostCard";
import PostDetailView from "../components/PostDetailView";
import StoryBar from "../components/StoryBar";
import StoryViewer from "../components/StoryViewer";
import { useApp } from "../context/AppContext";
import type { PostItem, Story } from "../context/AppContext";
import { extractHashtags } from "../context/AppContext";
import { matchesHackCondition } from "../hooks/useAlgoHackEngine";
import { generatePostsForUser } from "../utils/simulatedUsers";
import { computePostStrength } from "../utils/viralEngine";

const SKEL_IDS = ["s1", "s2", "s3"];
const BOUNCE_IDS = ["b1", "b2", "b3"];

function FeedSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-20" />
        </div>
      </div>
      <Skeleton className="w-full h-60" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

function PostStrengthMeter({ caption }: { caption: string }) {
  const hashtags = extractHashtags(caption);
  const score = computePostStrength(caption, hashtags);
  const label =
    score < 26
      ? "Weak"
      : score < 51
        ? "Fair"
        : score < 76
          ? "Strong"
          : "Excellent";
  const color =
    score < 26
      ? "oklch(0.6 0.2 25)"
      : score < 51
        ? "oklch(0.75 0.18 65)"
        : score < 76
          ? "oklch(0.72 0.18 145)"
          : "oklch(0.7 0.22 295)";
  const tip =
    hashtags.length < 2
      ? "Tip: Add 2\u20134 hashtags for more reach"
      : caption.split(/\s+/).filter(Boolean).length < 5
        ? "Tip: Write a longer caption"
        : "Looking great! Post at peak hours for extra reach";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Post Strength</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "oklch(0.22 0.02 280)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">{tip}</p>
    </div>
  );
}

function AlgoHackBanner({ onNavigate }: { onNavigate: () => void }) {
  const { activeAlgoHack } = useApp();
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!activeAlgoHack) return;
    function update() {
      if (!activeAlgoHack) return;
      const rem = Math.max(0, activeAlgoHack.expiresAt - Date.now());
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2, "0")}`);
    }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [activeAlgoHack]);

  if (!activeAlgoHack) return null;
  const isPulsing = activeAlgoHack.expiresAt - Date.now() < 5 * 60 * 1000;

  const conditionLabel: Record<string, string> = {
    video: "video posts",
    hashtags3: "posts with 3+ hashtags",
    carousel: "carousel posts",
    text_only: "text-only posts",
    collab: "collab posts",
  };

  return (
    <div
      data-ocid="feed.algo_hack.banner"
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.2 0.06 295 / 0.92), oklch(0.17 0.05 260 / 0.9))",
        border: "1px solid oklch(0.55 0.22 295 / 0.5)",
        boxShadow: "0 0 30px oklch(0.55 0.22 295 / 0.18)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "oklch(0.55 0.25 295 / 0.25)" }}
        >
          🔓
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: "oklch(0.72 0.2 295)" }}
            >
              🔓 Algorithm Leaked
            </span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.55 0.22 295 / 0.2)",
                color: "oklch(0.85 0.12 295)",
              }}
            >
              {activeAlgoHack.multiplier}x reach
            </span>
          </div>
          <p className="text-sm" style={{ color: "oklch(0.85 0.06 260)" }}>
            <span
              className="font-semibold"
              style={{ color: "oklch(0.88 0.12 295)" }}
            >
              {conditionLabel[activeAlgoHack.condition] ??
                activeAlgoHack.condition}
            </span>{" "}
            get {activeAlgoHack.multiplier}x reach right now!
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs" style={{ color: "oklch(0.55 0.05 280)" }}>
            Ends in
          </p>
          <p
            className="text-lg font-black tabular-nums"
            style={{
              color: isPulsing ? "oklch(0.72 0.25 25)" : "oklch(0.88 0.12 295)",
              animation: isPulsing
                ? "pulse 1s ease-in-out infinite"
                : undefined,
            }}
          >
            {countdown}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <button
          type="button"
          data-ocid="feed.algo_hack.view_button"
          onClick={onNavigate}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{
            background: "oklch(0.55 0.22 295 / 0.25)",
            border: "1px solid oklch(0.55 0.22 295 / 0.4)",
            color: "oklch(0.78 0.18 295)",
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

function PlatformEventBanner({
  onDismiss,
  onUseTag,
}: {
  onDismiss: () => void;
  onUseTag: (tag: string) => void;
}) {
  const { activePlatformEvent } = useApp();
  if (!activePlatformEvent) return null;

  return (
    <div
      data-ocid="feed.event.card"
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.28 0.08 295 / 0.9), oklch(0.22 0.06 240 / 0.9))",
        border: "1px solid oklch(0.55 0.2 295 / 0.4)",
        boxShadow: "0 0 30px oklch(0.55 0.2 295 / 0.15)",
      }}
    >
      {/* Dismiss */}
      <button
        type="button"
        data-ocid="feed.event.close_button"
        onClick={onDismiss}
        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
        style={{ background: "oklch(0.2 0.04 280 / 0.5)" }}
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "oklch(0.55 0.25 295 / 0.3)" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: "oklch(0.72 0.2 295)" }}
            >
              Active Event
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "oklch(0.88 0.12 295)" }}
            >
              {activePlatformEvent.hashtag}
            </span>
          </div>
          <p className="text-sm text-white/90">{activePlatformEvent.label}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          data-ocid="feed.event.primary_button"
          size="sm"
          className="gap-1.5 btn-gradient text-white border-none text-xs"
          onClick={() => onUseTag(activePlatformEvent.hashtag)}
        >
          Use {activePlatformEvent.hashtag}
        </Button>
        <span
          className="text-xs self-center"
          style={{ color: "oklch(0.72 0.2 295)" }}
        >
          {activePlatformEvent.reachMultiplier}x reach multiplier
        </span>
      </div>
    </div>
  );
}

export default function HomeFeed() {
  const {
    profile,
    posts,
    setPosts,
    addNotification,
    stories,
    addSimulatedPost,
    addPostToSeries,
    setPostingStreak,
    setLastPostTime,
    lastPostTime,
    navigate,
    audienceMood,
    audienceMoodScore,
    setAudienceMoodScore,
    aiManagerMessages,
    setAiManagerMessages,
    fanRebellionActive,
    platformTakeoverActive,
    platformTakeoverEndsAt,
    reputationScore,
    burnoutActive,
    postingStreak,
    activeAlgoHack,
    setAlgoHackHistory,
  } = useApp();
  // Pre-existing energy UI vars - not yet in context, use stubs
  const creatorEnergy = 100;
  const restModeActive = false;
  const drainEnergy = (_n: number) => {};
  const [caption, setCaption] = useState("");
  const [seriesInput, setSeriesInput] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailPost, setDetailPost] = useState<PostItem | null>(null);
  const [viewingStory, setViewingStory] = useState<{
    story: Story;
    index: number;
  } | null>(null);
  const [eventDismissed, setEventDismissed] = useState(false);
  const [takeoverCountdown, setTakeoverCountdown] = useState<string>("2:00");
  const [maxPanelOpen, setMaxPanelOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const simFeedPageRef = useRef(0);
  const addSimulatedPostRef = useRef(addSimulatedPost);
  addSimulatedPostRef.current = addSimulatedPost;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const generated = [
      ...generatePostsForUser(4, 3, 0),
      ...generatePostsForUser(2, 2, 10),
      ...generatePostsForUser(3, 2, 20),
    ];
    for (const sp of generated) addSimulatedPostRef.current(sp);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const page = simFeedPageRef.current + 1;
          simFeedPageRef.current = page;
          const newGenerated = generatePostsForUser(
            (page % 8) + 5,
            3,
            page * 100,
          );
          for (const sp of newGenerated) addSimulatedPostRef.current(sp);
        }
      },
      { threshold: 0.1 },
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

  // Platform takeover countdown
  useEffect(() => {
    if (!platformTakeoverActive || !platformTakeoverEndsAt) {
      setTakeoverCountdown("2:00");
      return;
    }
    function update() {
      const remaining = Math.max(0, platformTakeoverEndsAt! - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTakeoverCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [platformTakeoverActive, platformTakeoverEndsAt]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(
      0,
      5 - imagePreviews.length,
    );
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImagePreviews((prev) =>
          [...prev, ev.target?.result as string].slice(0, 5),
        );
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = (idx: number) =>
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));

  const handlePost = () => {
    if (!caption.trim() && imagePreviews.length === 0) return;
    // Drain creator energy on post (stubbed, full system in CreatorEnergy page)
    drainEnergy(8);
    if (creatorEnergy <= 8) {
      // energy too low - handled silently
    } else if (creatorEnergy < 30) {
      // low energy warning
    }
    const imgs =
      imagePreviews.length > 0
        ? imagePreviews
        : [`https://picsum.photos/seed/${Date.now()}/600/400`];

    // Check algo hack condition
    const hackActive = activeAlgoHack && activeAlgoHack.expiresAt > Date.now();
    const hackMatches = hackActive
      ? matchesHackCondition(activeAlgoHack!.condition, caption, imgs.length)
      : false;
    const hackMultiplier = hackMatches ? activeAlgoHack!.multiplier : 1;
    const baseReach = Math.floor(200 + Math.random() * 800);
    const boostedReach = Math.floor(baseReach * hackMultiplier);

    const newPost: PostItem = {
      id: `p-${Date.now()}`,
      authorName: profile.name,
      authorUsername: profile.username,
      authorAvatar: profile.avatar,
      imageUrl: imgs[0],
      images: imgs,
      caption: caption.trim() || "Check out this moment! \ud83d\udcf8",
      hashtags: [],
      likes: 0,
      comments: [],
      shares: 0,
      saves: 0,
      views: 0,
      reach: boostedReach,
      impressions: 0,
      followersGained: 0,
      timestamp: Date.now(),
      engagementScore: 0,
      likedByUser: false,
      savedByUser: false,
      isTrending: false,
      watchTime: 45 + Math.floor(Math.random() * 48),
    };
    setPosts((prev) => [newPost, ...prev]);
    addNotification({
      icon: "\ud83d\udcf8",
      message: "You published a new post!",
      type: "like",
    });
    if (seriesInput.trim()) {
      addPostToSeries(newPost.id, seriesInput.trim());
    }
    // Update posting streak
    const now = Date.now();
    if (lastPostTime > 0 && now - lastPostTime < 12 * 60 * 60 * 1000) {
      setPostingStreak((s) => s + 1);
    } else {
      setPostingStreak(1);
    }
    setLastPostTime(now);
    // Update mood score on post
    setAudienceMoodScore((prev) => Math.min(100, prev + 5));

    // Record hack usage if applicable
    if (hackMatches && activeAlgoHack) {
      const extraReach = boostedReach - baseReach;
      setAlgoHackHistory((prev) => [
        {
          type: activeAlgoHack.type,
          condition: activeAlgoHack.condition,
          multiplier: activeAlgoHack.multiplier,
          firedAt:
            activeAlgoHack.expiresAt - (activeAlgoHack.expiresAt - Date.now()),
          postsBoosted: 1,
          extraReach,
        },
        ...prev,
      ]);
      toast.success(
        `\ud83d\udd25 Hack activated! ${activeAlgoHack.multiplier}x reach applied! +${extraReach.toLocaleString()} extra reach`,
      );
    } else {
      toast.success("Post published! \ud83c\udf89");
    }

    setCaption("");
    setSeriesInput("");
    setImagePreviews([]);
  };

  const handleUseTag = (tag: string) => {
    setCaption((prev) =>
      prev.includes(tag) ? prev : `${prev}${prev ? " " : ""}${tag}`,
    );
    toast.success(`${tag} added to your post!`);
  };

  // AI Manager message generation
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount for interval setup
  useEffect(() => {
    const generateMessage = () => {
      const now = Date.now();
      const hour = new Date().getHours();
      const today = posts.filter(
        (p) =>
          p.authorUsername === profile.username && now - p.timestamp < 86400000,
      );
      const recentViral = posts.find(
        (p) =>
          p.authorUsername === profile.username &&
          p.engagementScore > 5000 &&
          now - p.timestamp < 3600000,
      );
      const hoursSincePost =
        lastPostTime > 0 ? (now - lastPostTime) / 3600000 : 99;

      let text = "";
      let type: "tip" | "warning" | "celebration" | "info" = "tip";

      if (recentViral) {
        text =
          "🔥 That post is blowing up! Strike while it's hot — post a follow-up to ride the wave.";
        type = "celebration";
      } else if (burnoutActive) {
        text =
          "⚠️ You're posting too much. Quality over quantity — take a breath and let your audience recover.";
        type = "warning";
      } else if (today.length >= 5) {
        text =
          "⚠️ You've posted 5+ times today. Overposting can hurt engagement. Slow down a bit!";
        type = "warning";
      } else if (profile.followers < 1000) {
        text =
          "Your audience is small but mighty. Consistent posting is your fastest path to 1K followers!";
        type = "tip";
      } else if (reputationScore > 80) {
        text =
          "Your reputation is strong 💪 Now's the perfect time to negotiate better brand deals.";
        type = "info";
      } else if (audienceMoodScore < 30) {
        text =
          "Engagement is slipping 😬 Try a different content type or refresh your hashtag strategy.";
        type = "warning";
      } else if (hoursSincePost >= 2) {
        text =
          "Your audience misses you 👀 A quick post could reignite your momentum right now.";
        type = "tip";
      } else if (hour >= 6 && hour <= 10) {
        text =
          "Good morning! ☀️ Peak engagement hours are starting. Post now for maximum reach!";
        type = "info";
      } else if (postingStreak >= 5) {
        text = `🔥 ${postingStreak}-day streak! Your consistency is building serious momentum. Keep it up!`;
        type = "celebration";
      } else {
        const tips = [
          "Mix up your content formats — carousels get 3x more saves than single images.",
          "Reply to comments within the first hour. It signals quality to the algorithm.",
          "Use 3-5 niche hashtags instead of generic ones for better reach.",
          "Your best posts tend to come when you post between 6-9pm local time.",
          "Collaborating with another creator can 2x your follower growth this week.",
        ];
        text = tips[Math.floor(Math.random() * tips.length)];
        type = "tip";
      }

      if (!text) return;
      const newMsg = {
        id: `max-${now}`,
        text,
        type,
        timestamp: now,
        read: false,
      };
      setAiManagerMessages((prev) => [newMsg, ...prev].slice(0, 20));
    };

    // Generate immediately on mount if no messages
    if (aiManagerMessages.length === 0) generateMessage();

    const interval = setInterval(
      generateMessage,
      5 * 60 * 1000 + Math.random() * 5 * 60 * 1000,
    );
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allFeedPosts = [...posts].sort((a, b) => {
    const isOwn = (p: PostItem) => p.authorUsername === profile.username;
    if (isOwn(a) && !isOwn(b)) return -1;
    if (!isOwn(a) && isOwn(b)) return 1;
    return (
      b.timestamp - a.timestamp + (b.engagementScore - a.engagementScore) * 0.1
    );
  });

  return (
    <div className="max-w-xl mx-auto space-y-5 py-6 px-4">
      {/* Fan Rebellion Banner */}
      {fanRebellionActive && (
        <div
          data-ocid="feed.fan_rebellion.panel"
          className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.08 25 / 0.85), oklch(0.2 0.07 5 / 0.85))",
            border: "1px solid oklch(0.65 0.28 25 / 0.5)",
            boxShadow: "0 0 30px oklch(0.55 0.28 25 / 0.3)",
            animation: "rebellion-pulse 1.8s ease-in-out infinite",
          }}
        >
          <span
            className="text-2xl flex-shrink-0"
            style={{ animation: "shake 0.5s ease-in-out infinite" }}
          >
            😡
          </span>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold"
              style={{ color: "oklch(0.88 0.22 25)" }}
            >
              ⚠️ Fan Rebellion Active!
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.72 0.16 25)" }}
            >
              Your fans are getting restless — you&apos;re losing followers
              every 2 minutes. Post NOW to stop the bleed!
            </p>
          </div>
          <button
            type="button"
            data-ocid="feed.fan_rebellion.post_button"
            className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{
              background: "oklch(0.6 0.28 25)",
              color: "white",
            }}
            onClick={() =>
              document
                .querySelector<HTMLTextAreaElement>(
                  "[data-ocid='post.create.textarea']",
                )
                ?.focus()
            }
          >
            Post Now
          </button>
        </div>
      )}

      {/* Platform Takeover Banner */}
      {platformTakeoverActive && (
        <div
          data-ocid="feed.platform_takeover.panel"
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.06 25), oklch(0.16 0.05 10), oklch(0.2 0.06 40))",
            border: "1px solid oklch(0.65 0.28 35 / 0.6)",
            boxShadow:
              "0 0 50px oklch(0.6 0.3 25 / 0.4), inset 0 1px 0 oklch(0.7 0.2 50 / 0.15)",
          }}
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap
                  className="w-5 h-5"
                  style={{ color: "oklch(0.78 0.28 55)" }}
                />
                <span
                  className="text-base font-black tracking-widest uppercase"
                  style={{ color: "oklch(0.88 0.28 50)" }}
                >
                  ⚡ PLATFORM TAKEOVER
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: "oklch(0.22 0.08 25 / 0.6)",
                  border: "1px solid oklch(0.65 0.28 25 / 0.4)",
                }}
              >
                <Timer
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.75 0.28 25)" }}
                />
                <span
                  className="text-base font-black tabular-nums"
                  style={{ color: "oklch(0.88 0.28 25)" }}
                >
                  {takeoverCountdown}
                </span>
              </div>
            </div>
            <p className="text-sm" style={{ color: "oklch(0.78 0.12 50)" }}>
              The algorithm has gone haywire! All posts get{" "}
              <strong style={{ color: "oklch(0.88 0.28 50)" }}>10x–50x</strong>{" "}
              viral multiplier for the next {takeoverCountdown}.
            </p>
            <p
              className="text-xs mt-1.5 font-semibold"
              style={{ color: "oklch(0.65 0.22 25)" }}
            >
              🔥 Post RIGHT NOW to ride the wave!
            </p>
          </div>
        </div>
      )}

      {/* Algorithm Hack Active Banner */}
      {activeAlgoHack && activeAlgoHack.expiresAt > Date.now() && (
        <AlgoHackBanner onNavigate={() => navigate("algo-hack")} />
      )}

      {/* Platform Event Banner */}
      {!eventDismissed && (
        <PlatformEventBanner
          onDismiss={() => setEventDismissed(true)}
          onUseTag={handleUseTag}
        />
      )}

      {/* Audience Mood Widget */}
      {(() => {
        const moodConfig = {
          hyped: {
            emoji: "🔥",
            label: "HYPED",
            color: "oklch(0.82 0.2 80)",
            bg: "oklch(0.22 0.06 80 / 0.3)",
            border: "oklch(0.65 0.2 80 / 0.4)",
            bar: "oklch(0.72 0.2 80)",
            text: "Your audience is pumped! Post now for maximum reach.",
          },
          neutral: {
            emoji: "😊",
            label: "Neutral",
            color: "oklch(0.7 0.08 240)",
            bg: "oklch(0.16 0.02 280 / 0.5)",
            border: "oklch(0.28 0.03 280 / 0.4)",
            bar: "oklch(0.55 0.12 240)",
            text: "Audience mood is steady. Keep up your posting rhythm.",
          },
          bored: {
            emoji: "😴",
            label: "Bored",
            color: "oklch(0.78 0.14 80)",
            bg: "oklch(0.2 0.05 80 / 0.25)",
            border: "oklch(0.55 0.16 80 / 0.4)",
            bar: "oklch(0.72 0.16 80)",
            text: "Your audience is getting bored. Time to post something fresh!",
          },
          angry: {
            emoji: "😡",
            label: "Angry",
            color: "oklch(0.72 0.22 25)",
            bg: "oklch(0.2 0.06 25 / 0.3)",
            border: "oklch(0.55 0.25 25 / 0.4)",
            bar: "oklch(0.65 0.25 25)",
            text: "Audience is upset! Post immediately to recover.",
          },
        };
        const cfg = moodConfig[audienceMood];
        const mult =
          audienceMood === "hyped"
            ? 1.4
            : audienceMood === "bored"
              ? 0.7
              : audienceMood === "angry"
                ? 0.5
                : 1.0;
        return (
          <div
            data-ocid="feed.mood.panel"
            className="rounded-2xl px-4 py-3 space-y-2"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cfg.emoji}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                  style={{
                    background: "oklch(0.18 0.03 280 / 0.6)",
                    color: "oklch(0.6 0.05 280)",
                  }}
                >
                  {mult}x
                </span>
              </div>
              <span className="text-xs font-mono" style={{ color: cfg.color }}>
                {audienceMoodScore}/100
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.18 0.02 280 / 0.5)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${audienceMoodScore}%`, background: cfg.bar }}
              />
            </div>
            <p className="text-xs" style={{ color: "oklch(0.58 0.04 280)" }}>
              {cfg.text}
            </p>
          </div>
        );
      })()}

      {/* Creator Energy Bar */}
      {(() => {
        const energyColor =
          creatorEnergy >= 90
            ? "oklch(0.68 0.2 145)"
            : creatorEnergy >= 70
              ? "oklch(0.65 0.18 240)"
              : creatorEnergy >= 50
                ? "oklch(0.75 0.18 80)"
                : creatorEnergy >= 30
                  ? "oklch(0.72 0.22 55)"
                  : "oklch(0.7 0.25 25)";
        const energyBg =
          creatorEnergy >= 90
            ? "oklch(0.15 0.05 145 / 0.3)"
            : creatorEnergy >= 70
              ? "oklch(0.14 0.04 240 / 0.3)"
              : creatorEnergy >= 50
                ? "oklch(0.17 0.05 80 / 0.3)"
                : creatorEnergy >= 30
                  ? "oklch(0.17 0.06 55 / 0.3)"
                  : "oklch(0.17 0.07 25 / 0.4)";
        const energyLabel =
          creatorEnergy >= 90
            ? "⚡ Energized"
            : creatorEnergy >= 70
              ? "😊 Focused"
              : creatorEnergy >= 50
                ? "😐 Tired"
                : creatorEnergy >= 30
                  ? "😓 Exhausted"
                  : "🔥 Burned Out";
        const isBurnedOut = creatorEnergy < 30;
        return (
          <button
            type="button"
            data-ocid="feed.energy.panel"
            className="rounded-2xl px-4 py-3 space-y-1.5 w-full text-left cursor-pointer transition-all hover:opacity-90"
            style={{
              background: energyBg,
              border: `1px solid ${energyColor.replace(")", " / 0.4)")}`,
              animation: isBurnedOut
                ? "pulse 2s ease-in-out infinite"
                : undefined,
            }}
            onClick={() => navigate("creator-energy")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: energyColor }}
                >
                  {energyLabel}
                </span>
                {restModeActive && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.18 0.06 145 / 0.4)",
                      color: "oklch(0.7 0.2 145)",
                    }}
                  >
                    REST 2x
                  </span>
                )}
              </div>
              <span
                className="text-xs font-mono"
                style={{ color: energyColor }}
              >
                {creatorEnergy}/100
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.18 0.02 280 / 0.5)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${creatorEnergy}%`,
                  background: energyColor,
                }}
              />
            </div>
          </button>
        );
      })()}

      {/* Go Live button */}
      <button
        type="button"
        data-ocid="feed.go_live.button"
        onClick={() => navigate("live-stream")}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.28 25 / 0.2), oklch(0.5 0.25 10 / 0.2))",
          border: "1px solid oklch(0.55 0.28 25 / 0.4)",
          color: "oklch(0.75 0.22 25)",
        }}
      >
        🔴 Go Live
      </button>

      {!loading && (
        <div className="glass-card p-4">
          <StoryBar
            onStoryClick={(story, index) => setViewingStory({ story, index })}
          />
        </div>
      )}

      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <Textarea
            data-ocid="post.create.textarea"
            placeholder="What's on your mind? Use #hashtags!"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="resize-none text-sm flex-1"
            style={{
              background: "oklch(0.18 0.02 280 / 0.5)",
              border: "1px solid oklch(0.3 0.025 280 / 0.5)",
            }}
            rows={2}
          />
        </div>

        {caption.trim().length > 0 && <PostStrengthMeter caption={caption} />}

        <input
          type="text"
          data-ocid="post.series.input"
          placeholder="📺 Add to series (optional, e.g. 'Morning Routine')"
          value={seriesInput}
          onChange={(e) => setSeriesInput(e.target.value)}
          className="w-full text-xs rounded-lg px-3 py-2 outline-none transition-all"
          style={{
            background: "oklch(0.18 0.02 280 / 0.5)",
            border: "1px solid oklch(0.3 0.025 280 / 0.4)",
            color: "oklch(0.9 0.01 260)",
          }}
        />

        {imagePreviews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div
                key={src.slice(0, 20)}
                className="relative w-20 h-20 rounded-lg overflow-hidden"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                style={{ borderColor: "oklch(0.35 0.03 280 / 0.5)" }}
              >
                <Image className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            data-ocid="post.create.upload_button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => fileRef.current?.click()}
          >
            <Image className="w-4 h-4" /> Photo
          </Button>
          <p className="text-xs text-muted-foreground ml-auto">
            {imagePreviews.length}/5 photos
          </p>
          <Button
            data-ocid="post.create.submit_button"
            size="sm"
            className="btn-gradient text-white border-none gap-1.5"
            onClick={handlePost}
            disabled={!caption.trim() && imagePreviews.length === 0}
          >
            <Send className="w-3.5 h-3.5" /> Post
          </Button>
        </div>
      </div>

      {loading
        ? SKEL_IDS.map((id) => <FeedSkeleton key={id} />)
        : allFeedPosts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onOpenDetail={setDetailPost}
            />
          ))}

      <div ref={bottomRef} className="h-4" />
      {!loading && (
        <div className="flex justify-center py-2">
          <div className="flex gap-1">
            {BOUNCE_IDS.map((id, i) => (
              <div
                key={id}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  background: "oklch(0.6 0.22 295 / 0.6)",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {viewingStory && (
        <StoryViewer
          stories={stories}
          startIndex={Math.max(
            0,
            stories.findIndex((s) => s.id === viewingStory.story.id),
          )}
          onClose={() => setViewingStory(null)}
        />
      )}

      {detailPost && (
        <PostDetailView
          post={allFeedPosts.find((p) => p.id === detailPost.id) ?? detailPost}
          posts={allFeedPosts}
          onClose={() => setDetailPost(null)}
          onNavigate={setDetailPost}
        />
      )}

      {/* Max AI Manager floating button */}
      {(() => {
        const unread = aiManagerMessages.filter((m) => !m.read).length;
        return (
          <button
            type="button"
            data-ocid="feed.max_manager.button"
            onClick={() => {
              setMaxPanelOpen((o) => !o);
              if (!maxPanelOpen) {
                setAiManagerMessages((prev) =>
                  prev.map((m) => ({ ...m, read: true })),
                );
              }
            }}
            className="fixed z-40 transition-all hover:scale-110 active:scale-95"
            style={{
              bottom: "88px",
              right: "16px",
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 295))",
              boxShadow: "0 4px 20px oklch(0.55 0.22 260 / 0.5)",
              border: "2px solid oklch(0.65 0.18 260 / 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🤖
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "oklch(0.65 0.25 25)", color: "white" }}
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        );
      })()}

      {/* Max AI Manager Panel */}
      {maxPanelOpen && (
        <div
          data-ocid="feed.max_manager.panel"
          className="fixed z-50 rounded-2xl overflow-hidden flex flex-col"
          style={{
            bottom: "152px",
            right: "16px",
            width: "min(340px, calc(100vw - 32px))",
            maxHeight: "420px",
            background: "oklch(0.12 0.02 280)",
            border: "1px solid oklch(0.25 0.04 260 / 0.6)",
            boxShadow: "0 8px 40px oklch(0.1 0.02 280 / 0.8)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: "1px solid oklch(0.2 0.02 280 / 0.5)",
              background: "oklch(0.14 0.025 280)",
            }}
          >
            <span className="text-xl">🤖</span>
            <div>
              <p className="text-sm font-bold text-white">Max</p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.08 260)" }}>
                Your AI Creator Manager
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMaxPanelOpen(false)}
              className="ml-auto text-muted-foreground hover:text-white transition-colors"
              data-ocid="feed.max_manager.close_button"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            {aiManagerMessages.length === 0 ? (
              <div
                data-ocid="feed.max_manager.empty_state"
                className="text-center py-8"
              >
                <p className="text-2xl mb-2">🤖</p>
                <p className="text-sm text-muted-foreground">
                  Max is watching your analytics. Check back soon!
                </p>
              </div>
            ) : (
              aiManagerMessages.map((msg, i) => {
                const typeStyle = {
                  tip: {
                    accent: "oklch(0.65 0.18 240)",
                    bg: "oklch(0.16 0.03 260 / 0.6)",
                  },
                  warning: {
                    accent: "oklch(0.75 0.18 80)",
                    bg: "oklch(0.18 0.05 80 / 0.3)",
                  },
                  celebration: {
                    accent: "oklch(0.78 0.18 80)",
                    bg: "oklch(0.18 0.05 80 / 0.25)",
                  },
                  info: {
                    accent: "oklch(0.62 0.15 200)",
                    bg: "oklch(0.15 0.04 200 / 0.4)",
                  },
                }[msg.type];
                return (
                  <div
                    key={msg.id}
                    data-ocid={`feed.max_manager.item.${i + 1}`}
                    className="flex gap-2.5"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base"
                      style={{ background: "oklch(0.2 0.04 260 / 0.5)" }}
                    >
                      🤖
                    </div>
                    <div
                      className="flex-1 rounded-xl px-3 py-2.5"
                      style={{
                        background: typeStyle.bg,
                        border: `1px solid ${typeStyle.accent}30`,
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "oklch(0.85 0.04 280)" }}
                      >
                        {msg.text}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.45 0.03 280)" }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
