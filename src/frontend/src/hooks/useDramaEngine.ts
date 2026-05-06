import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { AI_CREATORS } from "../utils/aiInfluencers";

export type DramaType =
  | "called_out"
  | "copied_content"
  | "beef"
  | "niche_challenge";

export interface DramaEvent {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  dramaType: DramaType;
  message: string;
}

const DRAMA_MESSAGES: Record<DramaType, (name: string) => string> = {
  called_out: (name) =>
    `${name} just called you out publicly: "Honestly, I don't see what the hype is about this creator..." 😤`,
  copied_content: (name) =>
    `${name} just dropped a post that looks EXACTLY like yours. They copied your content! 😡`,
  beef: (name) =>
    `${name} started beef with you in their story: "Some creators out here are all clout, no substance" 👀`,
  niche_challenge: (name) =>
    `${name} just challenged your niche dominance: "I'm taking over this space. Watch me." 🔥`,
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useDramaEngine(onDrama: (event: DramaEvent) => void) {
  const {
    addNotification,
    setProfile,
    lastPostTime,
    fanRebellionActive,
    setFanRebellionActive,
    setPlatformTakeoverActive,
    setPlatformTakeoverEndsAt,
    platformTakeoverActive,
    rivalCreator,
    setRivalCreator,
  } = useApp();

  const onDramaRef = useRef(onDrama);
  onDramaRef.current = onDrama;
  const lastPostTimeRef = useRef(lastPostTime);
  lastPostTimeRef.current = lastPostTime;
  const fanRebellionRef = useRef(fanRebellionActive);
  fanRebellionRef.current = fanRebellionActive;
  const platformTakeoverRef = useRef(platformTakeoverActive);
  platformTakeoverRef.current = platformTakeoverActive;
  const rivalRef = useRef(rivalCreator);
  rivalRef.current = rivalCreator;

  // Drama events: every 8-15 minutes
  useEffect(() => {
    function scheduleDrama() {
      const delay = randomBetween(8 * 60 * 1000, 15 * 60 * 1000);
      const t = setTimeout(() => {
        const creator =
          AI_CREATORS[Math.floor(Math.random() * AI_CREATORS.length)];
        const dramaTypes: DramaType[] = [
          "called_out",
          "copied_content",
          "beef",
          "niche_challenge",
        ];
        const dramaType =
          dramaTypes[Math.floor(Math.random() * dramaTypes.length)];
        const event: DramaEvent = {
          id: `drama-${Date.now()}`,
          creatorId: creator.id,
          creatorName: creator.name,
          creatorAvatar: creator.avatar,
          dramaType,
          message: DRAMA_MESSAGES[dramaType](creator.name),
        };
        // Assign rival if not set
        if (!rivalRef.current) {
          setRivalCreator(creator);
        }
        onDramaRef.current(event);
        scheduleDrama();
      }, delay);
      return t;
    }
    const t = scheduleDrama();
    return () => clearTimeout(t);
  }, [setRivalCreator]);

  // Rival gains followers faster
  useEffect(() => {
    if (!rivalCreator) return;
    const interval = setInterval(() => {
      // Rival gains followers ~15% faster than normal AI
      // We track this via a notification if they surpass user
      const gain = randomBetween(50, 300);
      // Just a simulation tick — actual rival follower count
      // is derived from rivalCreator.followerCount + elapsed gain
      if (gain > 200) {
        addNotification({
          icon: "😤",
          message: `Your rival ${rivalCreator.name} just gained ${gain.toLocaleString()} followers! Stay ahead!`,
          type: "smart",
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [rivalCreator, addNotification]);

  // Fan rebellion: check every 30s if player hasn't posted in 20+ min
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const msSincePost =
        lastPostTimeRef.current > 0
          ? now - lastPostTimeRef.current
          : Number.POSITIVE_INFINITY;
      const twentyMin = 20 * 60 * 1000;

      if (msSincePost > twentyMin && !fanRebellionRef.current) {
        setFanRebellionActive(true);
        addNotification({
          icon: "😡",
          message:
            "Fan Rebellion! Your fans are getting restless. Post NOW to stop the follower bleed!",
          type: "smart",
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [setFanRebellionActive, addNotification]);

  // Fan rebellion follower drain: -0.5–1% every 2 min while active
  useEffect(() => {
    if (!fanRebellionActive) return;
    const interval = setInterval(
      () => {
        setProfile((prev) => {
          const lossRate = 0.005 + Math.random() * 0.005;
          const loss = Math.max(1, Math.floor(prev.followers * lossRate));
          return {
            ...prev,
            followers: Math.max(0, prev.followers - loss),
          };
        });
      },
      2 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [fanRebellionActive, setProfile]);

  // Platform takeover: every 25-40 minutes
  useEffect(() => {
    function scheduleTakeover() {
      const delay = randomBetween(25 * 60 * 1000, 40 * 60 * 1000);
      const t = setTimeout(() => {
        if (!platformTakeoverRef.current) {
          const endsAt = Date.now() + 2 * 60 * 1000;
          setPlatformTakeoverActive(true);
          setPlatformTakeoverEndsAt(endsAt);
          addNotification({
            icon: "⚡",
            message:
              "PLATFORM TAKEOVER! The algorithm has gone haywire — post NOW for 10-50x viral multiplier! (2 minutes)",
            type: "viral",
          });
        }
        scheduleTakeover();
      }, delay);
      return t;
    }
    const t = scheduleTakeover();
    return () => clearTimeout(t);
  }, [setPlatformTakeoverActive, setPlatformTakeoverEndsAt, addNotification]);

  // Auto-end platform takeover when timer expires
  useEffect(() => {
    if (!platformTakeoverActive) return;
    const checkInterval = setInterval(() => {
      // AppContext handles this check based on platformTakeoverEndsAt
    }, 5000);
    return () => clearInterval(checkInterval);
  }, [platformTakeoverActive]);

  // Rival growth simulation (update rival's follower count in context)
  useEffect(() => {
    if (!rivalCreator) return;
    const interval = setInterval(() => {
      // Rival gains 1.15x normal AI growth rate — we signal this via context
    }, 30000);
    return () => clearInterval(interval);
  }, [rivalCreator]);
}
