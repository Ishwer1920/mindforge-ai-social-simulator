import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getMomentumSignal } from "../utils/viralEngine";

export default function Trending() {
  const { posts } = useApp();
  const trending = [...posts]
    .filter((p) => p.engagementScore > 200 || (p.viralStage ?? 0) >= 2)
    .sort((a, b) => {
      const stageDiff = (b.viralStage ?? 0) - (a.viralStage ?? 0);
      if (stageDiff !== 0) return stageDiff;
      return b.engagementScore - a.engagementScore;
    });

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-6 px-4">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-6 h-6 text-orange-400" />
        <h1 className="text-2xl font-bold">Trending Now</h1>
      </div>

      {trending.length === 0 && (
        <div className="glass-card p-10 text-center text-muted-foreground">
          No trending posts yet — keep creating! 🚀
        </div>
      )}

      {trending.map((post) => (
        <article
          key={post.id}
          className="glass-card overflow-hidden flex gap-4 p-4"
        >
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback>{post.authorName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.authorUsername}</span>
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
                  🔥 Trending
                </Badge>
              )}
              {(post.viralStage ?? 0) > 0 &&
                getMomentumSignal(post.viralStage ?? 0) && (
                  <Badge
                    style={{
                      background: "oklch(0.22 0.03 280 / 0.8)",
                      color: "oklch(0.7 0.2 295)",
                      border: "1px solid oklch(0.35 0.03 280 / 0.4)",
                    }}
                    className="text-xs"
                  >
                    📈 {getMomentumSignal(post.viralStage ?? 0)}
                  </Badge>
                )}
            </div>
            <p className="text-sm text-foreground line-clamp-2 mb-3">
              {post.caption}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>❤️ {post.likes.toLocaleString()} likes</span>
              <span>💬 {post.comments.length} comments</span>
              <span
                className="ml-auto font-semibold"
                style={{ color: "oklch(0.65 0.2 50)" }}
              >
                Score: {Math.floor(post.engagementScore)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
