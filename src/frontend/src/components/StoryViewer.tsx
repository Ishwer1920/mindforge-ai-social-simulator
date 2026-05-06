import { Eye, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "../context/AppContext";
import { useApp } from "../context/AppContext";

interface Props {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
}

function formatCountdownFull(expiresAt: number): string {
  const remaining = Math.max(0, expiresAt - Date.now());
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  if (h === 0 && m === 0) return "Expiring soon";
  if (h === 0) return `Expires in ${m}m`;
  return `Expires in ${h}h ${m}m`;
}

export default function StoryViewer({ stories, startIndex, onClose }: Props) {
  const { reactToStory, replyToStory, profile } = useApp();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [, forceUpdate] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const storiesLenRef = useRef(stories.length);
  currentIndexRef.current = currentIndex;
  storiesLenRef.current = stories.length;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Update countdown every 30s
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const DURATION = 5000;

  const goNext = useCallback(() => {
    if (currentIndexRef.current < storiesLenRef.current - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onCloseRef.current();
    }
  }, []);

  const goPrev = useCallback(() => {
    if (currentIndexRef.current > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentIndex triggers interval reset intentionally
  useEffect(() => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = (elapsed / DURATION) * 100;
      if (pct >= 100) {
        goNext();
      } else {
        setProgress(pct);
      }
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, goNext]);

  const story = stories[currentIndex];
  if (!story) return null;

  const isOwn = story.userId === "me";
  const expiresAt = story.expiresAt ?? story.createdAt + 24 * 60 * 60 * 1000;
  const viewRate = story.viewRate ?? 0;
  const performanceDelta = story.performanceDelta ?? 0;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyToStory(story.id, replyText.trim());
    setReplyText("");
  };

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goPrev();
    else if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ")
      goNext();
  };

  const recentReplies = (story.replies ?? []).slice(-2);

  return (
    <div
      data-ocid="story.viewer.panel"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.97)" }}
    >
      <div
        className="relative w-full max-w-sm flex flex-col"
        style={{ height: "100dvh", maxHeight: "100dvh" }}
      >
        {/* Progress bars */}
        <div className="flex gap-1 px-4 pt-3 pb-1 absolute top-0 left-0 right-0 z-10">
          {stories.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              <div
                className="h-full rounded-full transition-none"
                style={{
                  background: "white",
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 pt-8 pb-3 absolute top-0 left-0 right-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
          }}
        >
          <img
            src={story.avatar}
            alt=""
            className="w-9 h-9 rounded-full border-2"
            style={{ borderColor: "rgba(255,255,255,0.5)" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {story.username}
            </p>
            <p className="text-white/60 text-xs">
              {formatCountdownFull(expiresAt)}
            </p>
          </div>
          <button
            type="button"
            data-ocid="story.viewer.close_button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Story content — tap left/right halves */}
        <button
          type="button"
          className="flex-1 relative w-full"
          aria-label="Tap to navigate story"
          style={{ background: "none", border: "none", padding: 0 }}
          onClick={(e) => {
            const rect = (
              e.currentTarget as HTMLButtonElement
            ).getBoundingClientRect();
            if (e.clientX < rect.left + rect.width / 2) goPrev();
            else goNext();
          }}
          onKeyDown={handleImageKeyDown}
        >
          {story.storyType === "text" ||
          (!story.imageUrl && story.textContent) ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  story.bgColor ?? "linear-gradient(135deg, #7c3aed, #4f46e5)",
                borderRadius: 12,
              }}
            >
              <p
                className="text-white text-2xl font-bold text-center px-8"
                style={{
                  lineHeight: 1.4,
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {story.textContent}
              </p>
            </div>
          ) : (
            <img
              src={story.imageUrl}
              alt="story"
              className="w-full h-full object-cover"
              style={{ borderRadius: 12 }}
            />
          )}
        </button>

        {/* Performance hint — own stories only */}
        {isOwn && (
          <div
            className="absolute px-4 py-2 left-0 right-0"
            style={{ bottom: 180 }}
          >
            <div
              className="rounded-xl px-3 py-2 text-sm"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              {viewRate > 35
                ? `🔥 Performing well (+${Math.abs(performanceDelta).toFixed(0)}% vs avg)`
                : viewRate > 15
                  ? "📈 Gaining traction"
                  : "⚠️ Low engagement on this story"}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4 space-y-3"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 60%, transparent)",
          }}
        >
          {/* Metrics row */}
          <div className="flex items-center gap-3 text-white/80 text-xs">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{(story.viewCount ?? 0).toLocaleString()} views</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
            <span>
              Viewed by {(story.viewRate ?? 0).toFixed(1)}% of followers
            </span>
          </div>

          {/* Reactions row */}
          <div className="flex items-center gap-2">
            {(["fire", "heart", "laugh"] as const).map((reaction) => {
              const emojis = { fire: "🔥", heart: "❤️", laugh: "😂" };
              const count = story.reactions?.[reaction] ?? 0;
              const isActive = story.userReaction === reaction;
              return (
                <button
                  key={reaction}
                  type="button"
                  onClick={() => reactToStory(story.id, reaction)}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition-all"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.1)",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.5)"
                      : "1px solid rgba(255,255,255,0.15)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <span>{emojis[reaction]}</span>
                  <span className="text-white/80 text-xs">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Recent replies */}
          {recentReplies.length > 0 && (
            <div className="space-y-1">
              {recentReplies.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <img
                    src={r.avatar}
                    alt=""
                    className="w-5 h-5 rounded-full flex-shrink-0"
                  />
                  <span className="text-white/70 text-xs truncate">
                    <span className="font-semibold text-white/90">
                      {r.username}
                    </span>{" "}
                    {r.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          <div className="flex items-center gap-2">
            <img
              src={profile.avatar}
              alt=""
              className="w-7 h-7 rounded-full flex-shrink-0"
            />
            <input
              data-ocid="story.reply.input"
              type="text"
              placeholder="Reply to story..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              className="flex-1 rounded-full px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
              }}
            />
            <button
              type="button"
              data-ocid="story.reply.submit_button"
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
