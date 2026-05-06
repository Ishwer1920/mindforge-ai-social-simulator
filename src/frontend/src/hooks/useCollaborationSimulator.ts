import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { PLATFORM_EVENTS } from "../context/AppContext";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useCollaborationSimulator() {
  const {
    setCompetitions,
    setActivePlatformEvent,
    shadowBan,
    setShadowBan,
    addNotification,
    posts,
    setWeeklyChallenges,
    profile,
    sessionStartFollowers,
  } = useApp();

  const eventIndexRef = useRef(0);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  // 1. Competition leaderboard score updates — every 15s
  useEffect(() => {
    const id = setInterval(() => {
      setCompetitions((prev) =>
        prev.map((comp) => ({
          ...comp,
          leaderboard: comp.leaderboard
            .map((entry) => {
              if (entry.userId === "user") {
                // User's score grows based on their post engagement
                const bonus = randomBetween(500, 3000);
                return { ...entry, score: entry.score + bonus };
              }
              // AI entries grow randomly
              const growth = randomBetween(1000, 8000);
              return { ...entry, score: entry.score + growth };
            })
            .sort((a, b) => b.score - a.score),
        })),
      );
    }, 15000);
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, [setCompetitions]);

  // 2. Platform event rotation — every 8 minutes
  useEffect(() => {
    const id = setInterval(
      () => {
        eventIndexRef.current =
          (eventIndexRef.current + 1) % PLATFORM_EVENTS.length;
        const newEvent = PLATFORM_EVENTS[eventIndexRef.current];
        setActivePlatformEvent(newEvent);
        addNotification({
          icon: "🎉",
          message: `Platform Event: ${newEvent.label}`,
          type: "event",
        });
      },
      8 * 60 * 1000,
    );
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, [setActivePlatformEvent, addNotification]);

  // 3. Shadow ban recovery — check every 10s
  useEffect(() => {
    const id = setInterval(() => {
      if (shadowBan.active && Date.now() >= shadowBan.endsAt) {
        setShadowBan({ active: false, endsAt: 0 });
        addNotification({
          icon: "✅",
          message: "Your shadow ban has been lifted! Reach is back to normal.",
          type: "shadow_ban",
        });
      }
    }, 10000);
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, [shadowBan, setShadowBan, addNotification]);

  // 4. Weekly challenge progress updates — every 5s
  useEffect(() => {
    const id = setInterval(() => {
      const maxPostViews = posts.reduce((max, p) => Math.max(max, p.views), 0);
      const hasTrendingPost = posts.some((p) => p.isTrending);
      const followerGain = Math.max(
        0,
        profile.followers - sessionStartFollowers,
      );

      setWeeklyChallenges((prev) =>
        prev.map((ch) => {
          if (ch.completed) return ch;
          let current = ch.current;
          switch (ch.id) {
            case "ch-followers":
              current = followerGain;
              break;
            case "ch-explore":
              current = hasTrendingPost ? 1 : 0;
              break;
            case "ch-views":
              current = maxPostViews;
              break;
            case "ch-hashtag":
              // Mark complete if any user post has trending hashtag
              current = posts.some(
                (p) =>
                  p.isTrending &&
                  (p.authorUsername === profile.username ||
                    p.authorUsername === "@alexrivera"),
              )
                ? 1
                : 0;
              break;
          }
          const completed = current >= ch.target;
          if (completed && !ch.completed) {
            addNotification({
              icon: "🏆",
              message: `Weekly challenge complete: ${ch.title}! Claim your reward!`,
              type: "challenge",
            });
          }
          return { ...ch, current, completed };
        }),
      );
    }, 5000);
    intervalsRef.current.push(id);
    return () => clearInterval(id);
  }, [
    posts,
    profile,
    sessionStartFollowers,
    setWeeklyChallenges,
    addNotification,
  ]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      for (const id of intervalsRef.current) clearInterval(id);
    };
  }, []);
}
