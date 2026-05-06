import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { AI_CREATORS } from "../utils/aiInfluencers";

const HALL_AI = AI_CREATORS.slice(0, 10).map((c, i) => ({
  username: c.username,
  avatar: c.avatar,
  score: Math.floor(Math.random() * 500000) + 100000 + i * 12000,
  followers: c.followerCount,
  viralPosts: Math.floor(Math.random() * 50) + 10,
}));

export default function HallOfFame() {
  const { navigate, profile, legacyScore } = useApp();

  const playerEntry = {
    username: profile.username,
    avatar: profile.avatar,
    score:
      legacyScore.totalEngagement +
      legacyScore.peakFollowers * 10 +
      legacyScore.viralPosts * 5000,
    followers: legacyScore.peakFollowers,
    viralPosts: legacyScore.viralPosts,
  };

  const allEntries = [...HALL_AI, playerEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
      data-ocid="hall_of_fame.page"
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
          data-ocid="hall_of_fame.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            🏆 Hall of Fame
          </h1>
          <p className="text-xs text-muted-foreground">All-time top creators</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Player Legacy Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 80 / 0.4), oklch(0.15 0.03 80 / 0.2))",
            border: "1px solid oklch(0.7 0.18 80 / 0.35)",
          }}
          data-ocid="hall_of_fame.legacy_score.card"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🌟</span>
            <div>
              <p
                className="text-lg font-black"
                style={{ color: "oklch(0.82 0.2 80)" }}
              >
                Your Legacy Score
              </p>
              <p className="text-xs text-muted-foreground">
                Persists across all playthroughs
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Total Engagement",
                value: legacyScore.totalEngagement.toLocaleString(),
                icon: "❤️",
              },
              {
                label: "Peak Followers",
                value: legacyScore.peakFollowers.toLocaleString(),
                icon: "👥",
              },
              {
                label: "Viral Posts",
                value: legacyScore.viralPosts.toLocaleString(),
                icon: "🔥",
              },
              {
                label: "Games Played",
                value: legacyScore.gamesPlayed.toLocaleString(),
                icon: "🎮",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{ background: "oklch(0.13 0.016 280 / 0.8)" }}
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-base font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            All-Time Top Creators
          </h2>
          <div className="space-y-2">
            {allEntries.map((entry, idx) => {
              const isPlayer = entry.username === profile.username;
              const medal =
                idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
              return (
                <motion.div
                  key={`${entry.username}-${idx}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: isPlayer
                      ? "oklch(0.18 0.04 80 / 0.25)"
                      : "oklch(0.13 0.016 280 / 0.95)",
                    border: isPlayer
                      ? "1px solid oklch(0.7 0.18 80 / 0.4)"
                      : "1px solid oklch(0.22 0.025 280 / 0.5)",
                  }}
                  data-ocid={`hall_of_fame.item.${idx + 1}`}
                >
                  <div className="w-8 text-center text-lg font-black">
                    {medal || (
                      <span className="text-sm text-muted-foreground">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="flex-1">
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: isPlayer
                          ? "oklch(0.82 0.2 80)"
                          : "oklch(0.92 0.01 260)",
                      }}
                    >
                      {entry.username}{" "}
                      {isPlayer && (
                        <span className="text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.followers.toLocaleString()} peak followers •{" "}
                      {entry.viralPosts} viral posts
                    </div>
                  </div>
                  <div
                    className="text-sm font-black"
                    style={{ color: "oklch(0.78 0.18 80)" }}
                  >
                    <Trophy className="w-3.5 h-3.5 inline mr-1" />
                    {entry.score.toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
