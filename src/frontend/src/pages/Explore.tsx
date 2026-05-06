import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Compass,
  Hash,
  Heart,
  MessageCircle,
  Search,
  Share2,
} from "lucide-react";
import { useMemo, useState } from "react";
import PostDetailView from "../components/PostDetailView";
import { useApp } from "../context/AppContext";
import type { PostItem } from "../context/AppContext";

const TRENDING_HASHTAGS = [
  "travel",
  "photography",
  "nature",
  "lifestyle",
  "fitness",
  "fashion",
  "food",
  "art",
  "motivation",
  "technology",
];

export default function Explore() {
  const { posts, navigate } = useApp();
  const [search, setSearch] = useState("");
  const [detailPost, setDetailPost] = useState<PostItem | null>(null);

  const filteredPosts = useMemo(() => {
    const sorted = [...posts].sort(
      (a, b) => b.engagementScore - a.engagementScore,
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        p.authorUsername.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        (p.hashtags ?? []).some((h) => h.includes(q)),
    );
  }, [posts, search]);

  const getBadge = (score: number) => {
    if (score > 500)
      return { label: "\ud83d\udd25 Trending", color: "oklch(0.65 0.2 50)" };
    if (score > 300)
      return { label: "\u2b50 Popular", color: "oklch(0.65 0.2 295)" };
    if (score > 150)
      return {
        label: "\ud83d\udccc Recommended",
        color: "oklch(0.65 0.2 175)",
      };
    return null;
  };

  return (
    <div
      data-ocid="explore.page"
      className="max-w-3xl mx-auto py-6 px-4 space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <Compass className="w-6 h-6 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold">Explore</h1>
          <p className="text-xs text-muted-foreground">
            Discover popular and trending content
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4" style={{ color: "oklch(0.7 0.2 295)" }} />
          <h2 className="text-sm font-semibold">Trending Hashtags</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_HASHTAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              data-ocid="explore.hashtag.button"
              onClick={() => navigate("hashtag", { tag })}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
              style={{
                background: "oklch(0.55 0.22 295 / 0.2)",
                color: "oklch(0.75 0.2 295)",
                border: "1px solid oklch(0.55 0.22 295 / 0.3)",
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="explore.search_input"
          placeholder="Search posts, creators, hashtags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          style={{
            background: "oklch(0.18 0.02 280 / 0.6)",
            border: "1px solid oklch(0.3 0.025 280 / 0.4)",
          }}
        />
      </div>

      {filteredPosts.length === 0 && (
        <div
          data-ocid="explore.empty_state"
          className="glass-card p-10 text-center text-muted-foreground"
        >
          No posts found for "{search}"
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredPosts.map((post, idx) => {
          const badge = getBadge(post.engagementScore);
          return (
            <button
              key={post.id}
              type="button"
              data-ocid={`explore.post.item.${idx + 1}`}
              className="glass-card overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-200 text-left w-full"
              onClick={() => setDetailPost(post)}
            >
              <div className="relative">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                {badge && (
                  <Badge
                    className="absolute top-2 left-2 text-xs border-none text-white"
                    style={{
                      background: `linear-gradient(135deg, ${badge.color}, oklch(0.55 0.22 240))`,
                    }}
                  >
                    {badge.label}
                  </Badge>
                )}
                {post.images && post.images.length > 1 && (
                  <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                    1/{post.images.length}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{post.authorName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {post.authorUsername}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {post.caption}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.comments.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {post.shares}
                  </span>
                  <span
                    className="ml-auto font-semibold"
                    style={{ color: "oklch(0.65 0.2 295)" }}
                  >
                    Score: {Math.floor(post.engagementScore)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {detailPost && (
        <PostDetailView
          post={filteredPosts.find((p) => p.id === detailPost.id) ?? detailPost}
          posts={filteredPosts}
          onClose={() => setDetailPost(null)}
          onNavigate={setDetailPost}
        />
      )}
    </div>
  );
}
