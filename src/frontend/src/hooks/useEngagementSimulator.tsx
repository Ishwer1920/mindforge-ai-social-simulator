import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { SAMPLE_COMMENTS, useApp } from "../context/AppContext";

const CPM_BY_NICHE: Record<string, number> = {
  Tech: 7,
  Finance: 7,
  Education: 4,
  Fitness: 5,
  Travel: 5,
  Comedy: 3.5,
  Fashion: 3.5,
  Gaming: 3.5,
  Memes: 2,
  Food: 2,
};

export function useEngagementSimulator() {
  const {
    posts,
    setPosts,
    addNotification,
    setProfile,
    setAchievements,
    setAnalyticsData,
    setMonetization,
    profile,
    achievements,
    skills,
  } = useApp();
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const achievementsRef = useRef(achievements);
  achievementsRef.current = achievements;
  const skillsRef = useRef(skills);
  skillsRef.current = skills;

  // Engagement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const followers = profileRef.current.followers;
      const niche = profileRef.current.niche || "Tech";
      const cpm = CPM_BY_NICHE[niche] ?? 3.5;

      setPosts((prev) => {
        const updated = prev.map((post) => {
          const ageMs = Date.now() - post.timestamp;
          const ageMin = ageMs / 60000;

          let viewerBase: number;
          if (ageMin < 2) {
            viewerBase = Math.floor(
              (followers * (0.1 + Math.random() * 0.1)) / 40,
            );
          } else if (ageMin < 10) {
            const expansionMult = post.engagementScore > 200 ? 1.5 : 0.7;
            viewerBase = Math.floor(((followers * 0.05) / 160) * expansionMult);
          } else {
            if (post.isTrending) {
              viewerBase = Math.floor(followers * 0.002 * (1 + Math.random()));
            } else {
              viewerBase = Math.floor(followers * 0.0005);
            }
          }
          viewerBase = Math.max(1, viewerBase);

          const newLikeDelta = Math.floor(
            viewerBase * (0.06 + Math.random() * 0.04),
          );
          const newCommentDelta =
            Math.random() < 0.35
              ? Math.floor(viewerBase * (0.005 + Math.random() * 0.015))
              : 0;
          const newShareDelta =
            Math.random() < 0.25
              ? Math.floor(viewerBase * (0.002 + Math.random() * 0.008))
              : 0;

          const newLikes = post.likes + newLikeDelta;
          const newShares = post.shares + newShareDelta;
          const newViews = post.views + viewerBase;
          const newReach = post.reach + Math.floor(viewerBase * 0.7);
          const newImpressions =
            post.impressions + Math.floor(viewerBase * 1.2);

          const addedComments =
            newCommentDelta > 0
              ? Array.from(
                  { length: Math.min(newCommentDelta, 2) },
                  (_, i) => ({
                    id: `c-${Date.now()}-${post.id}-${i}`,
                    username: [
                      "@samchen",
                      "@miatorres",
                      "@jordankim",
                      "@rileylee",
                      "@alexk",
                      "@jessw",
                    ][Math.floor(Math.random() * 6)],
                    userId: ["1", "2", "3", "4", "5", "6"][
                      Math.floor(Math.random() * 6)
                    ],
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.floor(Math.random() * 100)}`,
                    text: SAMPLE_COMMENTS[
                      Math.floor(Math.random() * SAMPLE_COMMENTS.length)
                    ],
                    timestamp: Date.now(),
                    replies: [],
                  }),
                )
              : [];
          const newComments = [...post.comments, ...addedComments];

          // Apply skill multipliers
          const skillQuality = skillsRef.current.contentQuality;
          const skillEngagement = skillsRef.current.engagementBoost;
          const skillViral = skillsRef.current.viralChance;
          const contentMult = 1 + (skillQuality - 1) * 0.15;
          const engageMult = 1 + (skillEngagement - 1) * 0.1;
          const boostedLikes = Math.floor(newLikes * engageMult);
          const boostedShares = Math.floor(newShares * engageMult);
          const viralThresholdReduction = (skillViral - 1) * 0.05;
          const newScore =
            boostedLikes + newComments.length * 2 + boostedShares * 3;
          const isNowViralThreshold = Math.max(
            0.3,
            0.5 - viralThresholdReduction,
          );
          const wasViral = post.isTrending;
          const isNowViral =
            newScore > 500 ||
            (newScore > 300 && Math.random() < isNowViralThreshold - 0.3);

          const followersFromShares =
            newShareDelta * (0.5 + Math.random() * 0.5);
          const followersFromComments =
            newCommentDelta * (0.1 + Math.random() * 0.2);
          const followersFromLikes =
            newLikeDelta * (0.01 + Math.random() * 0.04);
          const followersGainedDelta = Math.floor(
            followersFromShares + followersFromComments + followersFromLikes,
          );

          if (followersGainedDelta > 0) {
            setProfile((p) => ({
              ...p,
              followers: p.followers + followersGainedDelta,
              xp: p.xp + followersGainedDelta,
            }));
            setAnalyticsData((a) => ({
              ...a,
              followersGainedToday:
                a.followersGainedToday + followersGainedDelta,
            }));
            if (followersGainedDelta >= 5) {
              addNotification({
                icon: "🚀",
                message: `You gained ${followersGainedDelta} new followers from "${post.caption.slice(0, 30)}..."`,
                type: "follower_gain",
              });
            }
          }

          // Ad revenue drip
          const earned = ((viewerBase * cpm) / 1000) * 0.01;
          if (earned > 0) {
            setMonetization((prev) => ({
              ...prev,
              adRevenue: prev.adRevenue + earned,
              totalEarnings: prev.totalEarnings + earned,
              dailyEarnings: prev.dailyEarnings.map((v, i) =>
                i === prev.dailyEarnings.length - 1 ? v + earned : v,
              ),
            }));
          }

          if (!wasViral && isNowViral) {
            addNotification({
              icon: "🔥",
              message: `Your post "${post.caption.slice(0, 30)}..." is going viral! 🔥`,
              type: "viral",
            });
            toast("🔥 Your post is going viral!", { duration: 4000 });
            setAchievements((ach) =>
              ach.map((a) =>
                a.id === "a9"
                  ? { ...a, unlocked: true, unlockedAt: Date.now() }
                  : a,
              ),
            );
          }

          return {
            ...post,
            likes: Math.floor(newLikes * engageMult),
            comments: newComments,
            shares: Math.floor(newShares * engageMult),
            views: newViews,
            reach: Math.floor(newReach * contentMult),
            impressions: newImpressions,
            followersGained: post.followersGained + followersGainedDelta,
            engagementScore: newScore,
            isTrending: isNowViral,
          };
        });

        setAnalyticsData((a) => {
          const topPost = updated.reduce(
            (best, p) => (p.engagementScore > best.engagementScore ? p : best),
            updated[0],
          );
          return {
            ...a,
            totalLikesToday: a.totalLikesToday + Math.floor(Math.random() * 8),
            totalCommentsToday:
              a.totalCommentsToday + (Math.random() < 0.4 ? 1 : 0),
            engagementRate: Math.min(
              25,
              a.engagementRate + (Math.random() * 0.15 - 0.05),
            ),
            postEngagement: updated.map((p) => ({
              label: `${p.caption.slice(0, 18)}...`,
              likes: p.likes,
              comments: p.comments.length,
            })),
            topPostId: topPost?.id ?? null,
          };
        });

        if (Math.random() < 0.3) {
          const users = ["@samchen", "@miatorres", "@jordankim", "@rileylee"];
          const u = users[Math.floor(Math.random() * users.length)];
          if (Math.random() < 0.5) {
            addNotification({
              icon: "❤️",
              message: `${u} liked your post`,
              type: "like",
            });
          } else {
            addNotification({
              icon: "💬",
              message: `${u} commented: "${SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)]}"`,
              type: "comment",
            });
          }
        }

        const currentFollowers = profileRef.current.followers;
        const currentAchievements = achievementsRef.current;
        const updatesNeeded: string[] = [];
        if (
          currentFollowers >= 10000 &&
          !currentAchievements.find((a) => a.id === "a8")?.unlocked
        )
          updatesNeeded.push("a8");
        if (
          currentFollowers >= 5000 &&
          !currentAchievements.find((a) => a.id === "a7")?.unlocked
        )
          updatesNeeded.push("a7");
        if (updatesNeeded.length > 0) {
          setAchievements((ach) =>
            ach.map((a) =>
              updatesNeeded.includes(a.id)
                ? { ...a, unlocked: true, unlockedAt: Date.now() }
                : a,
            ),
          );
        }

        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [
    setPosts,
    addNotification,
    setProfile,
    setAchievements,
    setAnalyticsData,
    setMonetization,
  ]);

  // Follower growth chart update
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData((a) => {
        const current = profileRef.current.followers;
        return {
          ...a,
          followerGrowth: [...a.followerGrowth.slice(-6), current],
        };
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [setAnalyticsData]);

  // Fan tips simulation
  useEffect(() => {
    const tipMessages = [
      { amount: 5, msg: "A fan tipped you $5! 💸" },
      {
        amount: 10,
        msg: "A supporter sent $10 during your post's viral run! 🔥",
      },
      { amount: 20, msg: "A loyal fan sent you $20 as appreciation! ❤️" },
      { amount: 3, msg: "Someone tipped $3 on your latest post! 🎉" },
      { amount: 50, msg: "A big fan just tipped you $50! 🚀" },
    ];
    let timer: ReturnType<typeof setTimeout>;
    const fire = () => {
      const t = tipMessages[Math.floor(Math.random() * tipMessages.length)];
      addNotification({ icon: "💰", message: t.msg, type: "tip" });
      setMonetization((prev) => ({
        ...prev,
        tipRevenue: prev.tipRevenue + t.amount,
        totalEarnings: prev.totalEarnings + t.amount,
        dailyEarnings: prev.dailyEarnings.map((v, i) =>
          i === prev.dailyEarnings.length - 1 ? v + t.amount : v,
        ),
      }));
      const delay = 30000 + Math.random() * 60000;
      timer = setTimeout(fire, delay);
    };
    timer = setTimeout(fire, 45000 + Math.random() * 45000);
    return () => clearTimeout(timer);
  }, [addNotification, setMonetization]);

  // Sponsorship unlock check
  const unlockedTiersRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const followers = profile.followers;
    const milestones = [
      {
        threshold: 10000,
        tier: "small" as const,
        brand: "Nova Gear",
        value: 500,
      },
      {
        threshold: 100000,
        tier: "ambassador" as const,
        brand: "TechWave",
        value: 2500,
      },
      {
        threshold: 1000000,
        tier: "premium" as const,
        brand: "MegaBrand Global",
        value: 15000,
      },
    ];
    for (const milestone of milestones) {
      if (
        followers >= milestone.threshold &&
        !unlockedTiersRef.current.has(milestone.tier)
      ) {
        unlockedTiersRef.current.add(milestone.tier);
        const deal = {
          id: `deal-${milestone.tier}-${Date.now()}`,
          brandName: milestone.brand,
          dealValue: milestone.value,
          tier: milestone.tier,
          status: "pending" as const,
        };
        setMonetization((prev) => ({
          ...prev,
          activeSponsorships: [...prev.activeSponsorships, deal],
        }));
        addNotification({
          icon: "🤝",
          message: `Brand deal offer! ${milestone.brand} wants to sponsor you for $${milestone.value.toLocaleString()}!`,
          type: "sponsorship",
        });
        toast(`🤝 New brand deal from ${milestone.brand}!`, { duration: 5000 });
      }
    }
  }, [profile.followers, addNotification, setMonetization]);

  const { setConversations, setUnreadDMs } = useApp();
  useEffect(() => {
    const msgs = [
      "Hey I love your posts!",
      "Your content is amazing!",
      "Followed you today!",
      "Keep it up!",
      "Can we collab? 🔥",
      "You're so inspiring!",
      "Your feed is everything ❤️",
    ];
    const interval = setInterval(
      () => {
        const convoIds = ["conv1", "conv2", "conv3"];
        const randomConvo =
          convoIds[Math.floor(Math.random() * convoIds.length)];
        const text = msgs[Math.floor(Math.random() * msgs.length)];
        setConversations((prev) =>
          prev.map((c) =>
            c.id === randomConvo
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: `m-${Date.now()}`,
                      text,
                      sent: false,
                      timestamp: Date.now(),
                    },
                  ],
                }
              : c,
          ),
        );
        setUnreadDMs((n) => n + 1);
        addNotification({
          icon: "💬",
          message: `New DM: "${text}"`,
          type: "dm",
        });
      },
      Math.random() * 20000 + 20000,
    );
    return () => clearInterval(interval);
  }, [setConversations, setUnreadDMs, addNotification]);

  // Achievement celebration effect
  const prevAchRef = useRef(achievements);
  useEffect(() => {
    const prev = prevAchRef.current;
    for (const ach of achievements) {
      const was = prev.find((a) => a.id === ach.id);
      if (ach.unlocked && was && !was.unlocked) {
        toast(
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>{ach.icon}</span>
            <div>
              <p style={{ fontWeight: "bold", fontSize: "14px" }}>
                🏆 Achievement Unlocked!
              </p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>{ach.title}</p>
            </div>
          </div>,
          { duration: 5000 },
        );
        addNotification({
          icon: ach.icon,
          message: `Achievement unlocked: ${ach.title}`,
          type: "achievement",
        });
      }
    }
    prevAchRef.current = achievements;
  }, [achievements, addNotification]);
}
