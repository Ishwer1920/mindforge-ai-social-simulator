import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  BarChart2,
  Calendar,
  Clapperboard,
  FlaskConical,
  Hash,
  Lightbulb,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

// ---- Types ----
interface ScheduledPost {
  id: string;
  caption: string;
  delay: string;
  publishAt: number;
  published: boolean;
}

interface HashtagStat {
  tag: string;
  reach: string;
  competition: "Low" | "Medium" | "High";
  trendingScore: number;
}

interface ExperimentResult {
  id: string;
  variantA: string;
  variantB: string;
  winnerIdx: 0 | 1;
  likesA: number;
  likesB: number;
  sharesA: number;
  sharesB: number;
  ranAt: number;
}

// ---- Caption templates ----
const CAPTION_TEMPLATES: Record<string, string[]> = {
  Tech: [
    "Just discovered this game-changing {kw} tool 🤯 Drop a 💬 if you want the full breakdown!",
    "Everyone sleeping on {kw} right now — here's why it's about to blow up 🚀",
    "The {kw} tip that saved me 3 hours this week ⚡ #tech #productivity",
  ],
  Fitness: [
    "Your {kw} form is the only thing standing between you and results 💪",
    "3 {kw} moves that hit different — full reel coming tomorrow 🔥 #fitness",
    "Consistency > perfection with {kw}. Trust the process 🏆",
  ],
  Comedy: [
    "POV: You tried {kw} for the first time 😭💀",
    "Nobody prepared me for how relatable {kw} would be 😂",
    "Explaining {kw} to your parents vs your friends 🤣 #relatable",
  ],
  Finance: [
    "The {kw} strategy nobody is talking about (but should be) 💰",
    "Broke at 20 → built wealth with {kw} by 25. Here's how 📈",
    "{kw} changed how I think about money — full breakdown incoming 🧠",
  ],
  default: [
    "Dropping everything about {kw} this week — stay tuned 🔥",
    "The {kw} content you didn't know you needed ✨",
    "Be honest — did {kw} change your perspective? 👇",
  ],
};

function generateCaptions(niche: string, keywords: string): string[] {
  const kw = keywords.trim() || "this";
  const templates = CAPTION_TEMPLATES[niche] ?? CAPTION_TEMPLATES.default;
  return templates.map((t) => t.replace(/\{kw\}/g, kw));
}

const HASHTAG_POOL: HashtagStat[] = [
  { tag: "#viral", reach: "50M+", competition: "High", trendingScore: 98 },
  { tag: "#fyp", reach: "80M+", competition: "High", trendingScore: 97 },
  { tag: "#creator", reach: "12M", competition: "Medium", trendingScore: 82 },
  { tag: "#trending", reach: "30M+", competition: "High", trendingScore: 91 },
  {
    tag: "#contentcreator",
    reach: "8M",
    competition: "Medium",
    trendingScore: 76,
  },
  { tag: "#tech", reach: "15M", competition: "High", trendingScore: 88 },
  { tag: "#fitness", reach: "22M", competition: "High", trendingScore: 90 },
  {
    tag: "#motivation",
    reach: "18M",
    competition: "Medium",
    trendingScore: 85,
  },
  { tag: "#reels", reach: "60M+", competition: "High", trendingScore: 95 },
  { tag: "#aesthetic", reach: "6M", competition: "Low", trendingScore: 68 },
  { tag: "#niche", reach: "2M", competition: "Low", trendingScore: 55 },
  { tag: "#growthhack", reach: "3M", competition: "Low", trendingScore: 61 },
];

const DELAY_OPTIONS = [
  { label: "1 hour", ms: 3600000 },
  { label: "3 hours", ms: 10800000 },
  { label: "6 hours", ms: 21600000 },
  { label: "Tomorrow", ms: 86400000 },
];

