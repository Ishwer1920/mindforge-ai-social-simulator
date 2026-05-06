import { Plus, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Story } from "../context/AppContext";

interface Props {
  onStoryClick: (story: Story, index: number) => void;
}

function getBestPostingTime(): string {
  const hour = new Date().getHours();
  if (hour >= 18 && hour <= 22) return "Now is great!";
  if (hour >= 12 && hour <= 17) return "7 PM";
  return "7 PM";
}

function formatCountdown(expiresAt: number): string {
  const remaining = Math.max(0, expiresAt - Date.now());
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  if (h === 0 && m === 0) return "Expiring";
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

interface StoryRingProps {
  expiresAt: number;
  viewed: boolean;
  size?: number;
}

function StoryRing({ expiresAt, viewed, size = 68 }: StoryRingProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalDuration = 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, expiresAt - Date.now());
  const fraction = remaining / totalDuration;
  const dashOffset = circumference * (1 - fraction);

  if (viewed) {
    return (
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        <title>Story progress ring</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.35 0.02 280)"
          strokeWidth={2.5}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      <title>Story time remaining</title>
      <defs>
        <linearGradient id="story-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.65 0.2 50)" />
          <stop offset="50%" stopColor="oklch(0.6 0.22 295)" />
          <stop offset="100%" stopColor="oklch(0.6 0.2 210)" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="oklch(0.28 0.02 280)"
        strokeWidth={2.5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#story-ring-grad)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

const TEXT_BG_OPTIONS = [
  { label: "Purple", value: "linear-gradient(135deg, #7c3aed, #4f46e5)" },
  { label: "Sunset", value: "linear-gradient(135deg, #f97316, #ec4899)" },
  { label: "Ocean", value: "linear-gradient(135deg, #0ea5e9, #6366f1)" },
  { label: "Forest", value: "linear-gradient(135deg, #16a34a, #0d9488)" },
  { label: "Rose", value: "linear-gradient(135deg, #e11d48, #f59e0b)" },
  { label: "Dark", value: "linear-gradient(135deg, #1e1b4b, #312e81)" },
];

export default function StoryBar({ onStoryClick }: Props) {
  const { profile, stories, addStory } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [selectedBg, setSelectedBg] = useState(TEXT_BG_OPTIONS[0].value);
  const [, forceUpdate] = useState(0);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddImageStory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const now = Date.now();
      addStory({
        id: `story-${now}`,
        userId: "me",
        username: profile.username,
        avatar: profile.avatar,
        imageUrl: ev.target?.result as string,
        storyType: "image",
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
        viewCount: 0,
        viewRate: 0,
        retentionScore: 50 + Math.floor(Math.random() * 30),
        peakReached: false,
        performanceDelta: 0,
        viewed: false,
        reactions: { fire: 0, heart: 0, laugh: 0 },
        userReaction: null,
        replies: [],
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddTextStory = () => {
    if (!textContent.trim()) return;
    const now = Date.now();
    addStory({
      id: `story-${now}`,
      userId: "me",
      username: profile.username,
      avatar: profile.avatar,
      imageUrl: "",
      textContent: textContent.trim(),
      storyType: "text",
      bgColor: selectedBg,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
      viewCount: 0,
      viewRate: 0,
      retentionScore: 50 + Math.floor(Math.random() * 30),
      peakReached: false,
      performanceDelta: 0,
      viewed: false,
      reactions: { fire: 0, heart: 0, laugh: 0 },
      userReaction: null,
      replies: [],
    });
    setTextContent("");
    setSelectedBg(TEXT_BG_OPTIONS[0].value);
    setShowTextModal(false);
  };

  // Group stories by userId, show one per user (latest)
  const storyMap = new Map<string, Story>();
  for (const s of stories) {
    if (
      !storyMap.has(s.userId) ||
      s.createdAt > (storyMap.get(s.userId)?.createdAt ?? 0)
    ) {
      storyMap.set(s.userId, s);
    }
  }
  const uniqueStories = Array.from(storyMap.values());
  const bestTime = getBestPostingTime();

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span
          className="text-xs font-medium"
          style={{ color: "oklch(0.7 0.1 295)" }}
        >
          📸 Stories
        </span>
        <span className="text-[10px]" style={{ color: "oklch(0.55 0.05 280)" }}>
          Best time: {bestTime}
        </span>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Add image story */}
        <div className="flex-shrink-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddImageStory}
          />
          <button
            type="button"
            data-ocid="story.add.button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="relative" style={{ width: 68, height: 68 }}>
              <img
                src={profile.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover opacity-60"
                style={{
                  background: "oklch(0.18 0.02 280)",
                  border: "2px dashed oklch(0.45 0.15 295 / 0.6)",
                }}
              />
              <div
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 240))",
                }}
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-16 text-center truncate">
              Photo
            </span>
          </button>
        </div>

        {/* Add text story */}
        <div className="flex-shrink-0">
          <button
            type="button"
            data-ocid="story.text.button"
            onClick={() => setShowTextModal(true)}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 68,
                height: 68,
                background:
                  "linear-gradient(135deg, oklch(0.28 0.08 295), oklch(0.22 0.05 240))",
                border: "2px dashed oklch(0.45 0.15 295 / 0.6)",
              }}
            >
              <Type
                className="w-5 h-5"
                style={{ color: "oklch(0.7 0.15 295)" }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-16 text-center truncate">
              Text
            </span>
          </button>
        </div>

        {/* Story bubbles */}
        {uniqueStories.map((story, idx) => {
          const isOwn = story.userId === "me";
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onStoryClick(story, idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="relative" style={{ width: 68, height: 68 }}>
                <StoryRing
                  expiresAt={
                    story.expiresAt ?? story.createdAt + 24 * 60 * 60 * 1000
                  }
                  viewed={story.viewed}
                />
                <img
                  src={
                    story.storyType === "text" && !story.imageUrl
                      ? story.avatar
                      : story.imageUrl || story.avatar
                  }
                  alt={story.username}
                  className="absolute rounded-full object-cover"
                  style={{
                    inset: 4,
                    width: "calc(100% - 8px)",
                    height: "calc(100% - 8px)",
                    background: story.bgColor ?? "oklch(0.15 0.018 280)",
                  }}
                />
                {story.storyType === "text" && !story.imageUrl && (
                  <div
                    className="absolute rounded-full flex items-center justify-center"
                    style={{
                      inset: 4,
                      background: story.bgColor,
                    }}
                  >
                    <span className="text-white text-[9px] font-bold px-1 text-center leading-tight line-clamp-2">
                      {story.textContent?.slice(0, 20)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground w-16 text-center truncate">
                {isOwn
                  ? formatCountdown(
                      story.expiresAt ?? story.createdAt + 24 * 60 * 60 * 1000,
                    )
                  : story.username.replace("@", "")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Text story modal */}
      {showTextModal && (
        <div
          data-ocid="story.text.modal"
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowTextModal(false)
          }
          onKeyDown={(e) => e.key === "Escape" && setShowTextModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 space-y-4"
            style={{
              background: "oklch(0.14 0.02 280)",
              border: "1px solid oklch(0.25 0.03 280 / 0.5)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                Create Text Story
              </span>
              <button
                type="button"
                data-ocid="story.text.close_button"
                onClick={() => setShowTextModal(false)}
                className="text-muted-foreground text-sm"
              >
                Cancel
              </button>
            </div>

            {/* Preview */}
            <div
              className="w-full rounded-2xl flex items-center justify-center"
              style={{ height: 120, background: selectedBg }}
            >
              <p className="text-white text-sm font-medium text-center px-4">
                {textContent || "Your text here..."}
              </p>
            </div>

            {/* Color picker */}
            <div className="flex gap-2 flex-wrap">
              {TEXT_BG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedBg(opt.value)}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    background: opt.value,
                    outline:
                      selectedBg === opt.value ? "2px solid white" : "none",
                    outlineOffset: "2px",
                    transform:
                      selectedBg === opt.value ? "scale(1.2)" : "scale(1)",
                  }}
                  title={opt.label}
                />
              ))}
            </div>

            {/* Text input */}
            <textarea
              data-ocid="story.text.textarea"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value.slice(0, 150))}
              placeholder="Write something... (max 150 chars)"
              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none"
              style={{
                background: "oklch(0.18 0.02 280)",
                border: "1px solid oklch(0.3 0.025 280 / 0.5)",
                color: "oklch(0.9 0.01 260)",
                minHeight: 72,
              }}
              rows={3}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {textContent.length}/150
            </p>

            <button
              type="button"
              data-ocid="story.text.submit_button"
              onClick={handleAddTextStory}
              disabled={!textContent.trim()}
              className="w-full py-3 rounded-2xl font-semibold text-white transition-opacity disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 240))",
              }}
            >
              Post Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
