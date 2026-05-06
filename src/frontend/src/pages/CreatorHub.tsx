import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Coins, RefreshCw, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const HUB_FEATURES = [
  {
    id: "creator-energy",
    emoji: "⚡",
    label: "Creator Energy",
    description: "Track your grind & mental stamina",
    page: "creator-energy",
  },
  {
    id: "analytics",
    emoji: "📊",
    label: "Analytics",
    description: "Track your growth & performance",
    page: "analytics",
  },
  {
    id: "monetization",
    emoji: "💰",
    label: "Monetization",
    description: "Earnings, ads & sponsorships",
    page: "monetization",
  },
  {
    id: "leaderboard",
    emoji: "🏆",
    label: "Leaderboard",
    description: "See where you rank",
    page: "leaderboard",
  },
  {
    id: "houses",
    emoji: "🏠",
    label: "Creator Houses",
    description: "Join or create your team",
    page: "houses",
  },
  {
    id: "studio",
    emoji: "🎥",
    label: "Creator Studio",
    description: "Schedule, analyze & plan",
    page: "creator-studio",
  },
  {
    id: "merch",
    emoji: "🛒",
    label: "Merch Store",
    description: "Sell products to your fans",
    page: "merch-store",
  },
  {
    id: "trending",
    emoji: "🔥",
    label: "Trending",
    description: "Discover viral content",
    page: "trending",
  },
  {
    id: "challenges",
    emoji: "🎯",
    label: "Challenges",
    description: "Weekly creator goals",
    page: "challenges",
  },
  {
    id: "skills",
    emoji: "⚡",
    label: "Skill Upgrades",
    description: "Boost your creator abilities",
    page: "skills",
  },
  {
    id: "agency",
    emoji: "🏢",
    label: "Agency",
    description: "Hire agents for passive income",
    page: "agency",
  },
  {
    id: "investment",
    emoji: "📈",
    label: "Investment",
    description: "Grow your coins passively",
    page: "investment",
  },
  {
    id: "streaks",
    emoji: "🔥",
    label: "Streaks & Rewards",
    description: "Daily rewards & posting streaks",
    page: "streaks",
  },
  {
    id: "sponsor-bidding",
    emoji: "🏆",
    label: "Sponsor Bidding Wars",
    description: "Brands compete to sponsor you",
    page: "sponsor-bidding",
  },
  {
    id: "roulette",
    emoji: "🎰",
    label: "Viral Roulette",
    description: "Spin to go viral or flop",
    page: "viral-roulette",
  },
  {
    id: "hall-of-fame",
    emoji: "🏆",
    label: "Hall of Fame",
    description: "Your all-time legacy & records",
    page: "hall-of-fame",
  },
  {
    id: "black-market",
    emoji: "⚫",
    label: "Black Market",
    description: "⚠️ Risky underground deals",
    page: "black-market",
  },
  {
    id: "fan-army-wars",
    emoji: "⚔️",
    label: "Fan Army Wars",
    description: "Battle rival fan armies",
    page: "fan-army-wars",
  },
  {
    id: "trend-battles",
    emoji: "📊",
    label: "Trend Battles",
    description: "Hashtag wars & viral showdowns",
    page: "trend-battles",
  },
  {
    id: "algo-hack",
    emoji: "🔓",
    label: "Algorithm Hacks",
    description: "Leaked intel & reach multipliers",
    page: "algo-hack",
  },
];

const GRADIENT_MAP: Record<string, string> = {
  "creator-energy":
    "linear-gradient(135deg, oklch(0.68 0.22 145), oklch(0.6 0.2 170))",
  analytics:
    "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.55 0.2 230))",
  monetization:
    "linear-gradient(135deg, oklch(0.65 0.2 140), oklch(0.6 0.15 160))",
  leaderboard:
    "linear-gradient(135deg, oklch(0.7 0.18 80), oklch(0.65 0.2 60))",
  houses: "linear-gradient(135deg, oklch(0.6 0.2 20), oklch(0.6 0.18 350))",
  studio: "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 270))",
  merch: "linear-gradient(135deg, oklch(0.6 0.18 340), oklch(0.6 0.2 320))",
  trending: "linear-gradient(135deg, oklch(0.65 0.2 30), oklch(0.6 0.22 15))",
  challenges:
    "linear-gradient(135deg, oklch(0.55 0.2 200), oklch(0.55 0.18 180))",
  skills: "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 230))",
  agency: "linear-gradient(135deg, oklch(0.55 0.15 220), oklch(0.5 0.12 200))",
  investment:
    "linear-gradient(135deg, oklch(0.62 0.22 145), oklch(0.58 0.18 160))",
  streaks: "linear-gradient(135deg, oklch(0.68 0.22 50), oklch(0.62 0.2 30))",
  "sponsor-bidding":
    "linear-gradient(135deg, oklch(0.65 0.2 60), oklch(0.6 0.22 40))",
  roulette:
    "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.6 0.22 320))",
  "hall-of-fame":
    "linear-gradient(135deg, oklch(0.7 0.18 80), oklch(0.65 0.2 60))",
  "black-market":
    "linear-gradient(135deg, oklch(0.3 0.05 280), oklch(0.25 0.04 260))",
  "fan-army-wars":
    "linear-gradient(135deg, oklch(0.6 0.22 25), oklch(0.55 0.2 350))",
  "trend-battles":
    "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.6 0.2 295))",
  "algo-hack":
    "linear-gradient(135deg, oklch(0.5 0.22 295), oklch(0.55 0.25 260))",
};

