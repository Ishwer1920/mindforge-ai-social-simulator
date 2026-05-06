import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Heart,
  MessageCircle,
  Send,
  Share2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { PostItem } from "../context/AppContext";
import { getMomentumSignal } from "../utils/viralEngine";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  post: PostItem;
  posts: PostItem[];
  onClose: () => void;
  onNavigate: (post: PostItem) => void;
}

export default function PostDetailView({
  post,
  posts,
  onClose,
  onNavigate,
}: Props) {
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
    addCommentReply,
    navigate,
  } = useApp();
  const [commentInput, setCommentInput] = useState("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < posts.length - 1;

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

  const addComment = () => {
    if (!commentInput.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}`,
                  username: profile.username,
                  userId: "me",
                  avatar: profile.avatar,
                  text: commentInput.trim(),
                  timestamp: Date.now(),
                  replies: [],
                },
              ],
            }
          : p,
      ),
    );
    setCommentInput("");
  };

  const submitReply = (commentId: string) => {
    if (!replyInput.trim()) return;
    addCommentReply(post.id, commentId, {
      id: `r-${Date.now()}`,
      username: profile.username,
      userId: "me",
      avatar: profile.avatar,
      text: replyInput.trim(),
      timestamp: Date.now(),
    });
    setReplyInput("");
    setReplyingTo(null);
    setExpandedReplies((prev) => {
      const s = new Set(prev);
      s.add(commentId);
      return s;
    });
  };

  const engagementRate =
    post.views > 0
      ? (
          ((post.likes + post.comments.length + post.shares) / post.views) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="post.detail.modal"
        className="max-w-5xl w-full p-0 overflow-hidden"
        style={{
          background: "oklch(0.14 0.018 280)",
          border: "1px solid oklch(0.28 0.025 280 / 0.5)",
          maxHeight: "90vh",
        }}
      >
        <button
          type="button"
          data-ocid="post.detail.close_button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="flex flex-col md:flex-row"
          style={{ maxHeight: "90vh" }}
        >
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
            <img
              src={images[carouselIdx]}
              alt="post"
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: "90vh" }}
            />
            {isMultiImage && (
              <>
                {carouselIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setCarouselIdx((i) => i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {carouselIdx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCarouselIdx((i) => i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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
                <div className="absolute top-3 right-3 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                  {carouselIdx + 1}/{images.length}
                </div>
              </>
            )}
            {hasPrev && (
              <button
                type="button"
                data-ocid="post.detail.pagination_prev"
                onClick={() => {
                  onNavigate(posts[currentIndex - 1]);
                  setCarouselIdx(0);
                }}
                className="absolute left-3 bottom-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                data-ocid="post.detail.pagination_next"
                onClick={() => {
                  onNavigate(posts[currentIndex + 1]);
                  setCarouselIdx(0);
                }}
                className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div
            className="w-full md:w-96 flex flex-col"
            style={{ borderLeft: "1px solid oklch(0.25 0.025 280 / 0.4)" }}
          >
            <div
              className="flex items-center gap-3 p-4"
              style={{ borderBottom: "1px solid oklch(0.25 0.025 280 / 0.3)" }}
            >
              <button
                type="button"
                onClick={() => {
                  if (post.authorUserId) {
                    navigate("user-profile", { userId: post.authorUserId });
                    onClose();
                  }
                }}
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.authorUsername} · {timeAgo(post.timestamp)}
                  </p>
                </div>
              </button>
              {!isOwnPost && post.authorUserId && (
                <Button
                  size="sm"
                  data-ocid="post.detail.follow.button"
                  onClick={toggleFollow}
                  className={
                    isFollowing ? "" : "btn-gradient text-white border-none"
                  }
                  variant={isFollowing ? "outline" : "default"}
                  style={
                    isFollowing
                      ? { borderColor: "oklch(0.35 0.03 280 / 0.5)" }
                      : {}
                  }
                >
                  {isFollowing ? (
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

            <div
              className="p-4 text-sm"
              style={{ borderBottom: "1px solid oklch(0.25 0.025 280 / 0.3)" }}
            >
              <p className="text-foreground leading-relaxed mb-3">
                {post.caption}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Views", v: post.views.toLocaleString() },
                  { label: "Reach", v: post.reach.toLocaleString() },
                  { label: "Eng Rate", v: `${engagementRate}%` },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "oklch(0.7 0.2 295)" }}
                    >
                      {v}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              {(post.viralStage ?? 0) > 0 &&
                (() => {
                  const signal = getMomentumSignal(post.viralStage ?? 0);
                  if (!signal) return null;
                  const isHot = (post.viralStage ?? 0) >= 3;
                  return (
                    <div
                      className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mx-auto w-fit"
                      style={{
                        background: isHot
                          ? "linear-gradient(135deg, oklch(0.65 0.2 50 / 0.3), oklch(0.6 0.22 25 / 0.3))"
                          : "oklch(0.22 0.03 280 / 0.6)",
                        border: isHot
                          ? "1px solid oklch(0.65 0.2 50 / 0.5)"
                          : "1px solid oklch(0.35 0.03 280 / 0.4)",
                        color: isHot
                          ? "oklch(0.82 0.18 65)"
                          : "oklch(0.7 0.2 295)",
                      }}
                    >
                      <span>{isHot ? "U0001F525" : "U0001F4C8"}</span>
                      <span>{signal}</span>
                    </div>
                  );
                })()}
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (c.userId && c.userId !== "me") {
                          navigate("user-profile", { userId: c.userId });
                          onClose();
                        }
                      }}
                    >
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarImage src={c.avatar} />
                        <AvatarFallback>{c.username[0]}</AvatarFallback>
                      </Avatar>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (c.userId && c.userId !== "me") {
                              navigate("user-profile", { userId: c.userId });
                              onClose();
                            }
                          }}
                          className="text-xs font-semibold hover:underline"
                        >
                          {c.username}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {c.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(c.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingTo(replyingTo === c.id ? null : c.id)
                          }
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" /> Reply
                        </button>
                        {(c.replies?.length ?? 0) > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReplies((prev) => {
                                const s = new Set(prev);
                                if (s.has(c.id)) s.delete(c.id);
                                else s.add(c.id);
                                return s;
                              })
                            }
                            className="text-xs hover:text-foreground transition-colors"
                            style={{ color: "oklch(0.7 0.2 295)" }}
                          >
                            {expandedReplies.has(c.id)
                              ? "Hide"
                              : `${c.replies?.length} repl${c.replies?.length === 1 ? "y" : "ies"}`}
                          </button>
                        )}
                      </div>
                      {replyingTo === c.id && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder={`Reply to ${c.username}...`}
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && submitReply(c.id)
                            }
                            className="text-xs h-7"
                            style={{
                              background: "oklch(0.18 0.02 280 / 0.5)",
                              border: "1px solid oklch(0.3 0.025 280 / 0.4)",
                            }}
                          />
                          <Button
                            size="sm"
                            className="h-7 btn-gradient text-white border-none px-2"
                            onClick={() => submitReply(c.id)}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {expandedReplies.has(c.id) &&
                        c.replies &&
                        c.replies.length > 0 && (
                          <div
                            className="mt-2 ml-3 space-y-2 border-l-2 pl-3"
                            style={{
                              borderColor: "oklch(0.25 0.025 280 / 0.4)",
                            }}
                          >
                            {c.replies.map((r) => (
                              <div key={r.id} className="flex gap-2">
                                <Avatar className="w-5 h-5 flex-shrink-0">
                                  <AvatarImage src={r.avatar} />
                                  <AvatarFallback>
                                    {r.username[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-xs font-semibold">
                                    {r.username}{" "}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {r.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div
              className="p-4"
              style={{ borderTop: "1px solid oklch(0.25 0.025 280 / 0.3)" }}
            >
              <div className="flex items-center gap-4 mb-3">
                <button
                  type="button"
                  data-ocid="post.detail.like.button"
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 text-sm transition-all hover:scale-110 ${isLiked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"}`}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                  {post.likes.toLocaleString()}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <MessageCircle className="w-5 h-5" /> {post.comments.length}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-cyan-400 transition-all hover:scale-110"
                >
                  <Share2 className="w-5 h-5" /> {post.shares}
                </button>
                <button
                  type="button"
                  data-ocid="post.detail.save.button"
                  onClick={toggleSave}
                  className={`ml-auto flex items-center gap-1.5 text-sm transition-all hover:scale-110 ${isSaved ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
                  />
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  data-ocid="post.detail.comment.input"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  className="text-sm"
                  style={{
                    background: "oklch(0.18 0.02 280 / 0.5)",
                    border: "1px solid oklch(0.3 0.025 280 / 0.4)",
                  }}
                />
                <Button
                  data-ocid="post.detail.submit.button"
                  size="icon"
                  className="btn-gradient text-white border-none flex-shrink-0"
                  onClick={addComment}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
