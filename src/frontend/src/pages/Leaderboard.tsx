import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { AI_CREATORS } from "../utils/aiInfluencers";
import { generateUser } from "../utils/simulatedUsers";

type SortKey = "followers" | "score";

const SKEL_IDS = [
  "sk1",
  "sk2",
  "sk3",
  "sk4",
  "sk5",
  "sk6",
  "sk7",
  "sk8",
  "sk9",
  "sk10",
];

export default function Leaderboard() {
  const { profile, navigate } = useApp();
  const [sortBy, setSortBy] = useState<SortKey>("followers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const simUsers = Array.from({ length: 30 }, (_, i) => generateUser(i + 1));
  const playerEntry = {
    id: "me",
    displayName: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    followerCount: profile.followers,
    engagementScore: profile.xp * 2,
    creatorLevel: profile.level,
    isPlayer: true,
  };

  const aiEntries = AI_CREATORS.map((c) => ({
    id: c.id,
    displayName: c.name,
    username: c.username,
    avatar: c.avatar,
    followerCount: c.followerCount,
    engagementScore: c.engagementScore,
    creatorLevel: c.creatorLevel,
    isPlayer: false,
  }));

  const allEntries = [
    ...simUsers.map((u) => ({ ...u, isPlayer: false })),
    ...aiEntries,
    playerEntry,
  ];
  const sorted = [...allEntries].sort((a, b) =>
    sortBy === "followers"
      ? b.followerCount - a.followerCount
      : b.engagementScore - a.engagementScore,
  );
  const playerRank = sorted.findIndex((u) => u.isPlayer) + 1;

  const rankEmoji = (rank: number) => {
    if (rank === 1) return "\ud83e\udd47";
    if (rank === 2) return "\ud83e\udd48";
    if (rank === 3) return "\ud83e\udd49";
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Creator Leaderboard</h1>
            <p className="text-xs text-muted-foreground">
              Top 50 creators by{" "}
              {sortBy === "followers" ? "followers" : "engagement"}
            </p>
          </div>
        </div>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.3 0.025 280 / 0.4)" }}
        >
          <button
            type="button"
            data-ocid="leaderboard.sort.toggle"
            onClick={() => setSortBy("followers")}
            className="px-3 py-1.5 text-xs transition-colors flex items-center gap-1"
            style={{
              background:
                sortBy === "followers"
                  ? "oklch(0.55 0.22 295 / 0.3)"
                  : "transparent",
              color:
                sortBy === "followers"
                  ? "oklch(0.75 0.22 295)"
                  : "oklch(0.55 0.02 270)",
            }}
          >
            <Users className="w-3.5 h-3.5" /> Followers
          </button>
          <button
            type="button"
            data-ocid="leaderboard.engagement.toggle"
            onClick={() => setSortBy("score")}
            className="px-3 py-1.5 text-xs transition-colors flex items-center gap-1"
            style={{
              background:
                sortBy === "score"
                  ? "oklch(0.55 0.22 295 / 0.3)"
                  : "transparent",
              color:
                sortBy === "score"
                  ? "oklch(0.75 0.22 295)"
                  : "oklch(0.55 0.02 270)",
            }}
          >
            <Zap className="w-3.5 h-3.5" /> Engagement
          </button>
        </div>
      </div>

      {!loading && (
        <div
          className="glass-card p-4 flex items-center gap-3"
          style={{ border: "1px solid oklch(0.6 0.22 295 / 0.3)" }}
        >
          <span
            className="text-2xl font-bold w-8 text-center"
            style={{ color: "oklch(0.75 0.22 295)" }}
          >
            #{playerRank}
          </span>
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {profile.name}{" "}
              <span className="text-xs text-muted-foreground">(You)</span>
            </p>
            <p className="text-xs text-muted-foreground">{profile.username}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">
              {profile.followers.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">followers</p>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {loading
          ? SKEL_IDS.map((skelId) => (
              <div
                key={skelId}
                data-ocid="leaderboard.loading_state"
                className="flex items-center gap-3 p-4"
                style={{ borderBottom: "1px solid oklch(0.2 0.02 280 / 0.4)" }}
              >
                <Skeleton className="w-6 h-4" />
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          : sorted.map((user, i) => (
              <button
                key={user.id}
                type="button"
                data-ocid={`leaderboard.item.${i + 1}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.02] w-full text-left"
                style={{
                  borderBottom:
                    i < sorted.length - 1
                      ? "1px solid oklch(0.2 0.02 280 / 0.4)"
                      : "none",
                  background: user.isPlayer
                    ? "oklch(0.55 0.22 295 / 0.08)"
                    : undefined,
                }}
                onClick={() =>
                  !user.isPlayer &&
                  navigate("user-profile", { userId: user.id })
                }
              >
                <div className="w-8 text-center">
                  {rankEmoji(i + 1) ? (
                    <span className="text-xl">{rankEmoji(i + 1)}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      #{i + 1}
                    </span>
                  )}
                </div>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.displayName}
                    {user.isPlayer && (
                      <span
                        className="ml-1 text-xs"
                        style={{ color: "oklch(0.7 0.2 295)" }}
                      >
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.username}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">
                    {user.followerCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lv.{user.creatorLevel}
                  </p>
                </div>
                {i < 3 && (
                  <Badge
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.2 80), oklch(0.65 0.2 50))",
                      color: "white",
                      border: "none",
                    }}
                    className="text-xs ml-1"
                  >
                    Top {i + 1}
                  </Badge>
                )}
              </button>
            ))}
      </div>
    </div>
  );
}
