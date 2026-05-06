import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export interface AlgoHack {
  type: string;
  condition: string;
  multiplier: number;
  expiresAt: number;
}

export interface AlgoHackHistoryItem {
  type: string;
  condition: string;
  multiplier: number;
  firedAt: number;
  postsBoosted: number;
  extraReach: number;
}

const HACK_TEMPLATES: Array<{
  type: string;
  condition: string;
  multiplier: number;
  durationMs: number;
}> = [
  {
    type: "Video Boost",
    condition: "video",
    multiplier: 3,
    durationMs: 30 * 60 * 1000,
  },
  {
    type: "Hashtag Surge",
    condition: "hashtags3",
    multiplier: 2,
    durationMs: 45 * 60 * 1000,
  },
  {
    type: "Carousel Amplify",
    condition: "carousel",
    multiplier: 2.5,
    durationMs: 20 * 60 * 1000,
  },
  {
    type: "Text Power",
    condition: "text_only",
    multiplier: 2,
    durationMs: 60 * 60 * 1000,
  },
  {
    type: "Collab Boost",
    condition: "collab",
    multiplier: 3,
    durationMs: 30 * 60 * 1000,
  },
];

const CONDITION_LABELS: Record<string, string> = {
  video: "video posts",
  hashtags3: "posts with 3+ hashtags",
  carousel: "carousel posts (3+ images)",
  text_only: "text-only posts",
  collab: "posts mentioning a collab",
};

export function getHackLabel(condition: string): string {
  return CONDITION_LABELS[condition] ?? condition;
}

export function matchesHackCondition(
  condition: string,
  caption: string,
  imageCount: number,
): boolean {
  switch (condition) {
    case "video":
      return (
        caption.toLowerCase().includes("video") ||
        caption.toLowerCase().includes("reel")
      );
    case "hashtags3": {
      const tags = (caption.match(/#\w+/g) ?? []).length;
      return tags >= 3;
    }
    case "carousel":
      return imageCount >= 3;
    case "text_only":
      return imageCount === 0;
    case "collab":
      return (
        caption.toLowerCase().includes("collab") ||
        caption.toLowerCase().includes("ft.") ||
        caption.toLowerCase().includes("featuring")
      );
    default:
      return false;
  }
}

export function useAlgoHackEngine() {
  const {
    activeAlgoHack,
    setActiveAlgoHack,
    algoHackHistory,
    setAlgoHackHistory,
    activePlatformEvent,
  } = useApp();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire hacks on a random interval (20-40 min, halved during platform events)
  useEffect(() => {
    function scheduleNextHack() {
      const base = 20 * 60 * 1000;
      const spread = 20 * 60 * 1000;
      const multiplier = activePlatformEvent ? 0.5 : 1;
      const delay = (base + Math.random() * spread) * multiplier;

      timerRef.current = setTimeout(() => {
        const template =
          HACK_TEMPLATES[Math.floor(Math.random() * HACK_TEMPLATES.length)];
        const hack: AlgoHack = {
          type: template.type,
          condition: template.condition,
          multiplier: template.multiplier,
          expiresAt: Date.now() + template.durationMs,
        };
        setActiveAlgoHack(hack);
        const label = getHackLabel(template.condition);
        const mins = Math.round(template.durationMs / 60000);
        toast(
          `🔓 Algorithm Leaked! ${template.multiplier}x reach on ${label} for ${mins} min!`,
          {
            duration: 8000,
          },
        );
        scheduleNextHack();
      }, delay);
    }
    scheduleNextHack();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activePlatformEvent, setActiveAlgoHack]);

  // Auto-expire active hack
  useEffect(() => {
    if (!activeAlgoHack) return;
    const remaining = activeAlgoHack.expiresAt - Date.now();
    if (remaining <= 0) {
      setActiveAlgoHack(null);
      return;
    }
    expiryTimerRef.current = setTimeout(() => {
      setActiveAlgoHack(null);
      toast("⏰ Algorithm hack expired. Stay alert for the next leak!", {
        duration: 4000,
      });
    }, remaining);
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [activeAlgoHack, setActiveAlgoHack]);

  return { activeAlgoHack, algoHackHistory, setAlgoHackHistory };
}
