import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { PostItem } from "../context/AppContext";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function renderCaption(
  caption: string,
  navigate: (page: string, params?: Record<string, string>) => void,
) {
  const parts = caption.split(/(#\w+)/g);
  // Use character offset as stable key instead of array index
  let offset = 0;
  return parts.map((part) => {
    const key = `c${offset}`;
    offset += part.length;
    return part.startsWith("#") ? (
      <button
        key={key}
        type="button"
        onClick={() =>
          navigate("hashtag", { tag: part.slice(1).toLowerCase() })
        }
        className="font-medium hover:underline"
        style={{ color: "oklch(0.7 0.2 210)" }}
      >
        {part}
      </button>
    ) : (
      <span key={key}>{part}</span>
    );
  });
}

interface Props {
  post: PostItem;
  index: number;
  onOpenDetail?: (post: PostItem) => void;
}

export default function PostCard({ post, index, onOpenDetail }: Props) {
  const {
    profile,
    setPosts,
    savedPosts,
    likedPosts,
    followedUserIds,
    savePost,
    unsavePost,
    likePost,
    unlikePost,
    followUser,
    unfollowUser,
    navigate,
  } = useApp();
  const [showStats, setShowStats] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const idx = index + 1;

  const images =
    post.images && post.images.length > 0 ? post.images : [post.imageUrl];
  const isMultiImage = images.length > 1;

  const isOwnPost = post.authorUsername === profile.username;
  const isFollowing = post.authorUserId
    ? followedUserIds.has(post.authorUserId)
    : false;
  const isSaved = savedPosts.has(post.id) || post.savedByUser;
  const isLiked = likedPosts.has(post.id) || post.likedByUser;

  const toggleLike = () => {
    if (isLiked) unlikePost(post.id);
    else likePost(post.id);
  };
  const toggleSave = () => {
    if (isSaved) unsavePost(post.id);
    else savePost(post.id);
  };
  const handleShare = () =>
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, shares: p.shares + 1 } : p)),
    );
  const toggleFollow = () => {
    if (!post.authorUserId) return;
    if (isFollowing) unfollowUser(post.authorUserId);
    else followUser(post.authorUserId);
  };

  const engagementRate =
    post.views > 0
      ? (
          ((post.likes + post.comments.length + post.shares) / post.views) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <article
      className="glass-card post-enter overflow-hidden"
      data-ocid={`post.item.${idx}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() =>
            post.authorUserId
              ? navigate("user-profile", { userId: post.authorUserId })
              : undefined
          }
        >
          <Avatar
            className="w-10 h-10"
            style={{ boxShadow: "0 0 0 2px oklch(0.6 0.22 295 / 0.4)" }}
          >
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback>{post.authorName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground">
              {post.authorName}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.authorUsername} · {timeAgo(post.timestamp)}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {!isOwnPost && post.authorUserId && (
            <Button
              data-ocid="post.follow.button"
              size="sm"
              variant="ghost"
              onClick={toggleFollow}
              className="h-7 px-2 text-xs gap-1"
              style={{
                color: isFollowing
                  ? "oklch(0.65 0.2 175)"
                  : "oklch(0.7 0.2 295)",
              }}
            >
              {isFollowing ? (
                <UserCheck className="w-3.5 h-3.5" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
          {post.isTrending && (
            <Badge
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.2 50), oklch(0.6 0.22 25))",
                color: "white",
                border: "none",
              }}
              className="text-xs"
            >
              \ud83d\udd25 Trending
            </Badge>
          )}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onOpenDetail?.(post)}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel / Image */}
      {images.length > 0 && (
        <div className="relative">
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => onOpenDetail?.(post)}
          >
            <img
              src={images[carouselIdx]}
              alt="post"
              className="w-full object-cover"
              style={{ maxHeight: "400px" }}
              loading="lazy"
            />
          </button>
          {isMultiImage && (
            <>
              {carouselIdx > 0 && (
                <button
                  type="button"
                  onClick={() => setCarouselIdx((i) => i - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {carouselIdx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => setCarouselIdx((i) => i + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((imgSrc) => (
                  <button
                    key={imgSrc.slice(-12)}
                    type="button"
                    onClick={() => setCarouselIdx(images.indexOf(imgSrc))}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{
                      background:
                        images.indexOf(imgSrc) === carouselIdx
                          ? "white"
                          : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
              <div className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                {carouselIdx + 1}/{images.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Watch Time Badge */}
      {post.watchTime !== undefined && (
        <div className="px-4 pt-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background:
                post.watchTime >= 70
                  ? "oklch(0.22 0.04 145 / 0.8)"
                  : post.watchTime < 45
                    ? "oklch(0.22 0.04 25 / 0.8)"
                    : "oklch(0.2 0.025 280 / 0.8)",
              color:
                post.watchTime >= 70
                  ? "oklch(0.72 0.18 145)"
                  : post.watchTime < 45
                    ? "oklch(0.72 0.2 50)"
                    : "oklch(0.65 0.12 270)",
              border: "1px solid currentColor",
              opacity: 0.85,
            }}
          >
            👁 {post.watchTime}% watch time
          </span>
        </div>
      )}

      {/* Caption */}
      <div className="px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">
          {renderCaption(post.caption, (page, params) =>
            navigate(page, params as { tag?: string }),
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <button
          type="button"
          data-ocid="post.like.button"
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:scale-110 ${isLiked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          {post.likes.toLocaleString()}
        </button>
        <button
          type="button"
          data-ocid="post.comment.button"
          onClick={() => onOpenDetail?.(post)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-blue-400 transition-all duration-200 hover:scale-110"
        >
          <MessageCircle className="w-5 h-5" />
          {post.comments.length}
        </button>
        <button
          type="button"
          data-ocid="post.share.button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-all duration-200 hover:scale-110"
        >
          <Share2 className="w-5 h-5" />
          {post.shares}
        </button>
        <button
          type="button"
          data-ocid="post.save.button"
          onClick={toggleSave}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:scale-110 ml-auto ${isSaved ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          data-ocid="post.stats.toggle"
          onClick={() => setShowStats((s) => !s)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          {showStats ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {showStats && (
        <div className="px-4 pb-4">
          <div
            className="rounded-xl p-3 grid grid-cols-3 gap-3 text-center"
            style={{ background: "oklch(0.16 0.018 280 / 0.6)" }}
          >
            {[
              { label: "Views", value: post.views.toLocaleString() },
              { label: "Reach", value: post.reach.toLocaleString() },
              {
                label: "Impressions",
                value: post.impressions.toLocaleString(),
              },
              { label: "Likes", value: post.likes.toLocaleString() },
              { label: "Comments", value: post.comments.length.toString() },
              { label: "Shares", value: post.shares.toLocaleString() },
              { label: "Followers Gained", value: `+${post.followersGained}` },
              { label: "Engagement Rate", value: `${engagementRate}%` },
              {
                label: "Score",
                value: Math.floor(post.engagementScore).toLocaleString(),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.7 0.2 295)" }}
                >
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
