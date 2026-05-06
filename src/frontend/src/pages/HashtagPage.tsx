import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Hash, Heart, MessageCircle, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import PostDetailView from "../components/PostDetailView";
import { useApp } from "../context/AppContext";
import type { PostItem } from "../context/AppContext";

interface Props {
  tag: string;
}

export default function HashtagPage({ tag }: Props) {
  const { posts } = useApp();
  const [detailPost, setDetailPost] = useState<PostItem | null>(null);

  const taggedPosts = useMemo(() => {
    const t = `#${tag.toLowerCase()}`;
    return [...posts]
      .filter(
        (p) =>
          p.caption.toLowerCase().includes(t) ||
          (p.hashtags ?? []).some((h) => h === t),
      )
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }, [posts, tag]);

  return (
    <div
      data-ocid="hashtag.page"
      className="max-w-2xl mx-auto py-6 px-4 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 240))",
          }}
        >
          <Hash className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">#{tag}</h1>
          <p className="text-xs text-muted-foreground">
            {taggedPosts.length} posts
          </p>
        </div>
      </div>

      {taggedPosts.length === 0 ? (
        <div
          data-ocid="hashtag.empty_state"
          className="glass-card p-10 text-center text-muted-foreground"
        >
          No posts found for #{tag}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {taggedPosts.map((post, idx) => (
            <button
              type="button"
              key={post.id}
              data-ocid={`hashtag.post.item.${idx + 1}`}
              onClick={() => setDetailPost(post)}
              className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
            >
              <div className="relative">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-36 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </div>
              <div className="p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium truncate">
                    {post.authorUsername}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-3 h-3" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="w-3 h-3" />
                    {post.comments.length}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Share2 className="w-3 h-3" />
                    {post.shares}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {detailPost && (
        <PostDetailView
          post={taggedPosts.find((p) => p.id === detailPost.id) ?? detailPost}
          posts={taggedPosts}
          onClose={() => setDetailPost(null)}
          onNavigate={setDetailPost}
        />
      )}
    </div>
  );
}
