import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bookmark,
  Edit2,
  Grid,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import FollowersModal from "../components/FollowersModal";
import FollowingModal from "../components/FollowingModal";
import PostDetailView from "../components/PostDetailView";
import { PRESET_AVATARS, useApp } from "../context/AppContext";
import type { PostItem } from "../context/AppContext";
import { generatePostsForUser, generateUser } from "../utils/simulatedUsers";

const LEVEL_THRESHOLDS = [
  { level: 1, name: "Beginner Creator", min: 0, max: 500 },
  { level: 2, name: "Emerging Voice", min: 500, max: 1500 },
  { level: 3, name: "Rising Creator", min: 1500, max: 3000 },
  { level: 5, name: "Rising Star", min: 3000, max: 6000 },
  { level: 10, name: "Influencer", min: 10000, max: 20000 },
  { level: 20, name: "Social Media Legend", min: 50000, max: 100000 },
];

function getLevelInfo(xp: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].min) {
      const tier = LEVEL_THRESHOLDS[i];
      const next =
        LEVEL_THRESHOLDS[Math.min(i + 1, LEVEL_THRESHOLDS.length - 1)];
      const progress = ((xp - tier.min) / (next.max - tier.min)) * 100;
      return { ...tier, progress: Math.min(100, progress), nextXp: next.max };
    }
  }
  return { ...LEVEL_THRESHOLDS[0], progress: 0, nextXp: 500 };
}

interface Props {
  userId?: string;
}

function getRankInfo(followers: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (followers >= 1000000)
    return {
      label: "💎 Legend",
      color: "oklch(0.82 0.2 295)",
      bg: "oklch(0.22 0.06 295 / 0.3)",
    };
  if (followers >= 100000)
    return {
      label: "⭐ Celebrity",
      color: "oklch(0.78 0.18 80)",
      bg: "oklch(0.22 0.06 80 / 0.3)",
    };
  if (followers >= 10000)
    return {
      label: "🌟 Influencer",
      color: "oklch(0.72 0.2 145)",
      bg: "oklch(0.18 0.06 145 / 0.3)",
    };
  if (followers >= 1000)
    return {
      label: "📈 Rising Creator",
      color: "oklch(0.72 0.18 220)",
      bg: "oklch(0.18 0.05 220 / 0.3)",
    };
  return {
    label: "🌱 Beginner",
    color: "oklch(0.68 0.12 160)",
    bg: "oklch(0.18 0.04 160 / 0.3)",
  };
}

