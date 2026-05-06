import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  AI_CREATORS,
  generateAIComment,
  generateAIPost,
} from "../utils/aiInfluencers";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useAIInfluencers() {
  const { addSimulatedPost, setPosts, addNotification, followedUserIds } =
    useApp();
  const seededRef = useRef(false);
  const intervalsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const postsRef = useRef<{ id: string; title: string }[]>([]);

  // Seed 10 AI posts on mount
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    const shuffled = [...AI_CREATORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    shuffled.forEach((creator, i) => {
      const post = generateAIPost(creator, i);
      // Spread over last 12 hours
      post.timestamp = Date.now() - (10 - i) * 72 * 60 * 1000;
      post.id = `${creator.id}-seed-${i}`;
      const added = addSimulatedPost(post);
      if (added) {
        postsRef.current.push({
          id: added.id,
          title: post.caption.slice(0, 40),
        });
      }
    });
  }, [addSimulatedPost]);

  // Background intervals
  useEffect(() => {
    // 1. Post interval: every 20-40s, AI creator publishes a post
    function schedulePost() {
      const delay = randomBetween(20000, 40000);
      const t = setTimeout(() => {
        const creator =
          AI_CREATORS[Math.floor(Math.random() * AI_CREATORS.length)];
        const postIdx = Math.floor(Math.random() * 50);
        const post = generateAIPost(creator, postIdx);
        const added = addSimulatedPost(post);
        if (added) {
          postsRef.current.push({
            id: added.id,
            title: post.caption.slice(0, 40),
          });
          if (postsRef.current.length > 100) postsRef.current.shift();
        }
        schedulePost();
      }, delay);
      intervalsRef.current.push(t);
    }
    schedulePost();

    // 2. Comment interval: every 12-25s, AI creator comments on a recent post
    function scheduleComment() {
      const delay = randomBetween(12000, 25000);
      const t = setTimeout(() => {
        const creator =
          AI_CREATORS[Math.floor(Math.random() * AI_CREATORS.length)];
        const comment = generateAIComment(creator);
        setPosts((prev) => {
          if (prev.length === 0) return prev;
          // Pick a trending or recent post
          const pool = prev.filter(
            (p) => p.isTrending || p.timestamp > Date.now() - 3 * 3600 * 1000,
          );
          const target =
            pool.length > 0
              ? pool[Math.floor(Math.random() * pool.length)]
              : prev[0];
          return prev.map((p) => {
            if (p.id !== target.id) return p;
            const newComment = {
              id: `ai-comment-${Date.now()}-${Math.random()}`,
              username: creator.username,
              userId: creator.id,
              avatar: creator.avatar,
              text: comment,
              timestamp: Date.now(),
              replies: [],
            };
            return { ...p, comments: [...p.comments, newComment] };
          });
        });
        scheduleComment();
      }, delay);
      intervalsRef.current.push(t);
    }
    scheduleComment();

    // 3. Viral notification: every 50-80s
    function scheduleViralNotif() {
      const delay = randomBetween(50000, 80000);
      const t = setTimeout(() => {
        const creator =
          AI_CREATORS[Math.floor(Math.random() * AI_CREATORS.length)];
        const isFollowed = followedUserIds.has(creator.id);
        if (isFollowed || Math.random() < 0.3) {
          const views = randomBetween(50, 999);
          addNotification({
            icon: "🔥",
            message: `${creator.name} just went viral with ${views}K views!`,
            type: "viral",
          });
        }
        scheduleViralNotif();
      }, delay);
      intervalsRef.current.push(t);
    }
    scheduleViralNotif();

    // 4. Collab request: every 80-140s
    function scheduleCollabRequest() {
      const delay = randomBetween(80000, 140000);
      const t = setTimeout(() => {
        const creator =
          AI_CREATORS[Math.floor(Math.random() * AI_CREATORS.length)];
        const collabId = `collab-${Date.now()}`;
        addNotification({
          icon: "🤝",
          message: `${creator.name} wants to collaborate with you on a post! Accept?`,
          type: "collab_request",
          collabId,
          collabCreatorId: creator.id,
          collabCreatorName: creator.name,
          collabCreatorAvatar: creator.avatar,
        } as Parameters<typeof addNotification>[0]);
        scheduleCollabRequest();
      }, delay);
      intervalsRef.current.push(t);
    }
    scheduleCollabRequest();

    return () => {
      intervalsRef.current.forEach(clearTimeout);
      intervalsRef.current = [];
    };
  }, [addSimulatedPost, setPosts, addNotification, followedUserIds]);
}