export default function CreatorHub() {
  const {
    navigate,
    creatorCoins,
    lastSaved,
    isSaving,
    triggerSave,
    newGame,
    loginStreak,
    postingStreak,
  } = useApp();
  const [newGameOpen, setNewGameOpen] = useState(false);

  function timeAgo(ts: number | null): string {
    if (!ts) return "Never";
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

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
          onClick={() => navigate("profile")}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="hub.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Creator Hub
          </h1>
          <p className="text-xs text-muted-foreground">Your control center</p>
        </div>
        {/* Creator Coins */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 80 / 0.25), oklch(0.5 0.15 70 / 0.15))",
            border: "1px solid oklch(0.6 0.2 80 / 0.4)",
            color: "oklch(0.8 0.18 80)",
          }}
          data-ocid="hub.coins.panel"
        >
          <Coins className="w-4 h-4" />
          {creatorCoins.toLocaleString()}
        </div>
      </div>

      {/* Streak chips */}
      <div className="px-4 pt-2 pb-1 flex gap-2">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.18 0.04 50 / 0.3)",
            border: "1px solid oklch(0.65 0.2 50 / 0.3)",
            color: "oklch(0.78 0.2 50)",
          }}
        >
          🔥 {loginStreak}d login
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.18 0.04 295 / 0.3)",
            border: "1px solid oklch(0.55 0.2 295 / 0.3)",
            color: "oklch(0.72 0.2 295)",
          }}
        >
          📸 {postingStreak} posts
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {HUB_FEATURES.map((feature, i) => (
            <motion.button
              key={feature.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => navigate(feature.page)}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "oklch(0.13 0.016 280 / 0.95)",
                border: "1px solid oklch(0.22 0.025 280 / 0.5)",
              }}
              data-ocid={`hub.${feature.id}.button`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: GRADIENT_MAP[feature.id] || "oklch(0.4 0.1 280)",
                }}
              >
                {feature.emoji}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {feature.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {feature.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Save + New Game section */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">
                Game Save
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isSaving ? "Saving..." : `Last saved: ${timeAgo(lastSaved)}`}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => triggerSave()}
              disabled={isSaving}
              size="sm"
              className="flex-1 gap-1.5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 240))",
              }}
              data-ocid="hub.save.button"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save Game"}
            </Button>
            <Button
              onClick={() => setNewGameOpen(true)}
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
              data-ocid="hub.new_game.button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Game
            </Button>
          </div>
        </div>

        {/* Coming Soon */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.12 0.02 280)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
          data-ocid="hub.coming_soon.panel"
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "oklch(0.55 0.08 260)" }}
          >
            ⏳ Coming Soon
          </h3>
          <div className="space-y-2">
            {[
              {
                emoji: "🌟",
                label: "Celebrity Mode",
                desc: "Unlock at 1M followers",
              },
              {
                emoji: "🏆",
                label: "Legacy Score",
                desc: "All-time impact tracker",
              },
              {
                emoji: "🎖️",
                label: "Hall of Fame",
                desc: "Top creators across all time",
              },
              {
                emoji: "🕶️",
                label: "Black Market",
                desc: "Risky underground deals",
              },
              {
                emoji: "⚔️",
                label: "Fan Army Wars",
                desc: "Your fans vs rivals",
              },
              {
                emoji: "📡",
                label: "Real-Time Trend Battles",
                desc: "Hashtag wars & viral showdowns",
              },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 py-1.5">
                <span className="text-lg w-7 text-center flex-shrink-0">
                  {f.emoji}
                </span>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {f.label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.38 0.03 280)" }}
                  >
                    {f.desc}
                  </p>
                </div>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.18 0.025 280)",
                    color: "oklch(0.45 0.04 280)",
                  }}
                >
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()}.
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors ml-1"
          >
            Built with ❤ using caffeine.ai
          </a>
        </p>
      </div>

      {/* New Game Confirmation */}
      <Dialog open={newGameOpen} onOpenChange={setNewGameOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.016 280)",
            border: "1px solid oklch(0.25 0.025 280 / 0.5)",
          }}
          data-ocid="hub.new_game.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Start New Game?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete ALL your progress — followers, coins,
              posts, earnings, and achievements. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setNewGameOpen(false)}
              data-ocid="hub.new_game.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setNewGameOpen(false);
                newGame();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="hub.new_game.confirm_button"
            >
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