export default function Profile({ userId }: Props) {
  const {
    profile,
    setProfile,
    posts,
    achievements,
    boostFollowers,
    savedPosts,
    followedUserIds,
    followUser,
    unfollowUser,
    addSimulatedPost,
    shadowBan,
    setShadowBan,
    addNotification,
    reputationScore,
    contentSeries,
    navigate,
    audienceMood,
    rivalCreator,
    legacyScore,
    updateLegacyScore,
    celebrityMode,
  } = useApp();
  const isOwnProfile = !userId;

  const [paparazziOpen, setPaparazziOpen] = useState(false);
  const [paparazziFollowers, setPaparazziFollowers] = useState(0);
  const [simPosts, setSimPosts] = useState<PostItem[]>([]);
  // Track peak followers for legacy score
  useEffect(() => {
    if (!isOwnProfile) return;
    const followers = profile.followers;
    if (followers > legacyScore.peakFollowers) {
      updateLegacyScore({ peakFollowers: followers });
    }
  }, [
    profile.followers,
    isOwnProfile,
    legacyScore.peakFollowers,
    updateLegacyScore,
  ]);

  // Celebrity paparazzi event
  useEffect(() => {
    if (!isOwnProfile || !celebrityMode) return;
    const timer = setTimeout(
      () => {
        const rand = Math.floor(Math.random() * 45000) + 5000;
        setPaparazziFollowers(rand);
        setPaparazziOpen(true);
        setProfile((p) => ({ ...p, followers: p.followers + rand }));
      },
      Math.random() * 120000 + 60000,
    ); // fires 1-3 min after reaching celebrity
    return () => clearTimeout(timer);
  }, [isOwnProfile, celebrityMode, setProfile]);

  const [simLoading, setSimLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: addSimulatedPost is stable, userId drives re-runs
  useEffect(() => {
    if (!userId) return;
    setSimLoading(true);
    const userIndex = Number.parseInt(userId) || 0;
    const generated = generatePostsForUser(userIndex, 9);
    const converted = generated.map((sp) => addSimulatedPost(sp));
    setSimPosts(converted);
    setTimeout(() => setSimLoading(false), 800);
  }, [userId]);

  const simUser = userId ? generateUser(Number.parseInt(userId) || 0) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);
  const [fakeFollowersOpen, setFakeFollowersOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<PostItem | null>(null);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    avatar: profile.avatar,
    niche: profile.niche,
  });
  const [avatarTab, setAvatarTab] = useState<"url" | "upload" | "preset">(
    "url",
  );
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const prevAchievementsRef = useRef(achievements);

  const displayProfile = isOwnProfile
    ? profile
    : simUser
      ? {
          name: simUser.displayName,
          username: simUser.username,
          avatar: simUser.avatar,
          bio: simUser.bio,
          followers: simUser.followerCount,
          following: simUser.followingCount,
          postsCount: simUser.postsCount,
          xp: simUser.creatorLevel * 500,
          level: simUser.creatorLevel,
        }
      : profile;

  const userPosts = isOwnProfile
    ? posts.filter((p) => p.authorUsername === profile.username)
    : simPosts;
  const savedPostsList = isOwnProfile
    ? posts.filter((p) => savedPosts.has(p.id) || p.savedByUser)
    : [];
  const levelInfo = getLevelInfo(displayProfile.xp);
  const isFollowingUser = userId ? followedUserIds.has(userId) : false;

  useEffect(() => {
    const prev = prevAchievementsRef.current;
    for (const ach of achievements) {
      const was = prev.find((a) => a.id === ach.id);
      if (ach.unlocked && was && !was.unlocked) {
        toast(
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ach.icon}</span>
            <div>
              <p className="font-bold text-sm">
                \ud83c\udfc6 Achievement Unlocked!
              </p>
              <p className="text-xs text-muted-foreground">{ach.title}</p>
            </div>
          </div>,
          { duration: 5000 },
        );
      }
    }
    prevAchievementsRef.current = achievements;
  }, [achievements]);

  const handleSave = () => {
    setProfile((prev) => ({ ...prev, ...editForm }));
    setEditOpen(false);
    toast.success("Profile updated!");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setEditForm((f) => ({ ...f, avatar: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  // Shadow ban countdown timer
  const handleFakeFollowers = () => {
    setProfile((prev) => ({ ...prev, followers: prev.followers + 50000 }));
    setFakeFollowersOpen(false);
    const roll = Math.random();
    if (roll < 0.4) {
      const endsAt = Date.now() + 180000;
      setShadowBan({ active: true, endsAt });
      addNotification({
        icon: "⚠️",
        message:
          "Shadow ban activated! Your reach is reduced to 0.2x for 3 minutes.",
        type: "shadow_ban",
      });
      toast.error("⚠️ Shadow banned! Reach reduced for 3 minutes.");
    } else if (roll < 0.7) {
      setTimeout(() => {
        const purged = Math.floor(50000 * (0.3 + Math.random() * 0.3));
        setProfile((prev) => ({
          ...prev,
          followers: Math.max(0, prev.followers - purged),
        }));
        addNotification({
          icon: "⚠️",
          message: `Follower purge detected! You lost ${purged.toLocaleString()} followers.`,
          type: "shadow_ban",
        });
        toast.error(
          `⚠️ Follower purge! -${purged.toLocaleString()} followers removed.`,
        );
      }, 10000);
      toast.success("You gained 50,000 followers!");
    } else {
      toast.success("🍀 You got lucky! No penalties this time.");
      addNotification({
        icon: "🍀",
        message:
          "You got lucky! No penalties for buying fake followers this time.",
        type: "boost",
      });
    }
  };

  const handleBoost = (amount: number) => {
    boostFollowers(amount);
    toast.success(
      `\ud83d\ude80 Boost activated! +${amount.toLocaleString()} followers incoming!`,
    );
    setBoostOpen(false);
  };

  const openPostsForDetail = isOwnProfile ? userPosts : simPosts;

  if (!isOwnProfile && simLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no id
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-5">
          <Avatar
            className="w-24 h-24"
            style={{ boxShadow: "0 0 0 4px oklch(0.6 0.22 295 / 0.3)" }}
          >
            <AvatarImage
              src={displayProfile.avatar}
              alt={displayProfile.name}
            />
            <AvatarFallback className="text-2xl">
              {displayProfile.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h1 className="text-2xl font-bold">{displayProfile.name}</h1>
              {isOwnProfile && shadowBan.active && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: "oklch(0.6 0.2 25 / 0.2)",
                    color: "oklch(0.72 0.18 25)",
                    border: "1px solid oklch(0.6 0.2 25 / 0.4)",
                  }}
                >
                  ⚠️ Shadow Banned
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              {displayProfile.username}
            </p>
            <p className="text-sm text-foreground mb-2">{displayProfile.bio}</p>
            {isOwnProfile && profile.niche && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: "oklch(0.55 0.22 295 / 0.2)",
                    color: "oklch(0.72 0.22 295)",
                    border: "1px solid oklch(0.55 0.22 295 / 0.3)",
                  }}
                >
                  🎯 {profile.niche}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {isOwnProfile ? (
                <>
                  <Button
                    data-ocid="profile.edit.button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    style={{
                      borderColor: "oklch(0.35 0.03 280 / 0.5)",
                      background: "oklch(0.2 0.02 280 / 0.5)",
                    }}
                    onClick={() => {
                      setEditForm({
                        name: profile.name,
                        username: profile.username,
                        bio: profile.bio,
                        avatar: profile.avatar,
                        niche: profile.niche,
                      });
                      setEditOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                  <Button
                    data-ocid="profile.boost.open_modal_button"
                    size="sm"
                    className="gap-2 btn-gradient text-white border-none boost-pulse"
                    onClick={() => setBoostOpen(true)}
                  >
                    <Zap className="w-3.5 h-3.5" /> Boost Followers
                  </Button>
                  <Button
                    data-ocid="profile.fake_followers.open_modal_button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    style={{
                      borderColor: "oklch(0.6 0.2 25 / 0.4)",
                      color: "oklch(0.72 0.18 25)",
                      background: "oklch(0.6 0.2 25 / 0.05)",
                    }}
                    onClick={() => setFakeFollowersOpen(true)}
                  >
                    ⚠️ Buy Fake Followers
                  </Button>
                  <Button
                    data-ocid="profile.go_live.button"
                    size="sm"
                    className="gap-1.5 text-xs text-white border-none"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.28 25), oklch(0.5 0.25 10))",
                      boxShadow: "0 2px 12px oklch(0.55 0.28 25 / 0.4)",
                    }}
                    onClick={() => navigate("live-stream")}
                  >
                    🔴 Go Live
                  </Button>
                </>
              ) : (
                <Button
                  data-ocid={
                    isFollowingUser
                      ? "profile.unfollow.button"
                      : "profile.follow.button"
                  }
                  size="sm"
                  className={
                    isFollowingUser ? "" : "btn-gradient text-white border-none"
                  }
                  variant={isFollowingUser ? "outline" : "default"}
                  style={
                    isFollowingUser
                      ? { borderColor: "oklch(0.35 0.03 280 / 0.5)" }
                      : {}
                  }
                  onClick={() =>
                    userId
                      ? isFollowingUser
                        ? unfollowUser(userId)
                        : followUser(userId)
                      : undefined
                  }
                >
                  {isFollowingUser ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t"
          style={{ borderColor: "oklch(0.25 0.025 280 / 0.3)" }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold">
              {userPosts.length || displayProfile.postsCount}
            </p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <button
            type="button"
            data-ocid="profile.followers.link"
            className="text-center hover:opacity-70 transition-opacity"
            onClick={() => setFollowersOpen(true)}
          >
            <p className="text-2xl font-bold">
              {displayProfile.followers.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button
            type="button"
            data-ocid="profile.following.link"
            className="text-center hover:opacity-70 transition-opacity"
            onClick={() => {
              if (isOwnProfile) setFollowingOpen(true);
            }}
          >
            <p className="text-2xl font-bold">
              {displayProfile.following.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>
        {/* Rank Badge */}
        {isOwnProfile &&
          (() => {
            const rank = getRankInfo(displayProfile.followers);
            return (
              <div className="flex justify-center mt-3">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: rank.bg,
                    color: rank.color,
                    border: `1px solid ${rank.color}40`,
                  }}
                >
                  {rank.label}
                </span>
              </div>
            );
          })()}
      </div>

      {/* Creator Hub Banner */}
      {/* Rival Creator Card */}
      {isOwnProfile && rivalCreator && (
        <div
          className="glass-card p-4"
          data-ocid="profile.rival.card"
          style={{
            border: "1px solid oklch(0.65 0.25 25 / 0.3)",
            boxShadow: "0 0 30px oklch(0.55 0.25 25 / 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <h3
              className="font-bold text-sm uppercase tracking-wide"
              style={{ color: "oklch(0.75 0.25 25)" }}
            >
              Your Rival
            </h3>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={rivalCreator.avatar}
                  alt={rivalCreator.name}
                />
                <AvatarFallback>{rivalCreator.name[0]}</AvatarFallback>
              </Avatar>
              <span className="absolute -top-1 -right-1 text-sm">😤</span>
            </div>
            <div>
              <p className="font-bold text-sm">{rivalCreator.name}</p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 280)" }}>
                {rivalCreator.username} · {rivalCreator.niche}
              </p>
            </div>
            <div className="ml-auto">
              {profile.followers > rivalCreator.followerCount * 1.1 ? (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "oklch(0.18 0.06 145 / 0.4)",
                    border: "1px solid oklch(0.55 0.22 145 / 0.4)",
                    color: "oklch(0.72 0.22 145)",
                  }}
                >
                  You&apos;re ahead 🏆
                </span>
              ) : Math.abs(profile.followers - rivalCreator.followerCount) /
                  Math.max(profile.followers, 1) <
                0.1 ? (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "oklch(0.18 0.06 80 / 0.4)",
                    border: "1px solid oklch(0.65 0.22 80 / 0.4)",
                    color: "oklch(0.78 0.22 80)",
                  }}
                >
                  Neck and neck ⚡
                </span>
              ) : (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "oklch(0.18 0.06 25 / 0.4)",
                    border: "1px solid oklch(0.55 0.22 25 / 0.4)",
                    color: "oklch(0.72 0.22 25)",
                  }}
                >
                  Rival winning 😤
                </span>
              )}
            </div>
          </div>

          {/* Stats comparison */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Followers",
                you: profile.followers,
                rival: rivalCreator.followerCount,
                fmt: (v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString(),
              },
              {
                label: "Posts",
                you: posts.filter((p) => p.authorUsername === profile.username)
                  .length,
                rival: rivalCreator.postsCount,
                fmt: (v: number) => v.toString(),
              },
              {
                label: "Engagement",
                you: Math.round(
                  posts
                    .filter((p) => p.authorUsername === profile.username)
                    .reduce((s, p) => s + p.engagementScore, 0) / 100,
                ),
                rival: Math.round(rivalCreator.engagementScore),
                fmt: (v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString(),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="col-span-1 rounded-xl p-3 last:col-span-2"
                style={{
                  background: "oklch(0.16 0.02 280 / 0.5)",
                  border: "1px solid oklch(0.28 0.03 280 / 0.4)",
                }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: "oklch(0.55 0.04 280)" }}
                >
                  {stat.label}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-center">
                    <p
                      className="font-bold text-sm"
                      style={{ color: "oklch(0.82 0.2 295)" }}
                    >
                      {stat.fmt(stat.you)}
                    </p>
                    <p style={{ color: "oklch(0.55 0.04 280)" }}>You</p>
                  </div>
                  <span style={{ color: "oklch(0.4 0.04 280)" }}>vs</span>
                  <div className="text-center">
                    <p
                      className="font-bold text-sm"
                      style={{ color: "oklch(0.72 0.22 25)" }}
                    >
                      {stat.fmt(stat.rival)}
                    </p>
                    <p style={{ color: "oklch(0.55 0.04 280)" }}>Rival</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <button
          type="button"
          onClick={() => navigate("hub")}
          data-ocid="profile.hub.button"
          className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.03 295 / 0.95), oklch(0.15 0.02 270 / 0.9))",
            border: "1px solid oklch(0.35 0.12 295 / 0.4)",
            boxShadow: "0 4px 24px oklch(0.4 0.2 295 / 0.15)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))",
            }}
          >
            ⚡
          </div>
          <div className="flex-1">
            <div className="font-bold text-foreground">Creator Hub</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Analytics · Monetization · Studio · Leaderboard & more
            </div>
          </div>
          <div className="text-muted-foreground text-xs px-2">→</div>
        </button>
      )}

      {/* Trust Score Badge */}
      {isOwnProfile &&
        (() => {
          const tier =
            reputationScore >= 80
              ? {
                  label: "Trusted Creator",
                  color: "#eab308",
                  bg: "oklch(0.72 0.2 65 / 0.15)",
                  border: "oklch(0.72 0.2 65 / 0.35)",
                  icon: "🏆",
                }
              : reputationScore >= 50
                ? {
                    label: "Rising Creator",
                    color: "#6366f1",
                    bg: "oklch(0.55 0.22 295 / 0.15)",
                    border: "oklch(0.55 0.22 295 / 0.35)",
                    icon: "⭐",
                  }
                : {
                    label: "At Risk",
                    color: "#ef4444",
                    bg: "oklch(0.6 0.22 25 / 0.15)",
                    border: "oklch(0.6 0.22 25 / 0.35)",
                    icon: "⚠️",
                  };
          return (
            <div
              data-ocid="profile.trust_score.card"
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tier.icon}</span>
                <div>
                  <p className="text-xs text-muted-foreground">Trust Score</p>
                  <p
                    className="text-sm font-bold"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p
                    className="text-xl font-bold"
                    style={{ color: tier.color }}
                  >
                    {reputationScore}
                  </p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg
                    aria-hidden="true"
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="oklch(0.22 0.02 280)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={tier.color}
                      strokeWidth="3"
                      strokeDasharray={`${reputationScore} ${100 - reputationScore}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Legacy Score Card */}
      {isOwnProfile && (
        <div
          data-ocid="profile.legacy_score.card"
          className="glass-card p-4"
          style={{ border: "1px solid oklch(0.7 0.18 80 / 0.3)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <div>
                <p className="text-xs text-muted-foreground">Legacy Score</p>
                <p
                  className="text-sm font-bold"
                  style={{ color: "oklch(0.78 0.18 80)" }}
                >
                  All-time impact — survives New Game
                </p>
              </div>
            </div>
            {celebrityMode && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  background: "oklch(0.7 0.18 80 / 0.2)",
                  border: "1px solid oklch(0.7 0.18 80 / 0.5)",
                  color: "oklch(0.82 0.2 80)",
                }}
              >
                ⭐ Celebrity
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                style={{ background: "oklch(0.13 0.016 280 / 0.7)" }}
              >
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-sm font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creator Level */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Creator Level
            </p>
            <p
              className="font-bold text-lg"
              style={{ color: "oklch(0.75 0.22 295)" }}
            >
              Lv.{levelInfo.level} \u2014 {levelInfo.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {displayProfile.xp.toLocaleString()} XP
            </p>
            <p className="text-xs text-muted-foreground">
              Next: {levelInfo.nextXp.toLocaleString()} XP
            </p>
          </div>
        </div>
        <Progress
          value={levelInfo.progress}
          className="h-2"
          style={{ background: "oklch(0.2 0.02 280)" }}
        />
      </div>

      {/* Achievements */}
      {isOwnProfile && (
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            \ud83c\udfc6 Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((ach, idx) => (
              <div
                key={ach.id}
                data-ocid={`achievements.item.${idx + 1}`}
                className={`glass-card-light p-3 text-center transition-all duration-300 ${ach.unlocked ? "ring-1 ring-purple-500/30" : "opacity-40 grayscale"}`}
              >
                <div className="text-3xl mb-2">{ach.icon}</div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {ach.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">
                  {ach.description}
                </p>
                {ach.unlocked && (
                  <div
                    className="mt-2 text-xs"
                    style={{ color: "oklch(0.65 0.2 175)" }}
                  >
                    \u2713 Unlocked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts / Saved Tabs */}
      <Tabs defaultValue="posts">
        <TabsList
          className="w-full"
          style={{ background: "oklch(0.16 0.018 280)" }}
        >
          <TabsTrigger
            value="posts"
            data-ocid="profile.posts.tab"
            className="flex-1 gap-1.5"
          >
            <Grid className="w-3.5 h-3.5" /> Posts
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger
              value="saved"
              data-ocid="profile.saved.tab"
              className="flex-1 gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" /> Saved
            </TabsTrigger>
          )}
          {isOwnProfile && contentSeries.length > 0 && (
            <TabsTrigger
              value="series"
              data-ocid="profile.series.tab"
              className="flex-1 gap-1.5"
            >
              📺 Series
            </TabsTrigger>
          )}
          {!isOwnProfile && (
            <TabsTrigger
              value="followers"
              data-ocid="profile.followers.tab"
              className="flex-1 gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Followers
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts">
          {userPosts.length === 0 ? (
            <p
              data-ocid="profile.posts.empty_state"
              className="text-muted-foreground text-sm text-center py-8"
            >
              No posts yet
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {userPosts.map((post, idx) => (
                <button
                  type="button"
                  key={post.id}
                  data-ocid={`profile.posts.item.${idx + 1}`}
                  onClick={() => setDetailPost(post)}
                  className="aspect-square rounded-xl overflow-hidden group relative"
                >
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {post.images && post.images.length > 1 && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs">
                        {post.images.length}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="saved">
            {savedPostsList.length === 0 ? (
              <p
                data-ocid="profile.saved.empty_state"
                className="text-muted-foreground text-sm text-center py-8"
              >
                No saved posts yet
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {savedPostsList.map((post, idx) => (
                  <button
                    type="button"
                    key={post.id}
                    data-ocid={`profile.saved.item.${idx + 1}`}
                    onClick={() => setDetailPost(post)}
                    className="aspect-square rounded-xl overflow-hidden group"
                  >
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {isOwnProfile && contentSeries.length > 0 && (
          <TabsContent value="series">
            <div className="space-y-4 mt-4" data-ocid="profile.series.panel">
              {contentSeries.length === 0 ? (
                <p
                  data-ocid="profile.series.empty_state"
                  className="text-muted-foreground text-sm text-center py-8"
                >
                  No series yet — add a post to a series when creating content!
                </p>
              ) : (
                contentSeries.map((series, sIdx) => {
                  const seriesPosts = posts.filter((p) =>
                    series.postIds.includes(p.id),
                  );
                  return (
                    <div
                      key={series.id}
                      data-ocid={`profile.series.item.${sIdx + 1}`}
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.14 0.016 280 / 0.8)",
                        border: "1px solid oklch(0.28 0.025 280 / 0.4)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">
                            📺 {series.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {series.postIds.length} episode
                            {series.postIds.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(0.55 0.22 295 / 0.2)",
                            color: "oklch(0.65 0.22 295)",
                          }}
                        >
                          Series
                        </span>
                      </div>
                      {seriesPosts.length > 0 ? (
                        <div className="grid grid-cols-4 gap-1.5">
                          {seriesPosts.map((post, pIdx) => (
                            <button
                              key={post.id}
                              type="button"
                              data-ocid={`profile.series.item.${sIdx + 1}`}
                              onClick={() => setDetailPost(post)}
                              className="aspect-square rounded-lg overflow-hidden relative group"
                            >
                              <img
                                src={post.imageUrl}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div
                                className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold py-0.5"
                                style={{
                                  background: "rgba(0,0,0,0.6)",
                                  color: "white",
                                }}
                              >
                                Ep.{pIdx + 1}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Posts loading...
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        )}

        {!isOwnProfile && (
          <TabsContent value="followers">
            <div className="mt-4 text-center text-muted-foreground text-sm py-4">
              <button
                type="button"
                className="underline hover:text-foreground transition-colors"
                onClick={() => setFollowersOpen(true)}
              >
                View {displayProfile.followers.toLocaleString()} followers
              </button>
            </div>
            {isOwnProfile && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background:
                    audienceMood === "hyped"
                      ? "oklch(0.22 0.06 80 / 0.3)"
                      : audienceMood === "angry"
                        ? "oklch(0.2 0.06 25 / 0.3)"
                        : audienceMood === "bored"
                          ? "oklch(0.2 0.05 230 / 0.3)"
                          : "oklch(0.16 0.02 280 / 0.5)",
                  color:
                    audienceMood === "hyped"
                      ? "oklch(0.78 0.18 80)"
                      : audienceMood === "angry"
                        ? "oklch(0.72 0.22 25)"
                        : audienceMood === "bored"
                          ? "oklch(0.72 0.18 230)"
                          : "oklch(0.55 0.04 280)",
                  border: "1px solid currentColor",
                }}
              >
                {audienceMood === "hyped"
                  ? "😤 Hyped"
                  : audienceMood === "angry"
                    ? "😡 Angry"
                    : audienceMood === "bored"
                      ? "😴 Bored"
                      : "😐 Neutral"}
              </span>
            )}
          </TabsContent>
        )}
      </Tabs>

      <FollowersModal
        open={followersOpen}
        onClose={() => setFollowersOpen(false)}
        followerCount={displayProfile.followers}
        isOwnProfile={isOwnProfile}
      />
      {isOwnProfile && (
        <FollowingModal
          open={followingOpen}
          onClose={() => setFollowingOpen(false)}
        />
      )}

      {detailPost && (
        <PostDetailView
          post={
            openPostsForDetail.find((p) => p.id === detailPost.id) ?? detailPost
          }
          posts={openPostsForDetail}
          onClose={() => setDetailPost(null)}
          onNavigate={setDetailPost}
        />
      )}

      {/* Boost Modal */}
      <Dialog open={boostOpen} onOpenChange={setBoostOpen}>
        <DialogContent
          data-ocid="profile.boost.modal"
          style={{
            background: "oklch(0.16 0.018 280)",
            border: "1px solid oklch(0.3 0.03 280 / 0.4)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Boost Followers
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose a boost package to instantly grow your audience.
          </p>
          <div className="grid gap-3 py-2">
            {[
              {
                label: "MIN Boost",
                amount: 1000,
                icon: "\u26a1",
                desc: "Great for kickstarting growth",
                gradient:
                  "linear-gradient(135deg, oklch(0.55 0.2 240), oklch(0.5 0.22 210))",
                ocid: "boost.min.button",
              },
              {
                label: "MEDIUM Boost",
                amount: 10000,
                icon: "\ud83d\udd25",
                desc: "Most popular choice",
                gradient:
                  "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 240))",
                badge: "Most Popular",
                ocid: "boost.medium.button",
              },
              {
                label: "MAX Boost",
                amount: 100000,
                icon: "\ud83d\ude80",
                desc: "Go viral instantly",
                gradient:
                  "linear-gradient(135deg, oklch(0.7 0.2 80), oklch(0.65 0.2 50))",
                ocid: "boost.max.button",
              },
            ].map(({ label, amount, icon, desc, gradient, badge, ocid }) => (
              <button
                type="button"
                key={label}
                data-ocid={ocid}
                onClick={() => handleBoost(amount)}
                className="relative flex items-center gap-4 p-4 rounded-xl text-white text-left hover:opacity-90 transition-all duration-150"
                style={{ background: gradient }}
              >
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <p className="font-bold">{label}</p>
                  <p className="text-sm opacity-80">{desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    +{amount.toLocaleString()}
                  </p>
                  <p className="text-xs opacity-70">followers</p>
                </div>
                {badge && (
                  <span className="absolute top-2 right-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              data-ocid="profile.boost.cancel_button"
              variant="ghost"
              onClick={() => setBoostOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          data-ocid="profile.edit.modal"
          style={{
            background: "oklch(0.16 0.018 280)",
            border: "1px solid oklch(0.3 0.03 280 / 0.4)",
          }}
          className="max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <Input
                data-ocid="profile.edit.name_input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Username</Label>
              <Input
                data-ocid="profile.edit.username_input"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, username: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Bio</Label>
              <Textarea
                data-ocid="profile.edit.bio_input"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, bio: e.target.value }))
                }
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Content Niche
              </Label>
              <select
                data-ocid="profile.niche.select"
                value={editForm.niche}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, niche: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 rounded-xl text-sm"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.6)",
                  border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                  color: "oklch(0.95 0.01 260)",
                  outline: "none",
                }}
              >
                {[
                  "Tech",
                  "Finance",
                  "Fitness",
                  "Comedy",
                  "Memes",
                  "Travel",
                  "Gaming",
                  "Fashion",
                  "Food",
                  "Education",
                ].map((n) => (
                  <option
                    key={n}
                    value={n}
                    style={{ background: "oklch(0.16 0.018 280)" }}
                  >
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Profile Picture
              </Label>
              <div className="flex items-center gap-2 mt-2 mb-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={editForm.avatar} />
                  <AvatarFallback>{editForm.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1.5">
                  {(["url", "upload", "preset"] as const).map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      data-ocid={`profile.edit.avatar_${tab}.tab`}
                      onClick={() => setAvatarTab(tab)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${avatarTab === tab ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                      style={
                        avatarTab === tab
                          ? {
                              background:
                                "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 240))",
                            }
                          : {}
                      }
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {avatarTab === "url" && (
                <Input
                  data-ocid="profile.edit.avatar_url.input"
                  placeholder="https://..."
                  value={
                    editForm.avatar.startsWith("data:") ? "" : editForm.avatar
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, avatar: e.target.value }))
                  }
                />
              )}
              {avatarTab === "upload" && (
                <div>
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    data-ocid="profile.edit.avatar_upload.button"
                    variant="outline"
                    className="w-full gap-2"
                    style={{ borderColor: "oklch(0.35 0.03 280 / 0.5)" }}
                    onClick={() => avatarFileRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" /> Choose from Gallery
                  </Button>
                </div>
              )}
              {avatarTab === "preset" && (
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AVATARS.map((p, i) => (
                    <button
                      type="button"
                      key={p.seed}
                      data-ocid={`profile.edit.preset_avatar.${i + 1}`}
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.seed}`,
                        }))
                      }
                      className="flex flex-col items-center gap-1 group"
                    >
                      <Avatar
                        className={`w-10 h-10 transition-all duration-150 ${editForm.avatar.includes(p.seed) ? "ring-2 ring-purple-400 scale-110" : "group-hover:scale-105"}`}
                      >
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.seed}`}
                        />
                        <AvatarFallback>{p.label[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground leading-tight text-center">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="profile.edit.cancel_button"
              variant="ghost"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="profile.edit.save_button"
              className="btn-gradient text-white border-none"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fake Followers / Shadow Ban Dialog */}
      <Dialog open={fakeFollowersOpen} onOpenChange={setFakeFollowersOpen}>
        <DialogContent
          data-ocid="profile.fake_followers.dialog"
          style={{
            background: "oklch(0.15 0.018 280)",
            border: "1px solid oklch(0.6 0.2 25 / 0.3)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⚠️ Risky Move!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div
              className="rounded-xl p-3 text-sm"
              style={{
                background: "oklch(0.6 0.2 25 / 0.1)",
                border: "1px solid oklch(0.6 0.2 25 / 0.3)",
                color: "oklch(0.82 0.12 40)",
              }}
            >
              <p className="font-semibold mb-1">⚠️ Warning: High Risk</p>
              <p className="text-xs leading-relaxed">
                Buying fake followers may result in a{" "}
                <strong>shadow ban</strong>, reduced reach (0.2x), or an
                automatic <strong>follower purge</strong>. Proceed at your own
                risk.
              </p>
            </div>
            <div
              className="rounded-xl p-4 flex items-center justify-between"
              style={{
                background: "oklch(0.18 0.02 280 / 0.5)",
                border: "1px solid oklch(0.3 0.025 280 / 0.4)",
              }}
            >
              <div>
                <p className="font-semibold">+50,000 Followers</p>
                <p className="text-xs text-muted-foreground">
                  Instant delivery, zero cost
                </p>
              </div>
              <span
                className="text-2xl font-bold"
                style={{ color: "oklch(0.72 0.18 145)" }}
              >
                FREE
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="profile.fake_followers.cancel_button"
              variant="ghost"
              onClick={() => setFakeFollowersOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="profile.fake_followers.confirm_button"
              onClick={handleFakeFollowers}
              style={{
                background: "oklch(0.6 0.2 25 / 0.8)",
                color: "white",
                border: "none",
              }}
            >
              Proceed Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Paparazzi Event Modal */}
      {isOwnProfile && (
        <Dialog open={paparazziOpen} onOpenChange={setPaparazziOpen}>
          <DialogContent
            style={{
              background: "oklch(0.13 0.016 280)",
              border: "1px solid oklch(0.7 0.18 80 / 0.5)",
            }}
            data-ocid="profile.paparazzi.dialog"
          >
            <DialogHeader>
              <DialogTitle
                className="text-2xl text-center"
                style={{ color: "oklch(0.82 0.2 80)" }}
              >
                📸 Paparazzi Spotted You!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <div className="text-5xl mb-3">⭐</div>
              <p className="text-foreground text-lg font-bold">
                You're a Celebrity!
              </p>
              <p className="text-muted-foreground mt-2">
                News is spreading fast...
              </p>
              <div
                className="mt-4 text-3xl font-black"
                style={{ color: "oklch(0.78 0.18 80)" }}
              >
                +{paparazziFollowers.toLocaleString()} followers!
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setPaparazziOpen(false)}
                className="w-full"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.18 80), oklch(0.65 0.2 60))",
                }}
                data-ocid="profile.paparazzi.close_button"
              >
                Amazing! 🎉
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