// ---- Editing Filters ----
const EDIT_FILTERS = [
  {
    id: "cinematic",
    label: "Cinematic",
    emoji: "🎬",
    description: "Deep shadows, warm highlights, film grain",
    qualityBoost: 12,
    gradient:
      "linear-gradient(135deg, oklch(0.35 0.08 280), oklch(0.25 0.05 260))",
    accent: "oklch(0.72 0.15 260)",
    preview: "Rich cinematic tones with moody atmosphere",
  },
  {
    id: "vibrant",
    label: "Vibrant",
    emoji: "🌈",
    description: "Boosted saturation, punchy colors",
    qualityBoost: 10,
    gradient:
      "linear-gradient(135deg, oklch(0.65 0.25 30), oklch(0.6 0.22 295))",
    accent: "oklch(0.78 0.2 30)",
    preview: "Eye-catching colors that pop in any feed",
  },
  {
    id: "minimal",
    label: "Minimal",
    emoji: "⬜",
    description: "Clean whites, muted tones, airy feel",
    qualityBoost: 8,
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.05 200), oklch(0.45 0.04 220))",
    accent: "oklch(0.72 0.08 200)",
    preview: "Clean and editorial — perfect for brand deals",
  },
  {
    id: "dark",
    label: "Dark",
    emoji: "🌑",
    description: "High contrast, deep blacks, neon accents",
    qualityBoost: 11,
    gradient:
      "linear-gradient(135deg, oklch(0.18 0.06 295), oklch(0.12 0.04 280))",
    accent: "oklch(0.65 0.25 295)",
    preview: "Dramatic dark aesthetic with electric energy",
  },
];

const QUALITY_UPGRADE_COSTS = [0, 50, 100, 200, 400];

