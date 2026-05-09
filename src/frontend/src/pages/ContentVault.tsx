import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Rocket, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export default function ContentVault() {
  const {
    navigate,
    posts,
    savedPosts,
    creatorCoins,
    setCreatorCoins,
    addNotification,
  } = useApp();
  const [boostedIds, setBoostedIds] = useState<Set<string>>(new Set());
  const [_boostTimers, setBoostTimers] = useState<Record<string, number>>({});

  const vaultPosts = posts
    .filter((p) => savedPosts.has(p.id) || p.savedByUser)
    .sort((a, b) => b.engagementScore - a.engagementScore);

  const totalSaves = vaultPosts.length;
  const avgEngagement = vaultPosts.length
    ? Math.round(
        vaultPosts.reduce(
          (s, p) =>
            s +
            ((p.likes + p.shares * 3 + p.saves * 2) / Math.max(p.views, 1)) *
              100,
          0,
        ) / vaultPosts.length,
      )
    : 0;

  function handleBoost(postId: string) {
    if (creatorCoins < 200) {
      toast.error("Not enough coins! You need 200 coins to boost.");
      return;
    }
    if (boostedIds.has(postId)) {
      toast.info("This post is already boosted!");
      return;
    }
    setCreatorCoins((c) => c - 200);
    setBoostedIds((prev) => new Set([...prev, postId]));
    const expiresAt = Date.now() + 3600000;
    setBoostTimers((prev) => ({ ...prev, [postId]: expiresAt }));
    addNotification({
      icon: "🚀",
      message:
        "Content Vault boost active! Post engagement doubled for 1 hour.",
      type: "boost",
    });
    toast.success("🚀 Boost activated! Engagement doubled for 1 hour.");
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
          onClick={() => navigate("hub")}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="content-vault.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Content Vault</h1>
          <p className="text-xs text-muted-foreground">Your top saved posts</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            border: "1px solid oklch(0.6 0.2 80 / 0.4)",
            color: "oklch(0.8 0.18 80)",
          }}
        >
          🪙 {creatorCoins.toLocaleString()}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Bookmark className="w-4 h-4" />,
              label: "Saved Posts",
              value: totalSaves,
              color: "oklch(0.72 0.2 260)",
            },
            {
              icon: <TrendingUp className="w-4 h-4" />,
              label: "Avg Engagement",
              value: `${avgEngagement}%`,
              color: "oklch(0.72 0.2 145)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.13 0.016 280 / 0.95)",
                border: "1px solid oklch(0.22 0.025 280 / 0.5)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-1"
                style={{ color: stat.color }}
              >
                {stat.icon}
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Vault Posts */}
        {vaultPosts.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.22 0.025 280 / 0.5)",
            }}
            data-ocid="content-vault.empty_state"
          >
            <p className="text-4xl mb-3">🔒</p>
            <p className="text-base font-semibold text-foreground mb-1">
              Vault is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Save posts from your feed to add them to your vault.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vaultPosts.map((post, idx) => {
              const isBoosted = boostedIds.has(post.id);
              const engRate =
                post.views > 0
                  ? (
                      ((post.likes + post.shares + post.saves) / post.views) *
                      100
                    ).toFixed(1)
                  : "0.0";
              return (
                <div
                  key={post.id}
                  data-ocid={`content-vault.item.${idx + 1}`}
                  className="rounded-2xl p-4 flex gap-3"
                  style={{
                    background: isBoosted
                      ? "oklch(0.14 0.03 145 / 0.5)"
                      : "oklch(0.13 0.016 280 / 0.95)",
                    border: `1px solid ${isBoosted ? "oklch(0.45 0.15 145 / 0.4)" : "oklch(0.22 0.025 280 / 0.5)"}`,
                  }}
                >
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 leading-snug mb-1">
                      {post.caption}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>❤️ {post.likes.toLocaleString()}</span>
                      <span>👁️ {post.views.toLocaleString()}</span>
                      <span style={{ color: "oklch(0.72 0.2 145)" }}>
                        {engRate}% eng
                      </span>
                    </div>
                    {isBoosted && (
                      <div
                        className="mt-1.5 text-xs font-semibold"
                        style={{ color: "oklch(0.72 0.22 145)" }}
                      >
                        🚀 Boosted — 2x engagement active
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBoost(post.id)}
                    disabled={isBoosted || creatorCoins < 200}
                    className="flex-shrink-0 self-center text-xs h-8 gap-1"
                    style={
                      isBoosted
                        ? {
                            background: "oklch(0.28 0.05 145)",
                            color: "oklch(0.72 0.22 145)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.5 0.28 300))",
                            color: "white",
                          }
                    }
                    data-ocid={`content-vault.boost.button.${idx + 1}`}
                  >
                    <Rocket className="w-3 h-3" />
                    {isBoosted ? "Live" : "Boost"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Boost costs 200 coins · doubles engagement for 1 hour
        </p>
      </div>
    </div>
  );
}