export default function CreatorStudio() {
  const {
    navigate,
    profile,
    posts,
    creatorCoins,
    setCreatorCoins,
    skills,
    setSkills,
    triggerSave,
  } = useApp();

  // --- Post Scheduler ---
  const [scheduleCaption, setScheduleCaption] = useState("");
  const [scheduleDelay, setScheduleDelay] = useState(DELAY_OPTIONS[0]);
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledPost[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-publish when timer reaches zero
  useEffect(() => {
    setScheduledQueue((prev) =>
      prev.map((p) =>
        !p.published && nowMs >= p.publishAt ? { ...p, published: true } : p,
      ),
    );
  }, [nowMs]);

  const handleSchedule = () => {
    if (!scheduleCaption.trim()) {
      toast.error("Write a caption first!");
      return;
    }
    const item: ScheduledPost = {
      id: `sq-${Date.now()}`,
      caption: scheduleCaption.trim(),
      delay: scheduleDelay.label,
      publishAt: Date.now() + scheduleDelay.ms,
      published: false,
    };
    setScheduledQueue((prev) => [item, ...prev].slice(0, 5));
    setScheduleCaption("");
    toast.success(`Scheduled for ${scheduleDelay.label}! ⏰`);
  };

  const cancelScheduled = (id: string) => {
    setScheduledQueue((prev) => prev.filter((p) => p.id !== id));
    toast("Post removed from queue");
  };

  // --- Engagement Prediction ---
  const avgWatchTime =
    posts.length > 0
      ? Math.round(
          posts.reduce((s, p) => s + (p.watchTime ?? 50), 0) / posts.length,
        )
      : 60;
  const contentQuality = Math.min(100, 40 + avgWatchTime * 0.5);
  const predictedReach = Math.round(
    profile.followers * 0.15 * (contentQuality / 100) * 1.2,
  );
  const predictedEngagement = Math.min(
    28,
    4 + (contentQuality / 100) * 12 + Math.random() * 2,
  ).toFixed(1);

  // --- Hashtag Analyzer ---
  const [hashtagInput, setHashtagInput] = useState("");
  const [analyzedTags, setAnalyzedTags] = useState<HashtagStat[]>([]);

  const analyzeHashtags = () => {
    const tags = hashtagInput
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`))
      .slice(0, 8);
    if (!tags.length) {
      toast.error("Enter at least one hashtag");
      return;
    }
    const results = tags.map((tag) => {
      const match = HASHTAG_POOL.find((h) => h.tag === tag);
      if (match) return match;
      const compRoll = Math.random();
      return {
        tag,
        reach: `${1 + Math.floor(Math.random() * 9)}M`,
        competition: (compRoll < 0.33
          ? "Low"
          : compRoll < 0.66
            ? "Medium"
            : "High") as "Low" | "Medium" | "High",
        trendingScore: 40 + Math.floor(Math.random() * 55),
      };
    });
    setAnalyzedTags(results);
  };

  const compColor = (c: "Low" | "Medium" | "High") =>
    c === "Low"
      ? "oklch(0.72 0.2 145)"
      : c === "Medium"
        ? "oklch(0.78 0.2 60)"
        : "oklch(0.72 0.2 25)";

  // --- AI Caption Generator ---
  const [captionKeywords, setCaptionKeywords] = useState("");
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);

  const generateCaptionsAction = () => {
    if (!captionKeywords.trim()) {
      toast.error("Enter 1–2 keywords first");
      return;
    }
    const captions = generateCaptions(profile.niche, captionKeywords);
    setGeneratedCaptions(captions);
    toast.success("Captions generated! ✨");
  };

  const copyCaption = useCallback((text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast.success("Copied to clipboard!");
  }, []);

  // --- A/B Experiment ---
  const [expA, setExpA] = useState("");
  const [expB, setExpB] = useState("");
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);

  const runExperiment = () => {
    if (!expA.trim() || !expB.trim()) {
      toast.error("Fill in both variant A and B");
      return;
    }
    const scoreFn = (text: string) =>
      text.length * 0.4 +
      (text.match(/#\w+/g)?.length ?? 0) * 12 +
      (text.includes("?") ? 18 : 0) +
      (text.match(/[🔥✨💡🚀💬]/gu)?.length ?? 0) * 8 +
      Math.random() * 40;
    const sA = scoreFn(expA);
    const sB = scoreFn(expB);
    const result: ExperimentResult = {
      id: `exp-${Date.now()}`,
      variantA: expA,
      variantB: expB,
      winnerIdx: sA >= sB ? 0 : 1,
      likesA: Math.floor(sA * 3.2),
      likesB: Math.floor(sB * 3.2),
      sharesA: Math.floor(sA * 0.8),
      sharesB: Math.floor(sB * 0.8),
      ranAt: Date.now(),
    };
    setExperiments((prev) => [result, ...prev].slice(0, 3));
    setExpA("");
    setExpB("");
    toast.success(
      `Variant ${result.winnerIdx === 0 ? "A" : "B"} wins the experiment! 🏆`,
    );
  };

  // --- Performance metrics from posts ---
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const avgEngagement =
    posts.length > 0
      ? (
          posts.reduce(
            (s, p) =>
              s +
              (p.likes + p.comments.length + p.shares) / Math.max(p.views, 1),
            0,
          ) / posts.length
        ).toFixed(1)
      : "0.0";
  const topPost = posts.reduce(
    (best, p) => (p.views > (best?.views ?? 0) ? p : best),
    posts[0],
  );
  const followerGrowthRate =
    posts.length > 0
      ? (
          (posts.reduce((s, p) => s + p.followersGained, 0) / posts.length) *
          10
        ).toFixed(0)
      : "0";

  function fmtCountdown(ms: number) {
    if (ms <= 0) return "Publishing...";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  }

  // --- Content Quality Upgrade ---
  const contentQualityLevel = skills.contentQuality;
  const maxQualityLevel = 5;
  const qualityUpgradeCost = QUALITY_UPGRADE_COSTS[contentQualityLevel] ?? 0;
  const isMaxQuality = contentQualityLevel >= maxQualityLevel;

  const handleQualityUpgrade = () => {
    if (isMaxQuality) return;
    if (creatorCoins < qualityUpgradeCost) {
      toast.error(`Need ${qualityUpgradeCost} 🪙 to upgrade!`);
      return;
    }
    setCreatorCoins((c) => c - qualityUpgradeCost);
    setSkills((s) => ({ ...s, contentQuality: s.contentQuality + 1 }));
    triggerSave();
    toast.success(
      `Content Quality upgraded to Level ${contentQualityLevel + 1}! ✨`,
    );
  };

  const qualityMultiplier = [
    "1.0x",
    "1.15x",
    "1.30x",
    "1.45x",
    "1.60x",
    "1.75x",
  ];

  // --- Video/Photo Editor Simulation ---
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [editorQualityBoost, setEditorQualityBoost] = useState(0);

  const handleApplyFilter = (filterId: string) => {
    const filter = EDIT_FILTERS.find((f) => f.id === filterId);
    if (!filter) return;
    setSelectedFilter(filterId);
    setEditedContent(null);
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
      setEditedContent(filter.preview);
      setEditorQualityBoost(filter.qualityBoost);
      toast.success(
        `Filter applied: ${filter.label} (+${filter.qualityBoost}% quality) 🎨`,
      );
    }, 1200);
  };

  const handlePublishEdited = () => {
    if (!editedContent) return;
    const filter = EDIT_FILTERS.find((f) => f.id === selectedFilter);
    toast.success(
      `Post published with ${filter?.label ?? ""} filter! Quality boosted. 🚀`,
    );
    setEditedContent(null);
    setSelectedFilter(null);
    setEditorQualityBoost(0);
  };

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
          data-ocid="studio.back.button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Creator Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            Plan, schedule & optimize
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            border: "1px solid oklch(0.6 0.2 80 / 0.4)",
            color: "oklch(0.8 0.18 80)",
          }}
          data-ocid="studio.coins.panel"
        >
          🪙 {creatorCoins.toLocaleString()}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card
            data-ocid="studio.performance.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  {
                    label: "Total Views",
                    value: totalViews.toLocaleString(),
                    color: "oklch(0.72 0.2 260)",
                  },
                  {
                    label: "Avg. Engagement",
                    value: `${avgEngagement}%`,
                    color: "oklch(0.72 0.2 145)",
                  },
                  {
                    label: "Posts",
                    value: posts.length.toString(),
                    color: "oklch(0.72 0.2 50)",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center rounded-xl py-3"
                    style={{ background: "oklch(0.16 0.02 280 / 0.6)" }}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              {/* Extra stats row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div
                  className="rounded-xl py-2 px-3 flex items-center gap-2"
                  style={{ background: "oklch(0.16 0.02 280 / 0.5)" }}
                >
                  <TrendingUp
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.72 0.2 145)" }}
                  />
                  <div>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "oklch(0.72 0.2 145)" }}
                    >
                      +{followerGrowthRate}/post
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg Follower Growth
                    </p>
                  </div>
                </div>
                <div
                  className="rounded-xl py-2 px-3 flex items-center gap-2"
                  style={{ background: "oklch(0.16 0.02 280 / 0.5)" }}
                >
                  <Star
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.78 0.2 80)" }}
                  />
                  <div>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "oklch(0.78 0.2 80)" }}
                    >
                      {totalLikes.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Total Likes
                    </p>
                  </div>
                </div>
              </div>
              {topPost && (
                <div
                  className="rounded-lg px-3 py-2 flex items-center gap-2"
                  style={{ background: "oklch(0.16 0.025 295 / 0.4)" }}
                >
                  <Zap
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.72 0.2 295)" }}
                  />
                  <p className="text-xs text-muted-foreground min-w-0 truncate">
                    Best post:{" "}
                    <span className="text-foreground font-medium">
                      &ldquo;{topPost.caption.slice(0, 40)}…&rdquo;
                    </span>{" "}
                    — {topPost.views.toLocaleString()} views
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Quality Upgrade */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card
            data-ocid="studio.quality.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: isMaxQuality
                ? "1px solid oklch(0.55 0.22 145 / 0.5)"
                : "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star
                  className="w-4 h-4"
                  style={{ color: "oklch(0.78 0.2 80)" }}
                />
                Content Quality Upgrade
                {isMaxQuality && (
                  <Badge
                    style={{
                      background: "oklch(0.55 0.22 145 / 0.3)",
                      color: "oklch(0.75 0.2 145)",
                      fontSize: "10px",
                    }}
                  >
                    MAX
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stars display */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: maxQualityLevel }, (_, i) => (
                    <motion.div
                      key={`star-slot-${i + 1}`}
                      animate={{
                        scale: i < contentQualityLevel ? [1, 1.3, 1] : 1,
                      }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <Star
                        className="w-7 h-7"
                        style={{
                          fill:
                            i < contentQualityLevel
                              ? "oklch(0.78 0.2 80)"
                              : "transparent",
                          color:
                            i < contentQualityLevel
                              ? "oklch(0.78 0.2 80)"
                              : "oklch(0.35 0.03 280)",
                          filter:
                            i < contentQualityLevel
                              ? "drop-shadow(0 0 6px oklch(0.65 0.2 80 / 0.6))"
                              : "none",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.78 0.2 80)" }}
                  >
                    Level {contentQualityLevel}/{maxQualityLevel}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Engagement multiplier:{" "}
                    {qualityMultiplier[contentQualityLevel]}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: "oklch(0.18 0.02 280 / 0.6)" }}
              >
                <motion.div
                  animate={{
                    width: `${(contentQualityLevel / maxQualityLevel) * 100}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.65 0.22 60), oklch(0.72 0.2 80))",
                    boxShadow: "0 0 10px oklch(0.65 0.2 80 / 0.4)",
                  }}
                />
              </div>

              {/* Effect description */}
              <div
                className="rounded-lg px-3 py-2.5"
                style={{ background: "oklch(0.16 0.03 80 / 0.2)" }}
              >
                <p className="text-xs" style={{ color: "oklch(0.75 0.18 80)" }}>
                  <Zap className="w-3 h-3 inline mr-1" />
                  {[
                    "Baseline — standard reach and engagement",
                    "+15% post reach across all platforms",
                    "+30% post reach + better algorithm placement",
                    "+45% reach + priority explore placement",
                    "+60% reach + viral boost chance multiplied",
                  ][contentQualityLevel - 1] ??
                    "Upgrade to unlock reach bonuses"}
                </p>
              </div>

              {/* Upgrade or maxed */}
              {!isMaxQuality ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Next: Level {contentQualityLevel + 1} —{" "}
                      {qualityUpgradeCost} 🪙
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Balance: {creatorCoins.toLocaleString()} 🪙
                    </p>
                  </div>
                  <Button
                    data-ocid="studio.quality.primary_button"
                    size="sm"
                    className="text-white border-none"
                    disabled={creatorCoins < qualityUpgradeCost}
                    style={{
                      background:
                        creatorCoins >= qualityUpgradeCost
                          ? "linear-gradient(135deg, oklch(0.7 0.2 75), oklch(0.65 0.22 55))"
                          : "oklch(0.25 0.02 280)",
                      boxShadow:
                        creatorCoins >= qualityUpgradeCost
                          ? "0 0 15px oklch(0.65 0.2 75 / 0.35)"
                          : "none",
                    }}
                    onClick={handleQualityUpgrade}
                  >
                    Upgrade — {qualityUpgradeCost} 🪙
                  </Button>
                </div>
              ) : (
                <p
                  className="text-center text-sm font-semibold"
                  style={{ color: "oklch(0.72 0.2 145)" }}
                >
                  ✅ Maximum content quality reached!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Video/Photo Editor Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card
            data-ocid="studio.editor.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clapperboard
                  className="w-4 h-4"
                  style={{ color: "oklch(0.72 0.2 295)" }}
                />
                Content Editor
                <span className="text-[10px] text-muted-foreground font-normal ml-auto">
                  Pick a filter → apply → publish
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock frame preview */}
              <div
                className="relative rounded-xl overflow-hidden h-32 flex items-center justify-center"
                style={{
                  background: selectedFilter
                    ? EDIT_FILTERS.find((f) => f.id === selectedFilter)
                        ?.gradient || "oklch(0.15 0.02 280)"
                    : "oklch(0.15 0.02 280)",
                  border: "1px solid oklch(0.25 0.025 280 / 0.5)",
                  transition: "background 0.5s ease",
                }}
              >
                {isRendering ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto mb-2"
                      style={{ borderColor: "oklch(0.65 0.2 295)" }}
                    />
                    <p className="text-xs text-muted-foreground">Rendering…</p>
                  </div>
                ) : editedContent ? (
                  <div className="text-center px-4">
                    <p className="text-2xl mb-2">
                      {EDIT_FILTERS.find((f) => f.id === selectedFilter)?.emoji}
                    </p>
                    <p className="text-xs font-medium text-white/90">
                      {editedContent}
                    </p>
                    <p
                      className="text-[10px] mt-1"
                      style={{
                        color: EDIT_FILTERS.find((f) => f.id === selectedFilter)
                          ?.accent,
                      }}
                    >
                      +{editorQualityBoost}% quality score boost
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Clapperboard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Select a filter below
                    </p>
                  </div>
                )}
              </div>

              {/* Filter selection */}
              <div className="grid grid-cols-2 gap-2">
                {EDIT_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    data-ocid={`studio.editor.${filter.id}.toggle`}
                    onClick={() => handleApplyFilter(filter.id)}
                    disabled={isRendering}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background:
                        selectedFilter === filter.id
                          ? `${filter.gradient.replace("135deg,", "135deg,")}`
                          : "oklch(0.16 0.02 280 / 0.6)",
                      border:
                        selectedFilter === filter.id
                          ? `1px solid ${filter.accent}66`
                          : "1px solid oklch(0.25 0.025 280 / 0.4)",
                      boxShadow:
                        selectedFilter === filter.id
                          ? `0 0 15px ${filter.accent}33`
                          : "none",
                    }}
                  >
                    <span className="text-xl flex-shrink-0">
                      {filter.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {filter.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {filter.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Publish edited button */}
              <AnimatePresence>
                {editedContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                  >
                    <Button
                      data-ocid="studio.editor.publish.primary_button"
                      className="w-full text-white border-none"
                      style={{
                        background: EDIT_FILTERS.find(
                          (f) => f.id === selectedFilter,
                        )?.gradient,
                        boxShadow: `0 0 20px ${EDIT_FILTERS.find((f) => f.id === selectedFilter)?.accent}44`,
                      }}
                      onClick={handlePublishEdited}
                    >
                      🚀 Publish with{" "}
                      {EDIT_FILTERS.find((f) => f.id === selectedFilter)?.label}{" "}
                      Filter
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Post Scheduler */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <Card
            data-ocid="studio.scheduler.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Post Scheduler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                data-ocid="studio.scheduler.textarea"
                value={scheduleCaption}
                onChange={(e) => setScheduleCaption(e.target.value)}
                placeholder="Write your post caption…"
                rows={3}
                className="w-full text-sm rounded-xl px-3 py-2.5 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                style={{
                  background: "oklch(0.17 0.02 280 / 0.7)",
                  border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                }}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    data-ocid="studio.scheduler.select"
                    value={scheduleDelay.label}
                    onChange={(e) =>
                      setScheduleDelay(
                        DELAY_OPTIONS.find((d) => d.label === e.target.value) ??
                          DELAY_OPTIONS[0],
                      )
                    }
                    className="w-full text-sm rounded-xl px-3 py-2 focus:outline-none text-foreground"
                    style={{
                      background: "oklch(0.17 0.02 280 / 0.7)",
                      border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                    }}
                  >
                    {DELAY_OPTIONS.map((d) => (
                      <option key={d.label} value={d.label}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  data-ocid="studio.scheduler.submit_button"
                  size="sm"
                  onClick={handleSchedule}
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 240))",
                  }}
                  className="text-white border-none"
                >
                  Schedule
                </Button>
              </div>
              {/* Queue */}
              {scheduledQueue.length > 0 && (
                <div className="space-y-2 pt-1">
                  {scheduledQueue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 rounded-lg px-3 py-2"
                      style={{
                        background: item.published
                          ? "oklch(0.55 0.22 145 / 0.12)"
                          : "oklch(0.16 0.02 280 / 0.5)",
                        border: item.published
                          ? "1px solid oklch(0.55 0.22 145 / 0.3)"
                          : "1px solid oklch(0.25 0.025 280 / 0.3)",
                      }}
                    >
                      <span className="text-base mt-0.5">
                        {item.published ? "✅" : "⏳"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">
                          {item.caption}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.published
                            ? "Published!"
                            : `Posts in ${fmtCountdown(item.publishAt - nowMs)}`}
                        </p>
                      </div>
                      {!item.published && (
                        <button
                          type="button"
                          onClick={() => cancelScheduled(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors text-xs ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement Prediction */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            data-ocid="studio.prediction.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap
                  className="w-4 h-4"
                  style={{ color: "oklch(0.78 0.2 50)" }}
                />
                Engagement Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Predicted Reach",
                    value: predictedReach.toLocaleString(),
                    icon: "👁️",
                    color: "oklch(0.72 0.2 260)",
                  },
                  {
                    label: "Engagement Rate",
                    value: `${predictedEngagement}%`,
                    icon: "🔥",
                    color: "oklch(0.72 0.2 25)",
                  },
                  {
                    label: "Content Score",
                    value: `${Math.round(contentQuality)}/100`,
                    icon: "✨",
                    color: "oklch(0.72 0.2 145)",
                  },
                  {
                    label: "Avg Watch Time",
                    value: `${avgWatchTime}%`,
                    icon: "⏱️",
                    color: "oklch(0.72 0.2 295)",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: "oklch(0.16 0.02 280 / 0.6)" }}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: m.color }}
                      >
                        {m.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hashtag Analyzer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card
            data-ocid="studio.hashtags.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-teal-400" />
                Hashtag Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  data-ocid="studio.hashtags.input"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="#viral, #tech, #creator…"
                  className="flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  style={{
                    background: "oklch(0.17 0.02 280 / 0.7)",
                    border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && analyzeHashtags()}
                />
                <Button
                  data-ocid="studio.hashtags.submit_button"
                  size="sm"
                  onClick={analyzeHashtags}
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.2 200), oklch(0.5 0.18 180))",
                  }}
                  className="text-white border-none"
                >
                  Analyze
                </Button>
              </div>
              {analyzedTags.length > 0 && (
                <div className="space-y-2">
                  {analyzedTags.map((tag) => (
                    <div
                      key={tag.tag}
                      className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: "oklch(0.16 0.02 280 / 0.5)" }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: "oklch(0.72 0.2 260)" }}
                      >
                        {tag.tag}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex-1">
                        Reach: {tag.reach}
                      </span>
                      <Badge
                        style={{
                          background: `${compColor(tag.competition)}22`,
                          color: compColor(tag.competition),
                          border: `1px solid ${compColor(tag.competition)}44`,
                          fontSize: "10px",
                        }}
                      >
                        {tag.competition}
                      </Badge>
                      <span
                        className="text-xs font-bold ml-1"
                        style={{ color: "oklch(0.78 0.2 50)" }}
                      >
                        {tag.trendingScore}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Caption Generator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            data-ocid="studio.captions.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: "oklch(0.75 0.2 295)" }}
                />
                AI Caption Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  data-ocid="studio.captions.input"
                  value={captionKeywords}
                  onChange={(e) => setCaptionKeywords(e.target.value)}
                  placeholder={`e.g. "morning routine", "${profile.niche} tips"…`}
                  className="flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  style={{
                    background: "oklch(0.17 0.02 280 / 0.7)",
                    border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && generateCaptionsAction()
                  }
                />
                <Button
                  data-ocid="studio.captions.submit_button"
                  size="sm"
                  onClick={generateCaptionsAction}
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.5 0.22 270))",
                  }}
                  className="text-white border-none"
                >
                  Generate
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Niche: {profile.niche}
              </p>
              {generatedCaptions.length > 0 && (
                <div className="space-y-2">
                  {generatedCaptions.map((caption) => (
                    <div
                      key={caption.slice(0, 20)}
                      className="rounded-xl p-3 flex gap-2"
                      style={{ background: "oklch(0.16 0.02 280 / 0.5)" }}
                    >
                      <Lightbulb
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: "oklch(0.75 0.2 295)" }}
                      />
                      <p className="text-xs text-foreground flex-1 leading-relaxed">
                        {caption}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyCaption(caption)}
                        className="text-muted-foreground hover:text-foreground transition-colors text-xs flex-shrink-0 ml-1"
                        aria-label="Copy caption"
                      >
                        📋
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* A/B Experiment Lab */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card
            data-ocid="studio.experiment.panel"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.4)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical
                  className="w-4 h-4"
                  style={{ color: "oklch(0.72 0.2 145)" }}
                />
                A/B Experiment Lab
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Variant A
                  </p>
                  <textarea
                    data-ocid="studio.experiment.textarea"
                    value={expA}
                    onChange={(e) => setExpA(e.target.value)}
                    placeholder="Caption or hashtag set A…"
                    rows={3}
                    className="w-full text-xs rounded-xl px-2.5 py-2 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                    style={{
                      background: "oklch(0.17 0.02 280 / 0.7)",
                      border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                    }}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Variant B
                  </p>
                  <textarea
                    value={expB}
                    onChange={(e) => setExpB(e.target.value)}
                    placeholder="Caption or hashtag set B…"
                    rows={3}
                    className="w-full text-xs rounded-xl px-2.5 py-2 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                    style={{
                      background: "oklch(0.17 0.02 280 / 0.7)",
                      border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                    }}
                  />
                </div>
              </div>
              <Button
                data-ocid="studio.experiment.submit_button"
                size="sm"
                className="w-full text-white border-none"
                onClick={runExperiment}
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.22 145), oklch(0.55 0.2 160))",
                }}
              >
                Run Experiment
              </Button>
              {experiments.length > 0 && (
                <div className="space-y-2 pt-1">
                  {experiments.map((exp) => (
                    <div
                      key={exp.id}
                      className="rounded-xl p-3 space-y-2"
                      style={{
                        background: "oklch(0.16 0.02 280 / 0.5)",
                        border: "1px solid oklch(0.25 0.025 280 / 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">🏆</span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.72 0.2 145)" }}
                        >
                          Variant {exp.winnerIdx === 0 ? "A" : "B"} wins!
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        {(
                          [
                            {
                              label: "A",
                              likes: exp.likesA,
                              shares: exp.sharesA,
                            },
                            {
                              label: "B",
                              likes: exp.likesB,
                              shares: exp.sharesB,
                            },
                          ] as const
                        ).map((v, vi) => (
                          <div
                            key={v.label}
                            className="rounded-lg py-2"
                            style={{
                              background:
                                vi === exp.winnerIdx
                                  ? "oklch(0.55 0.22 145 / 0.15)"
                                  : "oklch(0.18 0.02 280 / 0.4)",
                              border:
                                vi === exp.winnerIdx
                                  ? "1px solid oklch(0.55 0.22 145 / 0.4)"
                                  : "none",
                            }}
                          >
                            <p className="text-[10px] text-muted-foreground">
                              Variant {v.label}
                            </p>
                            <p
                              className="text-xs font-bold"
                              style={{
                                color:
                                  vi === exp.winnerIdx
                                    ? "oklch(0.72 0.2 145)"
                                    : "oklch(0.6 0.05 280)",
                              }}
                            >
                              ❤️ {v.likes} · 🔄 {v.shares}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
