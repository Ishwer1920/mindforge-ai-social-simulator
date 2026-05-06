import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AI_CREATORS } from "../utils/aiInfluencers";
import type { AICreator } from "../utils/aiInfluencers";
import type { SimulatedPostData } from "../utils/simulatedUsers";
import { clearGameState, loadGameState, saveGameState } from "../utils/storage";

export interface CommentReply {
  id: string;
  username: string;
  userId?: string;
  avatar?: string;
  text: string;
  timestamp: number;
}

export interface CommentItem {
  id: string;
  username: string;
  userId?: string;
  avatar?: string;
  text: string;
  timestamp: number;
  replies?: CommentReply[];
}

export interface PostItem {
  id: string;
  authorName: string;
  authorUsername: string;
  authorUserId?: string;
  authorAvatar: string;
  imageUrl: string;
  images?: string[];
  caption: string;
  hashtags?: string[];
  likes: number;
  comments: CommentItem[];
  shares: number;
  saves: number;
  views: number;
  reach: number;
  impressions: number;
  followersGained: number;
  timestamp: number;
  engagementScore: number;
  likedByUser: boolean;
  savedByUser: boolean;
  isTrending: boolean;
  viralStage?: number;
  viralScore?: number;
  watchTime?: number;
}

export interface StoryReply {
  id: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  imageUrl: string;
  textContent?: string;
  storyType: "image" | "text";
  bgColor?: string;
  createdAt: number;
  expiresAt: number;
  viewCount: number;
  viewRate: number;
  retentionScore: number;
  peakReached: boolean;
  performanceDelta: number;
  viewed: boolean;
  reactions: { fire: number; heart: number; laugh: number };
  userReaction: "fire" | "heart" | "laugh" | null;
  replies: StoryReply[];
}

export interface NotificationItem {
  id: string;
  icon: string;
  message: string;
  timestamp: number;
  type:
    | "follower"
    | "like"
    | "comment"
    | "viral"
    | "achievement"
    | "boost"
    | "dm"
    | "follower_gain"
    | "tip"
    | "sponsorship"
    | "merch_sale"
    | "collab_request"
    | "collab_accepted"
    | "challenge"
    | "event"
    | "shadow_ban"
    | "house"
    | "smart";
  collabId?: string;
  collabCreatorId?: string;
  collabCreatorName?: string;
  collabCreatorAvatar?: string;
}

export interface CollabRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
}

export interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: number;
}

export interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  messages: Message[];
  type: "ai_creator" | "brand" | "fan" | "system";
  niche?: string;
  unread?: number;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  xp: number;
  level: number;
  niche: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface AnalyticsData {
  followersGainedToday: number;
  totalLikesToday: number;
  totalCommentsToday: number;
  engagementRate: number;
  followerGrowth: number[];
  postEngagement: { label: string; likes: number; comments: number }[];
  topPostId: string | null;
}

export interface Route {
  page: string;
  userId?: string;
  tag?: string;
}

export interface SponsorshipDeal {
  id: string;
  brandName: string;
  dealValue: number;
  tier: "small" | "ambassador" | "premium";
  status: "active" | "pending";
  acceptedAt?: number;
}

export interface MerchProduct {
  id: string;
  name: string;
  price: number;
  emoji: string;
  totalSales: number;
  totalRevenue: number;
}

export interface MonetizationData {
  totalEarnings: number;
  adRevenue: number;
  tipRevenue: number;
  merchRevenue: number;
  sponsorRevenue: number;
  dailyEarnings: number[];
  monthlyEarnings: number[];
  topEarningPosts: { postId: string; label: string; earnings: number }[];
  activeSponsorships: SponsorshipDeal[];
}

// V4 Phase 4 — Social Collaboration & Platform Simulation types
export interface CreatorHouseMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
}

export interface CreatorHouse {
  id: string;
  name: string;
  emoji: string;
  niche: string;
  members: CreatorHouseMember[];
  totalFollowers: number;
  rank: number;
}

export interface CompetitionEntry {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  score: number;
}

export interface Competition {
  id: string;
  name: string;
  emoji: string;
  type: "views" | "shares" | "likes";
  joined: boolean;
  leaderboard: CompetitionEntry[];
  weekEndsAt: number;
  reward: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: string;
  rewardClaimed: boolean;
}

export interface PlatformEvent {
  id: string;
  hashtag: string;
  label: string;
  reachMultiplier: number;
  active: boolean;
}

export interface ShadowBan {
  active: boolean;
  endsAt: number;
}

export interface AudienceRegions {
  northAmerica: number;
  europe: number;
  asia: number;
  southAmerica: number;
}

export interface FanLoyalty {
  fans: number;
  superFans: number;
  vipFans: number;
  ultraFans: number;
}

export interface ContentSeries {
  id: string;
  name: string;
  postIds: string[];
}

export interface Skills {
  contentQuality: number;
  engagementBoost: number;
  viralChance: number;
  brandValue: number;
}

export interface AgencyState {
  tier: "none" | "basic" | "premium" | "elite";
  revenueBoostPct: number;
  dealBoostPct: number;
  growthBoostPct: number;
}

export interface InvestmentItem {
  id: string;
  type: "safe" | "risky";
  amount: number;
  expectedReturn: number;
  startTime: number;
  durationMs: number;
  status: "active" | "completed" | "lost";
}

export type AudienceMood = "hyped" | "neutral" | "bored" | "angry";

export interface EnergyHistoryEntry {
  timestamp: number;
  level: number;
}

export interface AiManagerMessage {
  id: string;
  text: string;
  type: "tip" | "warning" | "celebration" | "info";
  timestamp: number;
  read: boolean;
}

export interface LegacyScore {
  totalEngagement: number;
  peakFollowers: number;
  viralPosts: number;
  brandEarnings: number;
  gamesPlayed: number;
}

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

export interface BrandBid {
  name: string;
  industry: string;
  offer: number;
  duration: number;
  requirements: number;
  bonus: string;
}

export interface BiddingWar {
  brands: BrandBid[];
  expiresAt: number;
  status: "active" | "accepted" | "expired";
}

export interface BiddingWarRecord {
  brands: BrandBid[];
  acceptedBrand: string;
  earnings: number;
  timestamp: number;
}

const LEGACY_KEY = "mindforge-legacy";

function loadLegacyScore(): LegacyScore {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) return JSON.parse(raw) as LegacyScore;
  } catch (_) {}
  return {
    totalEngagement: 0,
    peakFollowers: 0,
    viralPosts: 0,
    brandEarnings: 0,
    gamesPlayed: 0,
  };
}

function saveLegacyScore(score: LegacyScore) {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(score));
}

interface AppContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  posts: PostItem[];
  setPosts: React.Dispatch<React.SetStateAction<PostItem[]>>;
  savedPosts: Set<string>;
  likedPosts: Set<string>;
  followedUserIds: Set<string>;
  stories: Story[];
  notifications: NotificationItem[];
  addNotification: (notif: Omit<NotificationItem, "id" | "timestamp">) => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  unreadDMs: number;
  setUnreadDMs: React.Dispatch<React.SetStateAction<number>>;
  hideMobileNav: boolean;
  setHideMobileNav: React.Dispatch<React.SetStateAction<boolean>>;
  analyticsData: AnalyticsData;
  setAnalyticsData: React.Dispatch<React.SetStateAction<AnalyticsData>>;
  monetization: MonetizationData;
  setMonetization: React.Dispatch<React.SetStateAction<MonetizationData>>;
  merchProducts: MerchProduct[];
  setMerchProducts: React.Dispatch<React.SetStateAction<MerchProduct[]>>;
  addMerchSale: (productId: string) => void;
  acceptSponsorship: (dealId: string) => void;
  aiCreators: AICreator[];
  pendingCollabs: CollabRequest[];
  acceptCollab: (collabId: string) => void;
  boostFollowers: (amount: number) => void;
  savePost: (id: string) => void;
  unsavePost: (id: string) => void;
  likePost: (id: string) => void;
  unlikePost: (id: string) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  addStory: (story: Story) => void;
  reactToStory: (storyId: string, reaction: "fire" | "heart" | "laugh") => void;
  replyToStory: (storyId: string, text: string) => void;
  addCommentReply: (
    postId: string,
    commentId: string,
    reply: CommentReply,
  ) => void;
  addSimulatedPost: (post: SimulatedPostData) => PostItem;
  currentRoute: Route;
  navigate: (page: string, params?: Partial<Route>) => void;
  // V4 Phase 4
  houses: CreatorHouse[];
  setHouses: React.Dispatch<React.SetStateAction<CreatorHouse[]>>;
  userHouseId: string | null;
  setUserHouseId: React.Dispatch<React.SetStateAction<string | null>>;
  competitions: Competition[];
  setCompetitions: React.Dispatch<React.SetStateAction<Competition[]>>;
  weeklyChallenges: WeeklyChallenge[];
  setWeeklyChallenges: React.Dispatch<React.SetStateAction<WeeklyChallenge[]>>;
  activePlatformEvent: PlatformEvent | null;
  setActivePlatformEvent: React.Dispatch<
    React.SetStateAction<PlatformEvent | null>
  >;
  shadowBan: ShadowBan;
  setShadowBan: React.Dispatch<React.SetStateAction<ShadowBan>>;
  audienceRegions: AudienceRegions;
  joinHouse: (houseId: string) => void;
  createHouse: (name: string, emoji: string, niche: string) => void;
  joinCompetition: (competitionId: string) => void;
  claimChallengeReward: (challengeId: string) => void;
  // Phase 2
  fanLoyalty: FanLoyalty;
  reputationScore: number;
  burnoutActive: boolean;
  coldAudienceActive: boolean;
  contentSeries: ContentSeries[];
  negotiateSponsorship: (id: string, multiplier: 1.25 | 1.5 | 2) => void;
  addPostToSeries: (postId: string, seriesName: string) => void;
  sessionStartFollowers: number;
  // V5
  isNewUser: boolean;
  setIsNewUser: React.Dispatch<React.SetStateAction<boolean>>;
  creatorCoins: number;
  setCreatorCoins: React.Dispatch<React.SetStateAction<number>>;
  lastSaved: number | null;
  isSaving: boolean;
  triggerSave: () => void;
  newGame: () => void;
  // V5 Pass 2
  skills: Skills;
  setSkills: React.Dispatch<React.SetStateAction<Skills>>;
  agency: AgencyState;
  setAgency: React.Dispatch<React.SetStateAction<AgencyState>>;
  investments: InvestmentItem[];
  setInvestments: React.Dispatch<React.SetStateAction<InvestmentItem[]>>;
  loginStreak: number;
  setLoginStreak: React.Dispatch<React.SetStateAction<number>>;
  lastLoginDate: string;
  setLastLoginDate: React.Dispatch<React.SetStateAction<string>>;
  postingStreak: number;
  setPostingStreak: React.Dispatch<React.SetStateAction<number>>;
  lastPostTime: number;
  setLastPostTime: React.Dispatch<React.SetStateAction<number>>;
  dailyRewardClaimed: boolean;
  setDailyRewardClaimed: React.Dispatch<React.SetStateAction<boolean>>;
  lastRewardDate: string;
  setLastRewardDate: React.Dispatch<React.SetStateAction<string>>;
  audienceMood: AudienceMood;
  setAudienceMood: React.Dispatch<React.SetStateAction<AudienceMood>>;
  audienceMoodScore: number;
  setAudienceMoodScore: React.Dispatch<React.SetStateAction<number>>;
  aiManagerMessages: AiManagerMessage[];
  setAiManagerMessages: React.Dispatch<
    React.SetStateAction<AiManagerMessage[]>
  >;
  // Batch 2
  rivalCreator: AICreator | null;
  setRivalCreator: React.Dispatch<React.SetStateAction<AICreator | null>>;
  dramaCount: number;
  setDramaCount: React.Dispatch<React.SetStateAction<number>>;
  fanRebellionActive: boolean;
  setFanRebellionActive: React.Dispatch<React.SetStateAction<boolean>>;
  platformTakeoverActive: boolean;
  setPlatformTakeoverActive: React.Dispatch<React.SetStateAction<boolean>>;
  platformTakeoverEndsAt: number | null;
  setPlatformTakeoverEndsAt: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  // Batch 4
  legacyScore: LegacyScore;
  setLegacyScore: React.Dispatch<React.SetStateAction<LegacyScore>>;
  updateLegacyScore: (updates: Partial<LegacyScore>) => void;
  celebrityMode: boolean;
  // Algorithm Hacks
  activeAlgoHack: AlgoHack | null;
  setActiveAlgoHack: React.Dispatch<React.SetStateAction<AlgoHack | null>>;
  algoHackHistory: AlgoHackHistoryItem[];
  setAlgoHackHistory: React.Dispatch<
    React.SetStateAction<AlgoHackHistoryItem[]>
  >;
  // Sponsor Bidding Wars
  activeBiddingWar: BiddingWar | null;
  biddingWarHistory: BiddingWarRecord[];
  acceptBiddingDeal: (brandIdx: number, autoSelected: boolean) => void;
  triggerBiddingWar: () => void;
  // Creator Energy
  creatorEnergy: number;
  setCreatorEnergy: React.Dispatch<React.SetStateAction<number>>;
  lastEnergyUpdate: number;
  burnoutExpiresAt: number | null;
  energyHistory: EnergyHistoryEntry[];
  restModeActive: boolean;
  restModeExpiresAt: number | null;
  lastRestModeUsed: number | null;
  activateRestMode: () => void;
  drainEnergy: (amount: number) => void;
}

export const SAMPLE_COMMENTS = [
  "Nice post!",
  "Amazing content!",
  "Love this! \u2764\ufe0f",
  "\ud83d\udd25\ud83d\udd25\ud83d\udd25",
  "Keep posting!",
  "Absolutely stunning!",
  "This made my day!",
  "So inspiring!",
  "Incredible shot!",
  "Goals! \ud83d\ude4c",
  "Need this in my life!",
  "You're so talented!",
  "Obsessed with this \ud83d\ude0d",
  "More of this please!",
];

export const SAMPLE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=mia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
];

export const PRESET_AVATARS = [
  { seed: "artist", label: "\ud83c\udfa8 Artist" },
  { seed: "gamer", label: "\ud83c\udfae Gamer" },
  { seed: "explorer", label: "\ud83c\udf0d Explorer" },
  { seed: "creator", label: "\u2728 Creator" },
  { seed: "athlete", label: "\ud83c\udfc6 Athlete" },
  { seed: "techie", label: "\ud83d\udcbb Techie" },
  { seed: "foodie", label: "\ud83c\udf55 Foodie" },
  { seed: "musician", label: "\ud83c\udfb5 Musician" },
  { seed: "photographer", label: "\ud83d\udcf8 Photographer" },
  { seed: "traveler", label: "\u2708\ufe0f Traveler" },
];

const SAMPLE_USERS = ["@samchen", "@miatorres", "@jordankim", "@rileylee"];
const SAMPLE_USER_IDS = ["1", "2", "3", "4"];

const makeComment = (index: number): CommentItem => ({
  id: `c-${Date.now()}-${index}`,
  username: SAMPLE_USERS[index % 4],
  userId: SAMPLE_USER_IDS[index % 4],
  avatar: SAMPLE_AVATARS[index % 4],
  text: SAMPLE_COMMENTS[index % SAMPLE_COMMENTS.length],
  timestamp: Date.now() - (8 - index) * 60000,
  replies: [],
});

const INITIAL_POSTS: PostItem[] = [
  {
    id: "p1",
    authorName: "Alex Rivera",
    authorUsername: "@alexrivera",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexrivera",
    imageUrl: "https://picsum.photos/seed/travel1/600/400",
    images: [
      "https://picsum.photos/seed/travel1/600/400",
      "https://picsum.photos/seed/travel2/600/400",
      "https://picsum.photos/seed/travel3/600/400",
    ],
    caption:
      "Golden hour at Santorini \u2014 nothing beats this view \ud83c\udf05 #travel #wanderlust",
    hashtags: ["#travel", "#wanderlust"],
    likes: 482,
    comments: [0, 1, 2, 3, 4].map(makeComment),
    shares: 34,
    saves: 87,
    views: 5820,
    reach: 4200,
    impressions: 7340,
    followersGained: 48,
    timestamp: Date.now() - 3600000,
    engagementScore: 482 + 5 * 2 + 34 * 3,
    likedByUser: false,
    savedByUser: false,
    isTrending: true,
    viralStage: 3,
    viralScore: 5000,
    watchTime: 82,
  },
  {
    id: "p2",
    authorName: "Sam Chen",
    authorUsername: "@samchen",
    authorUserId: "1",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    imageUrl: "https://picsum.photos/seed/city2/600/400",
    images: ["https://picsum.photos/seed/city2/600/400"],
    caption:
      "Late night city lights always hit different \ud83c\udf06 #citylife #nightphotography",
    hashtags: ["#citylife", "#nightphotography"],
    likes: 317,
    comments: [1, 2, 3].map(makeComment),
    shares: 21,
    saves: 52,
    views: 3910,
    reach: 2800,
    impressions: 4920,
    followersGained: 23,
    timestamp: Date.now() - 7200000,
    engagementScore: 317 + 3 * 2 + 21 * 3,
    likedByUser: false,
    savedByUser: false,
    isTrending: true,
    viralStage: 2,
    viralScore: 1500,
    watchTime: 71,
  },
  {
    id: "p3",
    authorName: "Mia Torres",
    authorUsername: "@miatorres",
    authorUserId: "2",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mia",
    imageUrl: "https://picsum.photos/seed/nature3/600/400",
    images: [
      "https://picsum.photos/seed/nature3/600/400",
      "https://picsum.photos/seed/nature4/600/400",
    ],
    caption:
      "Morning hike to the summit \ud83c\udfd4\ufe0f The struggle is always worth it #hiking #nature",
    hashtags: ["#hiking", "#nature"],
    likes: 201,
    comments: [2, 3, 4, 5].map(makeComment),
    shares: 15,
    saves: 33,
    views: 2450,
    reach: 1900,
    impressions: 3100,
    followersGained: 14,
    timestamp: Date.now() - 10800000,
    engagementScore: 201 + 4 * 2 + 15 * 3,
    likedByUser: false,
    savedByUser: false,
    isTrending: false,
    viralStage: 0,
    viralScore: 0,
    watchTime: 58,
  },
  {
    id: "p4",
    authorName: "Alex Rivera",
    authorUsername: "@alexrivera",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexrivera",
    imageUrl: "https://picsum.photos/seed/food4/600/400",
    images: ["https://picsum.photos/seed/food4/600/400"],
    caption:
      "Brunch goals achieved \ud83e\udd51\ud83c\udf73 Recipe drop coming soon! #foodie #brunch",
    hashtags: ["#foodie", "#brunch"],
    likes: 156,
    comments: [0, 1, 2].map(makeComment),
    shares: 8,
    saves: 21,
    views: 1820,
    reach: 1400,
    impressions: 2240,
    followersGained: 9,
    timestamp: Date.now() - 86400000,
    engagementScore: 156 + 3 * 2 + 8 * 3,
    likedByUser: false,
    savedByUser: false,
    isTrending: false,
    viralStage: 0,
    viralScore: 0,
    watchTime: 63,
  },
  {
    id: "p5",
    authorName: "Jordan Kim",
    authorUsername: "@jordankim",
    authorUserId: "3",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    imageUrl: "https://picsum.photos/seed/portrait5/600/400",
    images: ["https://picsum.photos/seed/portrait5/600/400"],
    caption:
      "Self-portrait series: chapter 3 \ud83d\udcf8 Exploring light and shadow #photography #portrait",
    hashtags: ["#photography", "#portrait"],
    likes: 89,
    comments: [3, 4].map(makeComment),
    shares: 5,
    saves: 12,
    views: 1040,
    reach: 820,
    impressions: 1310,
    followersGained: 4,
    timestamp: Date.now() - 172800000,
    engagementScore: 89 + 2 * 2 + 5 * 3,
    likedByUser: false,
    savedByUser: false,
    isTrending: false,
    viralStage: 0,
    viralScore: 0,
    watchTime: 47,
  },
  {
    id: "p6",
    authorName: "Riley Lee",
    authorUsername: "@rileylee",
    authorUserId: "4",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
    imageUrl: "https://picsum.photos/seed/fashion6/600/400",
    images: [
      "https://picsum.photos/seed/fashion6/600/400",
      "https://picsum.photos/seed/fashion7/600/400",
      "https://picsum.photos/seed/fashion8/600/400",
    ],
    caption:
      "New drop is live \u2728 Which look is your favorite? #fashion #style #ootd",
    hashtags: ["#fashion", "#style", "#ootd"],
    likes: 892,
    comments: [0, 1, 2, 3].map(makeComment),
    shares: 67,
    saves: 204,
    views: 12400,
    reach: 9800,
    impressions: 15600,
    followersGained: 112,
    timestamp: Date.now() - 1800000,
    engagementScore: 892 + 4 * 2 + 67 * 3,
    likedByUser: false,
    savedByUser: false,
    isTrending: true,
    viralStage: 4,
    viralScore: 15000,
    watchTime: 88,
  },
];

const INITIAL_CONVOS: Conversation[] = [
  {
    id: "conv-ai-1",
    name: "FitPulse Nova",
    username: "@fitpulse_nova",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fitpulse",
    type: "ai_creator",
    niche: "fitness",
    unread: 2,
    messages: [
      {
        id: "m-ai1-1",
        text: "Hey! Loved your last post 🔥 wanna collab on a fitness reel?",
        sent: false,
        timestamp: Date.now() - 480000,
      },
    ],
  },
  {
    id: "conv-ai-2",
    name: "TechOrbit",
    username: "@tech_orbit",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=techorbit",
    type: "ai_creator",
    niche: "tech",
    unread: 1,
    messages: [
      {
        id: "m-ai2-1",
        text: "Sick idea — let's build something that goes viral in the tech space 📱",
        sent: false,
        timestamp: Date.now() - 900000,
      },
    ],
  },
  {
    id: "conv-ai-3",
    name: "MemeLord99",
    username: "@memelord99",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=memelord",
    type: "ai_creator",
    niche: "comedy",
    unread: 0,
    messages: [
      {
        id: "m-ai3-1",
        text: "lmaooo dude your posts are actually hilarious",
        sent: false,
        timestamp: Date.now() - 3600000,
      },
      {
        id: "m-ai3-2",
        text: "collab when? 😂",
        sent: false,
        timestamp: Date.now() - 3540000,
      },
    ],
  },
  {
    id: "conv-ai-4",
    name: "AestheticMoments",
    username: "@aesthetic_moments",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aesthetic",
    type: "ai_creator",
    niche: "photography",
    unread: 0,
    messages: [
      {
        id: "m-ai4-1",
        text: "Your travel shots are stunning ✨ Do you use a DSLR?",
        sent: false,
        timestamp: Date.now() - 7200000,
      },
    ],
  },
  {
    id: "conv-ai-5",
    name: "MotivateDaily",
    username: "@motivate_daily",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=motivate",
    type: "ai_creator",
    niche: "motivation",
    unread: 0,
    messages: [
      {
        id: "m-ai5-1",
        text: "You're doing amazing work. Keep pushing! 💪",
        sent: false,
        timestamp: Date.now() - 14400000,
      },
    ],
  },
  {
    id: "conv-brand-1",
    name: "TechGear Pro",
    username: "@techgear_pro",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=techgear",
    type: "brand",
    unread: 1,
    messages: [
      {
        id: "m-b1-1",
        text: "Hi! We'd love to discuss a partnership with you. Your tech content is a perfect fit for our brand.",
        sent: false,
        timestamp: Date.now() - 1800000,
      },
    ],
  },
  {
    id: "conv-brand-2",
    name: "FitLife Supplements",
    username: "@fitlife_supplements",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=fitlife",
    type: "brand",
    unread: 0,
    messages: [
      {
        id: "m-b2-1",
        text: "Great timing — we're looking for creators in your niche. Let's talk numbers 💰",
        sent: false,
        timestamp: Date.now() - 86400000,
      },
    ],
  },
  {
    id: "conv-brand-3",
    name: "CreatorKit",
    username: "@creator_kit",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=creatorkit",
    type: "brand",
    unread: 0,
    messages: [
      {
        id: "m-b3-1",
        text: "We've been following your content for a while. Ready to level up with CreatorKit Pro?",
        sent: false,
        timestamp: Date.now() - 172800000,
      },
    ],
  },
  {
    id: "conv-fan-1",
    name: "superfan_alex",
    username: "@superfan_alex",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=alex",
    type: "fan",
    unread: 3,
    messages: [
      {
        id: "m-f1-1",
        text: "omg you replied!! I love your content so much 😭",
        sent: false,
        timestamp: Date.now() - 120000,
      },
      {
        id: "m-f1-2",
        text: "your last post was everything 🔥🔥🔥",
        sent: false,
        timestamp: Date.now() - 60000,
      },
    ],
  },
  {
    id: "conv-fan-2",
    name: "loyal_viewer_22",
    username: "@loyal_viewer_22",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=viewer22",
    type: "fan",
    unread: 0,
    messages: [
      {
        id: "m-f2-1",
        text: "been following you since day 1! never stop posting ❤️",
        sent: false,
        timestamp: Date.now() - 43200000,
      },
    ],
  },
  {
    id: "conv-fan-3",
    name: "nightowl_watches",
    username: "@nightowl_watches",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=nightowl",
    type: "fan",
    unread: 0,
    messages: [
      {
        id: "m-f3-1",
        text: "yesss this made my day, keep posting pls!!",
        sent: false,
        timestamp: Date.now() - 86400000,
      },
    ],
  },
  {
    id: "conv-sys-1",
    name: "MindForge Team",
    username: "@mindforge",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=mindforge",
    type: "system",
    unread: 0,
    messages: [
      {
        id: "m-s1-1",
        text: "Welcome to MindForge! Your account is verified and in good standing ✅",
        sent: false,
        timestamp: Date.now() - 604800000,
      },
    ],
  },
  {
    id: "conv-sys-2",
    name: "Platform Alerts",
    username: "@platform",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=platform",
    type: "system",
    unread: 1,
    messages: [
      {
        id: "m-s2-1",
        text: "New features are live in Creator Studio! Check out the updated Analytics dashboard.",
        sent: false,
        timestamp: Date.now() - 7200000,
      },
    ],
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "a1",
    icon: "\ud83d\udcf8",
    title: "First Post",
    description: "Publish your first post",
    unlocked: true,
  },
  {
    id: "a2",
    icon: "\ud83d\udcac",
    title: "First Comment",
    description: "Leave your first comment",
    unlocked: false,
  },
  {
    id: "a3",
    icon: "\ud83d\udd04",
    title: "First Share",
    description: "Share your first post",
    unlocked: false,
  },
  {
    id: "a4",
    icon: "\ud83c\udfaf",
    title: "100 Followers",
    description: "Reach 100 followers",
    unlocked: true,
  },
  {
    id: "a5",
    icon: "\u2b50",
    title: "500 Followers",
    description: "Reach 500 followers",
    unlocked: true,
  },
  {
    id: "a6",
    icon: "\ud83c\udfc5",
    title: "1K Followers",
    description: "Reach 1,000 followers",
    unlocked: true,
  },
  {
    id: "a7",
    icon: "\ud83d\udc8e",
    title: "5K Followers",
    description: "Reach 5,000 followers",
    unlocked: false,
  },
  {
    id: "a8",
    icon: "\ud83d\ude80",
    title: "10K Followers",
    description: "Reach 10,000 followers",
    unlocked: false,
  },
  {
    id: "a9",
    icon: "\ud83d\udd25",
    title: "First Viral Post",
    description: "Get a post trending",
    unlocked: true,
  },
  {
    id: "a10",
    icon: "\ud83d\udcdd",
    title: "10 Posts Created",
    description: "Create 10 posts",
    unlocked: false,
  },
  {
    id: "a11",
    icon: "\u2764\ufe0f",
    title: "100 Likes Received",
    description: "Accumulate 100 total likes",
    unlocked: true,
  },
  {
    id: "a12",
    icon: "\ud83d\udc96",
    title: "1K Likes Received",
    description: "Accumulate 1,000 total likes",
    unlocked: false,
  },
  {
    id: "a13",
    icon: "\ud83d\udcc8",
    title: "Top Trending Post",
    description: "Have a post appear in trending",
    unlocked: true,
  },
  {
    id: "a14",
    icon: "\u26a1",
    title: "Creator Level 5",
    description: "Reach creator level 5",
    unlocked: false,
  },
  {
    id: "a15",
    icon: "\ud83d\udc51",
    title: "Creator Level 10",
    description: "Reach creator level 10",
    unlocked: false,
  },
];

const INITIAL_STORIES: Story[] = [
  {
    id: "s1",
    userId: "1",
    username: "@samchen",
    avatar: SAMPLE_AVATARS[0],
    imageUrl: "https://picsum.photos/seed/story1/400/700",
    storyType: "image" as const,
    createdAt: Date.now() - 300000,
    expiresAt: Date.now() - 300000 + 24 * 60 * 60 * 1000,
    viewCount: 842,
    viewRate: 8.4,
    retentionScore: 72,
    peakReached: true,
    performanceDelta: 5,
    viewed: false,
    reactions: { fire: 12, heart: 8, laugh: 3 },
    userReaction: null,
    replies: [],
  },
  {
    id: "s2",
    userId: "2",
    username: "@miatorres",
    avatar: SAMPLE_AVATARS[1],
    imageUrl: "https://picsum.photos/seed/story2/400/700",
    storyType: "image" as const,
    createdAt: Date.now() - 900000,
    expiresAt: Date.now() - 900000 + 24 * 60 * 60 * 1000,
    viewCount: 1204,
    viewRate: 12.0,
    retentionScore: 65,
    peakReached: true,
    performanceDelta: 15,
    viewed: false,
    reactions: { fire: 20, heart: 15, laugh: 5 },
    userReaction: null,
    replies: [],
  },
  {
    id: "s3",
    userId: "3",
    username: "@jordankim",
    avatar: SAMPLE_AVATARS[2],
    imageUrl: "https://picsum.photos/seed/story3/400/700",
    storyType: "image" as const,
    createdAt: Date.now() - 1800000,
    expiresAt: Date.now() - 1800000 + 24 * 60 * 60 * 1000,
    viewCount: 567,
    viewRate: 5.7,
    retentionScore: 58,
    peakReached: false,
    performanceDelta: -10,
    viewed: true,
    reactions: { fire: 5, heart: 3, laugh: 1 },
    userReaction: null,
    replies: [],
  },
  {
    id: "s4",
    userId: "4",
    username: "@rileylee",
    avatar: SAMPLE_AVATARS[3],
    imageUrl: "https://picsum.photos/seed/story4/400/700",
    storyType: "image" as const,
    createdAt: Date.now() - 600000,
    expiresAt: Date.now() - 600000 + 24 * 60 * 60 * 1000,
    viewCount: 2341,
    viewRate: 23.4,
    retentionScore: 80,
    peakReached: true,
    performanceDelta: 22,
    viewed: false,
    reactions: { fire: 40, heart: 30, laugh: 10 },
    userReaction: null,
    replies: [],
  },
];

const buildDailyEarnings = (): number[] => {
  return [
    22, 28, 31, 25, 34, 38, 29, 42, 36, 44, 38, 47, 41, 35, 50, 46, 52, 48, 55,
    43, 58, 61, 54, 66, 59, 63, 68, 72, 65, 78,
  ];
};

const buildMonthlyEarnings = (): number[] => [
  210, 265, 298, 312, 380, 425, 390, 468, 510, 545, 620, 720,
];

const INITIAL_MONETIZATION: MonetizationData = {
  totalEarnings: 1240.5,
  adRevenue: 820.0,
  tipRevenue: 245.5,
  merchRevenue: 175.0,
  sponsorRevenue: 0,
  dailyEarnings: buildDailyEarnings(),
  monthlyEarnings: buildMonthlyEarnings(),
  topEarningPosts: [
    {
      postId: "p6",
      label: "New drop is live ✨ Whic",
      earnings: (12400 * 7) / 1000,
    },
    {
      postId: "p1",
      label: "Golden hour at Santorini",
      earnings: (5820 * 7) / 1000,
    },
    {
      postId: "p2",
      label: "Late night city lights al",
      earnings: (3910 * 7) / 1000,
    },
  ],
  activeSponsorships: [],
};

const INITIAL_MERCH: MerchProduct[] = [
  {
    id: "m1",
    name: "MindForge Hoodie",
    price: 49.99,
    emoji: "👕",
    totalSales: 12,
    totalRevenue: 599.88,
  },
  {
    id: "m2",
    name: "Creator Cap",
    price: 24.99,
    emoji: "🧢",
    totalSales: 8,
    totalRevenue: 199.92,
  },
  {
    id: "m3",
    name: "Digital Creator Pack",
    price: 9.99,
    emoji: "💾",
    totalSales: 23,
    totalRevenue: 229.77,
  },
];

// ---- V4 Phase 4 initial data ----

const AI_HOUSE_NICHES = [
  { niche: "Fitness", emoji: "💪" },
  { niche: "Tech", emoji: "💻" },
  { niche: "Comedy", emoji: "😂" },
  { niche: "Fashion", emoji: "👗" },
  { niche: "Gaming", emoji: "🎮" },
  { niche: "Food", emoji: "🍕" },
  { niche: "Travel", emoji: "✈️" },
  { niche: "Education", emoji: "📚" },
  { niche: "Music", emoji: "🎵" },
  { niche: "Photography", emoji: "📸" },
];

const AI_HOUSE_NAMES = [
  "PixelCreators",
  "ViralVault",
  "ContentKings",
  "TrendSetters",
  "ReachHouse",
  "TheCreativeHive",
  "NovaMakers",
  "ZenithCollective",
  "PulseCrew",
  "EchoSquad",
];

function buildHouseMember(seed: string, followers: number): CreatorHouseMember {
  return {
    id: `hm-${seed}`,
    name: seed.charAt(0).toUpperCase() + seed.slice(1),
    username: `@${seed.toLowerCase()}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    followers,
  };
}

const INITIAL_HOUSES: CreatorHouse[] = AI_HOUSE_NAMES.map((name, i) => {
  const memberCount = 4 + (i % 8);
  const seeds = [
    "nova",
    "pulse",
    "drift",
    "orbit",
    "flux",
    "echo",
    "arc",
    "vibe",
    "dawn",
    "haze",
    "lux",
    "apex",
  ];
  const members: CreatorHouseMember[] = Array.from(
    { length: memberCount },
    (_, j) => {
      const followerBase = 20000 + i * 40000 + j * 15000;
      return buildHouseMember(seeds[(i * 4 + j) % seeds.length], followerBase);
    },
  );
  const totalFollowers = members.reduce((s, m) => s + m.followers, 0);
  const niche = AI_HOUSE_NICHES[i % AI_HOUSE_NICHES.length];
  return {
    id: `house-${i}`,
    name,
    emoji: niche.emoji,
    niche: niche.niche,
    members,
    totalFollowers,
    rank: i + 1,
  };
});

function buildCompetitionLeaderboard(): CompetitionEntry[] {
  const names = [
    { name: "CreatorNova", username: "@creatornova", seed: "nova" },
    { name: "MemeOrbit", username: "@memeorbit", seed: "orbit" },
    { name: "FitPulse", username: "@fitpulse", seed: "pulse" },
    { name: "LuxDrift", username: "@luxdrift", seed: "drift" },
    { name: "EchoFlux", username: "@echoflux", seed: "flux" },
  ];
  return names.map((n, i) => ({
    userId: `comp-ai-${i}`,
    name: n.name,
    username: n.username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.seed}`,
    score: 250000 - i * 40000 + Math.floor(Math.random() * 10000),
  }));
}

const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: "comp-viral",
    name: "Viral Post Contest",
    emoji: "🔥",
    type: "views",
    joined: false,
    leaderboard: buildCompetitionLeaderboard(),
    weekEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    reward: "+5,000 followers & Explorer Badge",
  },
  {
    id: "comp-meme",
    name: "Meme Battle",
    emoji: "😂",
    type: "shares",
    joined: false,
    leaderboard: buildCompetitionLeaderboard(),
    weekEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    reward: "+3,000 followers & Meme Lord Badge",
  },
  {
    id: "comp-photo",
    name: "Photography Challenge",
    emoji: "📸",
    type: "likes",
    joined: false,
    leaderboard: buildCompetitionLeaderboard(),
    weekEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    reward: "+2,000 followers & Lens Master Badge",
  },
];

const INITIAL_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "ch-followers",
    title: "Grow Your Audience",
    description: "Gain 5,000 new followers",
    target: 5000,
    current: 0,
    completed: false,
    reward: "+XP & Audience Builder Badge",
    rewardClaimed: false,
  },
  {
    id: "ch-explore",
    title: "Hit the Explore Page",
    description: "Get a post featured on Explore",
    target: 1,
    current: 0,
    completed: false,
    reward: "+1,500 followers & Explorer Badge",
    rewardClaimed: false,
  },
  {
    id: "ch-views",
    title: "View Milestone",
    description: "Reach 50,000 views on a single post",
    target: 50000,
    current: 0,
    completed: false,
    reward: "+XP & Viral Sensation Badge",
    rewardClaimed: false,
  },
  {
    id: "ch-hashtag",
    title: "Start a Trend",
    description: "Get your hashtag trending",
    target: 1,
    current: 0,
    completed: false,
    reward: "+2,000 followers & Trendsetter Badge",
    rewardClaimed: false,
  },
];

export const PLATFORM_EVENTS: PlatformEvent[] = [
  {
    id: "evt-glow",
    hashtag: "#GlowUpChallenge",
    label: "Posts using #GlowUpChallenge get 2x reach bonus!",
    reachMultiplier: 2.0,
    active: true,
  },
  {
    id: "evt-viral",
    hashtag: "#ViralMoment",
    label: "Posts using #ViralMoment get 1.5x reach boost!",
    reachMultiplier: 1.5,
    active: false,
  },
  {
    id: "evt-spotlight",
    hashtag: "#CreatorSpotlight",
    label: "#CreatorSpotlight posts get boosted Explore visibility!",
    reachMultiplier: 1.3,
    active: false,
  },
  {
    id: "evt-trending",
    hashtag: "#TrendingNow",
    label: "#TrendingNow is the hot tag — join the wave!",
    reachMultiplier: 1.4,
    active: false,
  },
  {
    id: "evt-drop",
    hashtag: "#ContentDrop",
    label: "Posts using #ContentDrop get 1.8x reach bonus!",
    reachMultiplier: 1.8,
    active: false,
  },
];

const BIDDING_BRANDS = [
  {
    name: "TechVision Pro",
    industry: "Tech",
    bonusOptions: [
      "+300 coins signing bonus",
      "2x engagement guarantee",
      "Exclusive tech bundle",
    ],
  },
  {
    name: "FitFuel Co.",
    industry: "Fitness",
    bonusOptions: [
      "+500 coins signing bonus",
      "Free merch drop",
      "Featured on FitFuel page",
    ],
  },
  {
    name: "Glam & Go",
    industry: "Beauty",
    bonusOptions: [
      "+250 coins signing bonus",
      "2x story reach guarantee",
      "Brand ambassador title",
    ],
  },
  {
    name: "GameZone Studios",
    industry: "Gaming",
    bonusOptions: [
      "+400 coins signing bonus",
      "Early game access",
      "Streamer pack included",
    ],
  },
  {
    name: "FoodCraft",
    industry: "Food",
    bonusOptions: [
      "+200 coins signing bonus",
      "Recipe collaboration",
      "Product bundle included",
    ],
  },
  {
    name: "LuxStyle",
    industry: "Fashion",
    bonusOptions: [
      "+600 coins signing bonus",
      "Season collection feature",
      "3x brand reach boost",
    ],
  },
  {
    name: "WanderDeals",
    industry: "Travel",
    bonusOptions: [
      "+350 coins signing bonus",
      "Exclusive destination promo",
      "2x explore page feature",
    ],
  },
  {
    name: "WealthWave",
    industry: "Finance",
    bonusOptions: [
      "+450 coins signing bonus",
      "Investor spotlight",
      "Platform promotion feature",
    ],
  },
  {
    name: "VibeLife Co.",
    industry: "Lifestyle",
    bonusOptions: [
      "+280 coins signing bonus",
      "Brand collab post",
      "Priority deal renewal",
    ],
  },
  {
    name: "LearnLab",
    industry: "Education",
    bonusOptions: [
      "+220 coins signing bonus",
      "Course partnership",
      "Newsletter feature",
    ],
  },
];

function generateBiddingWar(followers: number): BiddingWar {
  const shuffled = [...BIDDING_BRANDS].sort(() => Math.random() - 0.5);
  const count = 3 + Math.floor(Math.random() * 3);
  const selected = shuffled.slice(0, count);
  const baseOffer = Math.max(
    100,
    Math.floor((followers / 1000) * (4 + Math.random() * 6)),
  );
  const brands: BrandBid[] = selected.map((b, i) => ({
    name: b.name,
    industry: b.industry,
    offer: Math.floor(baseOffer * (0.6 + i * 0.18 + Math.random() * 0.25)),
    duration: [7, 14, 30][Math.floor(Math.random() * 3)],
    requirements: 1 + Math.floor(Math.random() * 3),
    bonus: b.bonusOptions[Math.floor(Math.random() * b.bonusOptions.length)],
  }));
  return {
    brands,
    expiresAt: Date.now() + 90000,
    status: "active",
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Rivera",
    username: "@alexrivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexrivera",
    bio: "Content creator \u2022 Travel \u2022 Photography \ud83c\udf0d",
    followers: 4820,
    following: 312,
    postsCount: 5,
    xp: 2400,
    level: 3,
    niche: "Tech",
  });
  const sessionStartFollowers = useRef(4820);
  const [isNewUser, setIsNewUser] = useState<boolean>(() => {
    const saved = loadGameState();
    return !saved;
  });
  const [creatorCoins, setCreatorCoins] = useState<number>(100);
  // V5 Pass 2 state
  const [skills, setSkills] = useState<Skills>({
    contentQuality: 1,
    engagementBoost: 1,
    viralChance: 1,
    brandValue: 1,
  });
  const [agency, setAgency] = useState<AgencyState>({
    tier: "none",
    revenueBoostPct: 0,
    dealBoostPct: 0,
    growthBoostPct: 0,
  });
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [loginStreak, setLoginStreak] = useState<number>(0);
  const [lastLoginDate, setLastLoginDate] = useState<string>("");
  const [postingStreak, setPostingStreak] = useState<number>(0);
  const [lastPostTime, setLastPostTime] = useState<number>(0);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState<boolean>(false);
  const [lastRewardDate, setLastRewardDate] = useState<string>("");
  const [audienceMood, setAudienceMood] = useState<AudienceMood>("neutral");
  const [audienceMoodScore, setAudienceMoodScore] = useState<number>(50);
  const [aiManagerMessages, setAiManagerMessages] = useState<
    AiManagerMessage[]
  >([]);
  // Batch 4 state
  const [legacyScore, setLegacyScore] = useState<LegacyScore>(() =>
    loadLegacyScore(),
  );
  const celebrityMode = (profile?.followers ?? 0) >= 1_000_000;

  // Algorithm Hacks state
  const [activeAlgoHack, setActiveAlgoHack] = useState<AlgoHack | null>(null);
  const [algoHackHistory, setAlgoHackHistory] = useState<AlgoHackHistoryItem[]>(
    [],
  );

  // Sponsor Bidding Wars state
  const [activeBiddingWar, setActiveBiddingWar] = useState<BiddingWar | null>(
    null,
  );
  const [biddingWarHistory, setBiddingWarHistory] = useState<
    BiddingWarRecord[]
  >([]);

  // Creator Energy state
  const [creatorEnergy, setCreatorEnergy] = useState<number>(100);
  const [lastEnergyUpdate, setLastEnergyUpdate] = useState<number>(Date.now());
  const [burnoutExpiresAt, setBurnoutExpiresAt] = useState<number | null>(null);
  const [energyHistory, setEnergyHistory] = useState<EnergyHistoryEntry[]>([]);
  const [restModeActive, setRestModeActive] = useState<boolean>(false);
  const [restModeExpiresAt, setRestModeExpiresAt] = useState<number | null>(
    null,
  );
  const [lastRestModeUsed, setLastRestModeUsed] = useState<number | null>(null);
  const _consecutiveHighEnergyPostsRef = useRef(0);

  // Batch 2 state
  const [rivalCreator, setRivalCreator] = useState<AICreator | null>(null);
  const [dramaCount, setDramaCount] = useState<number>(0);
  const [fanRebellionActive, setFanRebellionActive] = useState<boolean>(false);
  const [platformTakeoverActive, setPlatformTakeoverActive] =
    useState<boolean>(false);
  const [platformTakeoverEndsAt, setPlatformTakeoverEndsAt] = useState<
    number | null
  >(null);

  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const postsRef = useRef<PostItem[]>(INITIAL_POSTS);
  postsRef.current = posts;

  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(
    new Set(["1", "2"]),
  );
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n0",
      icon: "\ud83d\udd25",
      message: "Your post 'Golden hour at Santorini' is trending!",
      timestamp: Date.now() - 300000,
      type: "viral",
    },
    {
      id: "n1",
      icon: "\ud83d\udc64",
      message: "@samchen started following you",
      timestamp: Date.now() - 600000,
      type: "follower",
    },
    {
      id: "n2",
      icon: "\u2764\ufe0f",
      message: "@miatorres liked your post",
      timestamp: Date.now() - 900000,
      type: "like",
    },
  ]);
  const [conversations, setConversations] =
    useState<Conversation[]>(INITIAL_CONVOS);
  const [achievements, setAchievements] =
    useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [unreadDMs, setUnreadDMs] = useState(3);
  const [hideMobileNav, setHideMobileNav] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    followersGainedToday: 142,
    totalLikesToday: 847,
    totalCommentsToday: 93,
    engagementRate: 8.4,
    followerGrowth: [4200, 4310, 4450, 4520, 4600, 4720, 4820],
    postEngagement: INITIAL_POSTS.map((p) => ({
      label: `${p.caption.slice(0, 18)}...`,
      likes: p.likes,
      comments: p.comments.length,
    })),
    topPostId: "p1",
  });
  const [monetization, setMonetization] =
    useState<MonetizationData>(INITIAL_MONETIZATION);
  const [merchProducts, setMerchProducts] =
    useState<MerchProduct[]>(INITIAL_MERCH);
  const [currentRoute, setCurrentRoute] = useState<Route>({ page: "home" });
  const notifIdRef = useRef(10);

  // V4 Phase 4 state
  const [houses, setHouses] = useState<CreatorHouse[]>(INITIAL_HOUSES);
  const [userHouseId, setUserHouseId] = useState<string | null>(null);
  const [competitions, setCompetitions] =
    useState<Competition[]>(INITIAL_COMPETITIONS);
  const [weeklyChallenges, setWeeklyChallenges] =
    useState<WeeklyChallenge[]>(INITIAL_CHALLENGES);
  const [activePlatformEvent, setActivePlatformEvent] =
    useState<PlatformEvent | null>(PLATFORM_EVENTS[0]);
  const [shadowBan, setShadowBan] = useState<ShadowBan>({
    active: false,
    endsAt: 0,
  });
  // Phase 2 state
  const initFans = Math.min(profile.followers, 4820);
  const [fanLoyalty, setFanLoyalty] = useState<FanLoyalty>({
    fans: Math.round(initFans * 0.6),
    superFans: Math.round(initFans * 0.25),
    vipFans: Math.round(initFans * 0.1),
    ultraFans: Math.round(initFans * 0.05),
  });
  const [reputationScore, setReputationScore] = useState(50);
  const [burnoutActive, setBurnoutActive] = useState(false);
  const [coldAudienceActive, setColdAudienceActive] = useState(false);
  const [contentSeries, setContentSeries] = useState<ContentSeries[]>([]);
  const postTimestampsRef = useRef<number[]>([]);
  const audienceRegions: AudienceRegions = {
    northAmerica: 40,
    europe: 28,
    asia: 22,
    southAmerica: 10,
  };

  // V5: triggerSave and newGame
  const stateForSaveRef = useRef<{
    profile: UserProfile;
    posts: PostItem[];
    savedPosts: Set<string>;
    likedPosts: Set<string>;
    followedUserIds: Set<string>;
    conversations: Conversation[];
    achievements: Achievement[];
    notifications: NotificationItem[];
    unreadDMs: number;
    analyticsData: AnalyticsData;
    monetization: MonetizationData;
    merchProducts: MerchProduct[];
    houses: CreatorHouse[];
    userHouseId: string | null;
    competitions: Competition[];
    weeklyChallenges: WeeklyChallenge[];
    activePlatformEvent: PlatformEvent | null;
    shadowBan: ShadowBan;
    reputationScore: number;
    burnoutActive: boolean;
    coldAudienceActive: boolean;
    contentSeries: ContentSeries[];
    pendingCollabs: CollabRequest[];
    creatorCoins: number;
    skills: Skills;
    agency: AgencyState;
    investments: InvestmentItem[];
    loginStreak: number;
    lastLoginDate: string;
    postingStreak: number;
    lastPostTime: number;
    dailyRewardClaimed: boolean;
    lastRewardDate: string;
    stories: Story[];
    rivalCreator: AICreator | null;
    dramaCount: number;
    fanRebellionActive: boolean;
    platformTakeoverActive: boolean;
    platformTakeoverEndsAt: number | null;
    audienceMoodScore: number;
    aiManagerMessages: AiManagerMessage[];
  } | null>(null);

  // V5 Pass 2: Login streak check on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on mount intentionally
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (!lastLoginDate) {
      setLastLoginDate(today);
      setLoginStreak(1);
      return;
    }
    if (lastLoginDate === today) return;
    const last = new Date(lastLoginDate).getTime();
    const nowMs = new Date(today).getTime();
    const diffDays = Math.round((nowMs - last) / 86400000);
    if (diffDays === 1) {
      setLoginStreak((s) => s + 1);
    } else {
      setLoginStreak(1);
    }
    setLastLoginDate(today);
    setDailyRewardClaimed(false);
  }, []);

  const triggerSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    saveTimerRef.current = setTimeout(() => {
      const s = stateForSaveRef.current;
      if (s) {
        saveGameState({
          profile: s.profile,
          posts: s.posts,
          savedPosts: [...s.savedPosts],
          likedPosts: [...s.likedPosts],
          followedUserIds: [...s.followedUserIds],
          notifications: s.notifications,
          conversations: s.conversations,
          achievements: s.achievements,
          unreadDMs: s.unreadDMs,
          analyticsData: s.analyticsData,
          monetization: s.monetization,
          merchProducts: s.merchProducts,
          houses: s.houses,
          userHouseId: s.userHouseId,
          competitions: s.competitions,
          weeklyChallenges: s.weeklyChallenges,
          activePlatformEvent: s.activePlatformEvent,
          shadowBan: s.shadowBan,
          fanLoyalty: { fans: 0, superFans: 0, vipFans: 0, ultraFans: 0 },
          reputationScore: s.reputationScore,
          burnoutActive: s.burnoutActive,
          coldAudienceActive: s.coldAudienceActive,
          contentSeries: s.contentSeries,
          pendingCollabs: s.pendingCollabs,
          creatorCoins: s.creatorCoins,
          skills: s.skills,
          agency: s.agency,
          investments: s.investments,
          loginStreak: s.loginStreak,
          lastLoginDate: s.lastLoginDate,
          postingStreak: s.postingStreak,
          lastPostTime: s.lastPostTime,
          dailyRewardClaimed: s.dailyRewardClaimed,
          lastRewardDate: s.lastRewardDate,
          stories: s.stories,
          rivalCreator: s.rivalCreator,
          dramaCount: s.dramaCount,
          fanRebellionActive: s.fanRebellionActive,
          platformTakeoverActive: s.platformTakeoverActive,
          platformTakeoverEndsAt: s.platformTakeoverEndsAt,
          audienceMoodScore: s.audienceMoodScore,
          aiManagerMessages: s.aiManagerMessages,
          savedAt: Date.now(),
        });
      }
      setIsSaving(false);
      setLastSaved(Date.now());
    }, 1500);
  }, []);

  // V5: Keep stateForSaveRef in sync with latest state for persistence
  useEffect(() => {
    stateForSaveRef.current = {
      profile,
      posts,
      savedPosts,
      likedPosts,
      followedUserIds,
      conversations,
      achievements,
      notifications,
      unreadDMs,
      analyticsData,
      monetization,
      merchProducts,
      houses,
      userHouseId,
      competitions,
      weeklyChallenges,
      activePlatformEvent,
      shadowBan,
      reputationScore,
      burnoutActive,
      coldAudienceActive,
      contentSeries,
      pendingCollabs,
      creatorCoins,
      skills,
      agency,
      investments,
      loginStreak,
      lastLoginDate,
      postingStreak,
      lastPostTime,
      dailyRewardClaimed,
      lastRewardDate,
      stories,
      rivalCreator,
      dramaCount,
      fanRebellionActive,
      platformTakeoverActive,
      platformTakeoverEndsAt,
      audienceMoodScore,
      aiManagerMessages,
    };
  });

  // V5: Auto-save every 3 seconds
  useEffect(() => {
    if (isNewUser) return;
    const interval = setInterval(() => triggerSave(), 3000);
    return () => clearInterval(interval);
  }, [isNewUser, triggerSave]);

  const newGame = useCallback(() => {
    clearGameState();
    setLegacyScore((prev) => {
      const next = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      saveLegacyScore(next);
      return next;
    });
    setIsNewUser(true);
    setCreatorCoins(100);
    setSkills({
      contentQuality: 1,
      engagementBoost: 1,
      viralChance: 1,
      brandValue: 1,
    });
    setAgency({
      tier: "none",
      revenueBoostPct: 0,
      dealBoostPct: 0,
      growthBoostPct: 0,
    });
    setInvestments([]);
    setLoginStreak(1);
    setLastLoginDate(new Date().toISOString().slice(0, 10));
    setPostingStreak(0);
    setLastPostTime(0);
    setDailyRewardClaimed(false);
    setLastRewardDate("");
    setLastSaved(null);
    setRivalCreator(null);
    setDramaCount(0);
    setFanRebellionActive(false);
    setPlatformTakeoverActive(false);
    setPlatformTakeoverEndsAt(null);
    setAudienceMoodScore(50);
    setAiManagerMessages([]);
  }, []);

  const updateLegacyScore = useCallback((updates: Partial<LegacyScore>) => {
    setLegacyScore((prev) => {
      const next = { ...prev, ...updates };
      saveLegacyScore(next);
      return next;
    });
  }, []);

  // Creator Energy actions
  const drainEnergy = useCallback((amount: number) => {
    setCreatorEnergy((prev) => {
      const next = Math.max(0, prev - amount);
      setLastEnergyUpdate(Date.now());
      setEnergyHistory((h) =>
        [...h, { timestamp: Date.now(), level: next }].slice(-50),
      );
      if (next === 0 && prev > 0) {
        setBurnoutActive(true);
        const expiresAt = Date.now() + 10 * 60 * 1000;
        setBurnoutExpiresAt(expiresAt);
        setTimeout(
          () => {
            setBurnoutActive(false);
            setBurnoutExpiresAt(null);
          },
          10 * 60 * 1000,
        );
      }
      return next;
    });
  }, []);

  const activateRestMode = useCallback(() => {
    const now = Date.now();
    setRestModeActive(true);
    const expiresAt = now + 5 * 60 * 1000;
    setRestModeExpiresAt(expiresAt);
    setLastRestModeUsed(now);
    setTimeout(
      () => {
        setRestModeActive(false);
        setRestModeExpiresAt(null);
      },
      5 * 60 * 1000,
    );
  }, []);

  const triggerBiddingWar = useCallback(() => {
    setActiveBiddingWar((prev) => {
      if (prev?.status === "active" && prev.expiresAt > Date.now()) return prev;
      return generateBiddingWar(profile.followers);
    });
  }, [profile.followers]);

  const acceptBiddingDeal = useCallback(
    (brandIdx: number, autoSelected: boolean) => {
      setActiveBiddingWar((prev) => {
        if (!prev || prev.status !== "active") return prev;
        const brand = prev.brands[brandIdx];
        if (!brand) return prev;
        const bonusCoins = brand.bonus.includes("coins")
          ? Number.parseInt(brand.bonus.replace(/\D/g, ""), 10) || 0
          : 0;
        setCreatorCoins((c) => c + bonusCoins);
        setMonetization((m) => ({
          ...m,
          sponsorRevenue: m.sponsorRevenue + brand.offer,
          totalEarnings: m.totalEarnings + brand.offer,
          activeSponsorships: [
            ...m.activeSponsorships,
            {
              id: `bid-${Date.now()}`,
              brandName: brand.name,
              dealValue: brand.offer,
              tier:
                brand.offer > 5000
                  ? ("premium" as const)
                  : brand.offer > 1000
                    ? ("ambassador" as const)
                    : ("small" as const),
              status: "active" as const,
              acceptedAt: Date.now(),
            },
          ],
        }));
        setBiddingWarHistory((h) => [
          {
            brands: prev.brands,
            acceptedBrand: brand.name,
            earnings: brand.offer,
            timestamp: Date.now(),
          },
          ...h.slice(0, 19),
        ]);
        addNotification({
          icon: "🏆",
          message: autoSelected
            ? `Timer expired — ${brand.name} best deal auto-locked (${brand.offer.toLocaleString()})!`
            : `✅ ${brand.name} signed you! ${brand.offer.toLocaleString()} deal secured!`,
          type: "sponsorship",
        });
        return { ...prev, status: "accepted" as const };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const navigate = useCallback((page: string, params?: Partial<Route>) => {
    setCurrentRoute({ page, ...params });
  }, []);

  const addNotification = useCallback(
    (notif: Omit<NotificationItem, "id" | "timestamp">) => {
      if (
        notif.type === "collab_request" &&
        notif.collabId &&
        notif.collabCreatorId &&
        notif.collabCreatorName &&
        notif.collabCreatorAvatar
      ) {
        setPendingCollabs((prev) => [
          ...prev,
          {
            id: notif.collabId as string,
            creatorId: notif.collabCreatorId as string,
            creatorName: notif.collabCreatorName as string,
            creatorAvatar: notif.collabCreatorAvatar as string,
          },
        ]);
      }
      const newNotif: NotificationItem = {
        ...notif,
        id: `n-${notifIdRef.current++}`,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    },
    [],
  );

  const addMerchSale = useCallback(
    (productId: string) => {
      setMerchProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                totalSales: p.totalSales + 1,
                totalRevenue: p.totalRevenue + p.price,
              }
            : p,
        ),
      );
      const product = merchProducts.find((p) => p.id === productId);
      if (product) {
        setMonetization((prev) => ({
          ...prev,
          merchRevenue: prev.merchRevenue + product.price,
          totalEarnings: prev.totalEarnings + product.price,
          dailyEarnings: prev.dailyEarnings.map((v, i) =>
            i === prev.dailyEarnings.length - 1 ? v + product.price : v,
          ),
        }));
        addNotification({
          icon: "🛍️",
          message: `Someone bought your ${product.name} for $${product.price}! 🎉`,
          type: "merch_sale",
        });
      }
    },
    [merchProducts, addNotification],
  );

  const acceptSponsorship = useCallback(
    (dealId: string) => {
      setMonetization((prev) => {
        const deal = prev.activeSponsorships.find((d) => d.id === dealId);
        if (!deal) return prev;
        addNotification({
          icon: "🤝",
          message: `You accepted the ${deal.brandName} sponsorship deal for $${deal.dealValue.toLocaleString()}!`,
          type: "sponsorship",
        });
        return {
          ...prev,
          sponsorRevenue: prev.sponsorRevenue + deal.dealValue,
          totalEarnings: prev.totalEarnings + deal.dealValue,
          activeSponsorships: prev.activeSponsorships.map((d) =>
            d.id === dealId
              ? { ...d, status: "active" as const, acceptedAt: Date.now() }
              : d,
          ),
        };
      });
    },
    [addNotification],
  );

  const savePost = useCallback((id: string) => {
    setSavedPosts((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, savedByUser: true, saves: p.saves + 1 } : p,
      ),
    );
  }, []);

  const unsavePost = useCallback((id: string) => {
    setSavedPosts((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, savedByUser: false, saves: Math.max(0, p.saves - 1) }
          : p,
      ),
    );
  }, []);

  const likePost = useCallback((id: string) => {
    setLikedPosts((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByUser: true, likes: p.likes + 1 } : p,
      ),
    );
  }, []);

  const unlikePost = useCallback((id: string) => {
    setLikedPosts((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likedByUser: false, likes: Math.max(0, p.likes - 1) }
          : p,
      ),
    );
  }, []);

  const followUser = useCallback((userId: string) => {
    setFollowedUserIds((prev) => {
      const s = new Set(prev);
      s.add(userId);
      return s;
    });
    setProfile((p) => ({ ...p, following: p.following + 1 }));
  }, []);

  const unfollowUser = useCallback((userId: string) => {
    setFollowedUserIds((prev) => {
      const s = new Set(prev);
      s.delete(userId);
      return s;
    });
    setProfile((p) => ({ ...p, following: Math.max(0, p.following - 1) }));
  }, []);

  const addStory = useCallback(
    (story: Story) => {
      setStories((prev) => [story, ...prev]);
      triggerSave();
    },
    [triggerSave],
  );

  const reactToStory = useCallback(
    (storyId: string, reaction: "fire" | "heart" | "laugh") => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const wasReacted = s.userReaction === reaction;
          return {
            ...s,
            userReaction: wasReacted ? null : reaction,
            reactions: {
              ...s.reactions,
              [reaction]: wasReacted
                ? Math.max(0, s.reactions[reaction] - 1)
                : s.reactions[reaction] + 1,
            },
          };
        }),
      );
    },
    [],
  );

  const replyToStory = useCallback(
    (storyId: string, text: string) => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const reply: StoryReply = {
            id: `reply-${Date.now()}`,
            username: profile.username,
            avatar: profile.avatar,
            text,
            createdAt: Date.now(),
          };
          return { ...s, replies: [...s.replies, reply] };
        }),
      );
    },
    [profile.username, profile.avatar],
  );

  const addCommentReply = useCallback(
    (postId: string, commentId: string, reply: CommentReply) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId
                    ? { ...c, replies: [...(c.replies ?? []), reply] }
                    : c,
                ),
              }
            : p,
        ),
      );
    },
    [],
  );

  const [pendingCollabs, setPendingCollabs] = useState<CollabRequest[]>([]);

  // V5: Load saved game state on first render
  useEffect(() => {
    const saved = loadGameState();
    if (!saved) return;
    setProfile(saved.profile as UserProfile);
    setPosts(saved.posts as PostItem[]);
    setSavedPosts(new Set(saved.savedPosts));
    setLikedPosts(new Set(saved.likedPosts));
    setFollowedUserIds(new Set(saved.followedUserIds));
    setConversations(saved.conversations as Conversation[]);
    setAchievements(saved.achievements as Achievement[]);
    setMonetization(saved.monetization as MonetizationData);
    setMerchProducts(saved.merchProducts as MerchProduct[]);
    setHouses(saved.houses as CreatorHouse[]);
    setUserHouseId(saved.userHouseId);
    setCompetitions(saved.competitions as Competition[]);
    setWeeklyChallenges(saved.weeklyChallenges as WeeklyChallenge[]);
    setActivePlatformEvent(saved.activePlatformEvent as PlatformEvent | null);
    setShadowBan(saved.shadowBan as ShadowBan);
    if (typeof saved.reputationScore === "number")
      setReputationScore(saved.reputationScore);
    if (typeof saved.burnoutActive === "boolean")
      setBurnoutActive(saved.burnoutActive);
    if (typeof saved.coldAudienceActive === "boolean")
      setColdAudienceActive(saved.coldAudienceActive);
    setContentSeries(saved.contentSeries as ContentSeries[]);
    setPendingCollabs(saved.pendingCollabs as CollabRequest[]);
    if (typeof saved.creatorCoins === "number")
      setCreatorCoins(saved.creatorCoins);
    if (saved.skills) setSkills(saved.skills as Skills);
    if (saved.agency) setAgency(saved.agency as AgencyState);
    if (Array.isArray(saved.investments))
      setInvestments(saved.investments as InvestmentItem[]);
    if (typeof saved.loginStreak === "number")
      setLoginStreak(saved.loginStreak);
    if (typeof saved.lastLoginDate === "string")
      setLastLoginDate(saved.lastLoginDate);
    if (typeof saved.postingStreak === "number")
      setPostingStreak(saved.postingStreak);
    if (typeof saved.lastPostTime === "number")
      setLastPostTime(saved.lastPostTime);
    if (typeof saved.dailyRewardClaimed === "boolean")
      setDailyRewardClaimed(saved.dailyRewardClaimed);
    if (typeof saved.lastRewardDate === "string")
      setLastRewardDate(saved.lastRewardDate);
    if (saved.savedAt) setLastSaved(saved.savedAt);
    if (Array.isArray(saved.stories)) setStories(saved.stories as Story[]);
    if (saved.rivalCreator) setRivalCreator(saved.rivalCreator as AICreator);
    if (typeof saved.dramaCount === "number") setDramaCount(saved.dramaCount);
    if (typeof saved.fanRebellionActive === "boolean")
      setFanRebellionActive(saved.fanRebellionActive);
    if (typeof saved.platformTakeoverActive === "boolean")
      setPlatformTakeoverActive(saved.platformTakeoverActive);
    if (saved.platformTakeoverEndsAt !== undefined)
      setPlatformTakeoverEndsAt(saved.platformTakeoverEndsAt as number | null);
    if (typeof saved.audienceMoodScore === "number")
      setAudienceMoodScore(saved.audienceMoodScore);
    if (Array.isArray(saved.aiManagerMessages))
      setAiManagerMessages(saved.aiManagerMessages as AiManagerMessage[]);
  }, []);

  const acceptCollab = useCallback(
    (collabId: string) => {
      const collab = pendingCollabs.find((c) => c.id === collabId);
      if (!collab) return;
      const creator = AI_CREATORS.find((c) => c.id === collab.creatorId);
      if (!creator) return;
      const combinedReach = Math.floor(
        (profile.followers + creator.followerCount) / 10,
      );
      const imgSeed = Date.now() % 1000;
      const imageUrl = `https://picsum.photos/seed/${imgSeed}/600/600`;
      const newPost: PostItem = {
        id: `collab-${collabId}`,
        authorName: `${profile.name} & ${creator.name}`,
        authorUsername: "@collab",
        authorUserId: creator.id,
        authorAvatar: creator.avatar,
        imageUrl,
        images: [imageUrl],
        caption: `🤝 Collab post with ${creator.name}! Two creators, one incredible post. #collab #creators`,
        hashtags: ["#collab", "#creators"],
        likes: Math.floor(combinedReach * 0.08),
        comments: [],
        shares: Math.floor(combinedReach * 0.02),
        saves: Math.floor(combinedReach * 0.01),
        views: combinedReach * 2,
        reach: combinedReach,
        impressions: combinedReach * 3,
        followersGained: Math.floor(combinedReach * 0.005),
        timestamp: Date.now(),
        engagementScore: Math.floor(combinedReach * 0.1),
        likedByUser: false,
        savedByUser: false,
        isTrending: true,
        watchTime: 65 + Math.floor(Math.random() * 25),
      };
      setPosts((prev) => [newPost, ...prev]);
      setPendingCollabs((prev) => prev.filter((c) => c.id !== collabId));

      // Audience crossover: 1-5% of creator's followers follow user
      const crossoverPct = 0.01 + Math.random() * 0.04;
      const crossoverFollowers = Math.floor(
        creator.followerCount * crossoverPct,
      );
      setProfile((prev) => ({
        ...prev,
        followers: prev.followers + crossoverFollowers,
      }));

      addNotification({
        icon: "🚀",
        message: `Collab post with ${creator.name} is live! +${crossoverFollowers.toLocaleString()} new followers from audience crossover!`,
        type: "collab_accepted",
      });
    },
    [pendingCollabs, profile, addNotification],
  );

  const addSimulatedPost = useCallback((sp: SimulatedPostData): PostItem => {
    const existing = postsRef.current.find((p) => p.id === sp.id);
    if (existing) return existing;
    const postItem: PostItem = {
      id: sp.id,
      authorName: sp.authorName,
      authorUsername: sp.authorUsername,
      authorUserId: sp.authorId,
      authorAvatar: sp.authorAvatar,
      imageUrl: sp.imageUrl,
      images: sp.images,
      caption: sp.caption,
      hashtags: sp.hashtags,
      likes: sp.likes,
      comments: Array.from({ length: Math.min(sp.commentCount, 5) }, (_, i) =>
        makeComment(i),
      ),
      shares: sp.shares,
      saves: sp.saves,
      views: sp.views,
      reach: sp.reach,
      impressions: sp.impressions,
      followersGained: sp.followersGained,
      timestamp: sp.timestamp,
      engagementScore: sp.engagementScore,
      likedByUser: false,
      savedByUser: false,
      isTrending: sp.isTrending,
      viralStage: 0,
      viralScore: 0,
      watchTime: 45 + Math.floor(Math.random() * 48),
    };
    setPosts((prev) => {
      if (prev.find((p) => p.id === sp.id)) return prev;
      return [...prev, postItem];
    });
    return postItem;
  }, []);

  // Phase 2 functions
  const negotiateSponsorship = useCallback(
    (dealId: string, multiplier: 1.25 | 1.5 | 2) => {
      const accepted =
        multiplier === 1.25
          ? true
          : multiplier === 1.5
            ? Math.random() < 0.7
            : Math.random() < 0.4;
      setMonetization((prev) => {
        const deal = prev.activeSponsorships.find((d) => d.id === dealId);
        if (!deal) return prev;
        if (accepted) {
          const newValue = deal.dealValue * multiplier;
          addNotification({
            icon: "🤝",
            message: `${deal.brandName} accepted your ${multiplier}x counter-offer! Deal secured for $${newValue.toLocaleString()}! 🎉`,
            type: "sponsorship",
          });
          setReputationScore((prev) => Math.min(100, prev + 5));
          return {
            ...prev,
            sponsorRevenue: prev.sponsorRevenue + newValue,
            totalEarnings: prev.totalEarnings + newValue,
            activeSponsorships: prev.activeSponsorships.map((d) =>
              d.id === dealId
                ? {
                    ...d,
                    dealValue: newValue,
                    status: "active" as const,
                    acceptedAt: Date.now(),
                  }
                : d,
            ),
          };
        }
        addNotification({
          icon: "❌",
          message: `${deal.brandName} rejected your ${multiplier}x counter-offer. The deal fell through.`,
          type: "sponsorship",
        });
        return {
          ...prev,
          activeSponsorships: prev.activeSponsorships.filter(
            (d) => d.id !== dealId,
          ),
        };
      });
    },
    [addNotification],
  );

  const addPostToSeries = useCallback(
    (postId: string, seriesName: string) => {
      const trimmed = seriesName.trim();
      if (!trimmed) return;
      setContentSeries((prev) => {
        const existing = prev.find(
          (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existing) {
          if (existing.postIds.length >= 1) {
            addNotification({
              icon: "📺",
              message: `New episode of "${existing.name}" is live! Your audience will love it 🔥`,
              type: "smart",
            });
          }
          return prev.map((s) =>
            s.id === existing.id
              ? { ...s, postIds: [...s.postIds, postId] }
              : s,
          );
        }
        return [
          ...prev,
          { id: `series-${Date.now()}`, name: trimmed, postIds: [postId] },
        ];
      });
    },
    [addNotification],
  );

  const boostFollowers = useCallback(
    (amount: number) => {
      const steps = 20;
      const perStep = Math.floor(amount / steps);
      let added = 0;
      const interval = setInterval(() => {
        added += perStep;
        setProfile((prev) => ({
          ...prev,
          followers: prev.followers + perStep,
        }));
        if (added >= amount) clearInterval(interval);
      }, 60);
      addNotification({
        icon: "\ud83d\ude80",
        message: `Boost activated! You gained ${amount.toLocaleString()} followers!`,
        type: "boost",
      });
    },
    [addNotification],
  );

  // V4 Phase 4 actions
  const joinHouse = useCallback(
    (houseId: string) => {
      const house = houses.find((h) => h.id === houseId);
      if (!house) return;
      setUserHouseId(houseId);
      setHouses((prev) =>
        prev.map((h) =>
          h.id === houseId
            ? {
                ...h,
                members: [
                  ...h.members,
                  {
                    id: "user",
                    name: profile.name,
                    username: profile.username,
                    avatar: profile.avatar,
                    followers: profile.followers,
                  },
                ],
                totalFollowers: h.totalFollowers + profile.followers,
              }
            : h,
        ),
      );
      addNotification({
        icon: "🏠",
        message: `You joined ${house.name}! Welcome to the crew!`,
        type: "house",
      });
    },
    [houses, profile, addNotification],
  );

  const createHouse = useCallback(
    (name: string, emoji: string, niche: string) => {
      const newHouse: CreatorHouse = {
        id: `house-user-${Date.now()}`,
        name,
        emoji,
        niche,
        members: [
          {
            id: "user",
            name: profile.name,
            username: profile.username,
            avatar: profile.avatar,
            followers: profile.followers,
          },
        ],
        totalFollowers: profile.followers,
        rank: houses.length + 1,
      };
      setHouses((prev) => [...prev, newHouse]);
      setUserHouseId(newHouse.id);
      addNotification({
        icon: "🏠",
        message: `${name} is now live! Start recruiting creators!`,
        type: "house",
      });
    },
    [houses, profile, addNotification],
  );

  const joinCompetition = useCallback(
    (competitionId: string) => {
      setCompetitions((prev) =>
        prev.map((c) => {
          if (c.id !== competitionId) return c;
          const userEntry: CompetitionEntry = {
            userId: "user",
            name: profile.name,
            username: profile.username,
            avatar: profile.avatar,
            score: 0,
          };
          return {
            ...c,
            joined: true,
            leaderboard: [...c.leaderboard, userEntry].sort(
              (a, b) => b.score - a.score,
            ),
          };
        }),
      );
    },
    [profile],
  );

  const claimChallengeReward = useCallback(
    (challengeId: string) => {
      const challenge = weeklyChallenges.find((c) => c.id === challengeId);
      if (!challenge || !challenge.completed || challenge.rewardClaimed) return;
      setWeeklyChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId ? { ...c, rewardClaimed: true } : c,
        ),
      );
      setProfile((prev) => ({
        ...prev,
        xp: prev.xp + 500,
        followers: prev.followers + 500,
      }));
      addNotification({
        icon: "🎁",
        message: `Challenge reward claimed: ${challenge.reward}`,
        type: "achievement",
      });
    },
    [weeklyChallenges, addNotification],
  );

  // Phase 2: Fan Loyalty upgrade simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFanLoyalty((prev) => {
        const upgradeAmount = Math.floor(prev.fans * 0.005 + Math.random() * 3);
        if (upgradeAmount < 1) return prev;
        const upgradeToSuper = Math.max(0, Math.floor(upgradeAmount * 0.7));
        const upgradeToVip = Math.max(0, Math.floor(prev.superFans * 0.003));
        const upgradeToUltra = Math.max(0, Math.floor(prev.vipFans * 0.001));
        if (upgradeToSuper > 0) {
          addNotification({
            icon: "⭐",
            message: `${upgradeToSuper} fans upgraded to Super Fan! Your content is building loyalty!`,
            type: "smart",
          });
        }
        return {
          fans: Math.max(0, prev.fans - upgradeToSuper),
          superFans: prev.superFans + upgradeToSuper - upgradeToVip,
          vipFans: prev.vipFans + upgradeToVip - upgradeToUltra,
          ultraFans: prev.ultraFans + upgradeToUltra,
        };
      });
    }, 45000);
    return () => clearInterval(interval);
  }, [addNotification]);

  // Phase 2: Burnout & cold audience system
  useEffect(() => {
    const coldTimer = setInterval(() => {
      const timestamps = postTimestampsRef.current;
      const now = Date.now();
      const recentPosts = timestamps.filter((t) => now - t < 120000); // within 2 min (simulated)
      if (recentPosts.length >= 4 && !burnoutActive) {
        setBurnoutActive(true);
        setReputationScore((prev) => Math.max(0, prev - 5));
        addNotification({
          icon: "🔥",
          message:
            "Burnout Warning 🔥 — you've been posting too fast! Your audience needs a break. Reach reduced.",
          type: "smart",
        });
        setTimeout(() => setBurnoutActive(false), 180000);
      }
      const lastPost = timestamps[timestamps.length - 1];
      if (lastPost && now - lastPost > 300000 && !coldAudienceActive) {
        setColdAudienceActive(true);
        addNotification({
          icon: "❄️",
          message:
            "Your audience is getting cold ❄️ — post something to keep your engagement up!",
          type: "smart",
        });
      } else if (lastPost && now - lastPost < 120000 && coldAudienceActive) {
        setColdAudienceActive(false);
      }
    }, 30000);
    return () => clearInterval(coldTimer);
  }, [burnoutActive, coldAudienceActive, addNotification]);

  // Audience mood calculation
  useEffect(() => {
    const now = Date.now();
    const hoursSincePost =
      lastPostTime > 0 ? (now - lastPostTime) / 3600000 : 999;
    if (burnoutActive || hoursSincePost >= 48) {
      setAudienceMood("angry");
    } else if (hoursSincePost >= 24) {
      setAudienceMood("bored");
    } else if (postingStreak > 3) {
      setAudienceMood("hyped");
    } else {
      setAudienceMood("neutral");
    }
  }, [burnoutActive, lastPostTime, postingStreak]);

  // Audience mood score update logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const hoursSincePost =
        lastPostTime > 0 ? (now - lastPostTime) / 3600000 : 999;
      setAudienceMoodScore((prev) => {
        let score = prev;
        if (hoursSincePost >= 4) score = Math.max(0, score - 5);
        if (burnoutActive) score = Math.max(0, score - 8);
        score = Math.max(0, Math.min(100, score));
        return score;
      });
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [lastPostTime, burnoutActive]);

  // Update mood tier from score
  useEffect(() => {
    if (audienceMoodScore >= 75) setAudienceMood("hyped");
    else if (audienceMoodScore >= 40) setAudienceMood("neutral");
    else if (audienceMoodScore >= 20) setAudienceMood("bored");
    else setAudienceMood("angry");
  }, [audienceMoodScore]);

  // Creator Energy: passive regen every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCreatorEnergy((prev) => {
        if (prev >= 100) return 100;
        const regenRate = restModeActive ? 2 : 1;
        const next = Math.min(100, prev + regenRate);
        setLastEnergyUpdate(Date.now());
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [restModeActive]);

  // Platform takeover auto-end
  useEffect(() => {
    if (!platformTakeoverActive || !platformTakeoverEndsAt) return;
    const remaining = platformTakeoverEndsAt - Date.now();
    if (remaining <= 0) {
      setPlatformTakeoverActive(false);
      setPlatformTakeoverEndsAt(null);
      return;
    }
    const t = setTimeout(() => {
      setPlatformTakeoverActive(false);
      setPlatformTakeoverEndsAt(null);
    }, remaining);
    return () => clearTimeout(t);
  }, [platformTakeoverActive, platformTakeoverEndsAt]);

  // Fan rebellion auto-stop when player posts (lastPostTime changes)
  useEffect(() => {
    if (!fanRebellionActive) return;
    const now = Date.now();
    const msSincePost =
      lastPostTime > 0 ? now - lastPostTime : Number.POSITIVE_INFINITY;
    if (msSincePost < 20 * 60 * 1000) {
      setFanRebellionActive(false);
    }
  }, [lastPostTime, fanRebellionActive]);

  // Sponsor Bidding War random trigger (every 15-25 minutes)
  const biddingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isNewUser) return;
    const scheduleNext = () => {
      const delay = (15 + Math.random() * 10) * 60 * 1000;
      biddingTimerRef.current = setTimeout(() => {
        triggerBiddingWar();
        addNotification({
          icon: "🔥",
          message:
            "Bidding War Started! Brands are competing for your channel!",
          type: "sponsorship",
        });
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (biddingTimerRef.current) clearTimeout(biddingTimerRef.current);
    };
  }, [isNewUser, triggerBiddingWar, addNotification]);

  // Sponsor Bidding War follower milestone trigger
  const biddingMilestonesRef = useRef<Set<number>>(new Set([0]));
  useEffect(() => {
    const milestones = [50000, 100000, 500000, 1000000];
    for (const m of milestones) {
      if (profile.followers >= m && !biddingMilestonesRef.current.has(m)) {
        biddingMilestonesRef.current.add(m);
        triggerBiddingWar();
        addNotification({
          icon: "🏆",
          message: `Milestone! Brands are bidding to sponsor your ${(m / 1000).toFixed(0)}K channel!`,
          type: "sponsorship",
        });
        break;
      }
    }
  }, [profile.followers, triggerBiddingWar, addNotification]);

  // Smart notification scheduler
  const smartNotifFiredRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    // "Best time to post" every 8-12 min
    function schedulePostingTime() {
      const t = setTimeout(
        () => {
          addNotification({
            icon: "⏰",
            message:
              "Audience activity is peaking right now — great time to post!",
            type: "smart",
          });
          schedulePostingTime();
        },
        rand(480000, 720000),
      );
      timers.push(t);
    }
    schedulePostingTime();

    // "Audience active" every 10-15 min
    function scheduleAudienceActive() {
      const t = setTimeout(
        () => {
          addNotification({
            icon: "🔥",
            message: "Your audience is highly active right now — engage them!",
            type: "smart",
          });
          scheduleAudienceActive();
        },
        rand(600000, 900000),
      );
      timers.push(t);
    }
    scheduleAudienceActive();

    // Watch time alert after 5 min, once per session
    const watchT = setTimeout(() => {
      if (!smartNotifFiredRef.current.has("watch_time")) {
        smartNotifFiredRef.current.add("watch_time");
        addNotification({
          icon: "👁",
          message:
            "Posts with high watch time are getting 2x reach today — keep them hooked!",
          type: "smart",
        });
      }
    }, 300000);
    timers.push(watchT);

    return () => timers.forEach(clearTimeout);
  }, [addNotification]);

  // Progressive story view simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const hour = new Date(now).getHours();
      const timeMult =
        hour >= 18 && hour <= 22 ? 1.3 : hour >= 12 && hour <= 17 ? 1.1 : 0.8;
      setStories((prev) =>
        prev.map((s) => {
          const isOwn = s.userId === "me";
          if (isOwn) {
            const ageMin = (now - s.createdAt) / 60000;
            let baseGrowthRate: number;
            if (ageMin < 5) baseGrowthRate = 0.01 + Math.random() * 0.02;
            else if (ageMin < 30) baseGrowthRate = 0.005 + Math.random() * 0.01;
            else if (ageMin < 120)
              baseGrowthRate = 0.003 + Math.random() * 0.005;
            else baseGrowthRate = 0.0005 + Math.random() * 0.001;
            const variation = 0.8 + Math.random() * 0.4;
            const addViews = Math.floor(
              profile.followers * baseGrowthRate * variation * timeMult,
            );
            const newViewCount = Math.min(
              s.viewCount + addViews,
              Math.floor(profile.followers * 0.85),
            );
            const newViewRate = Math.min(
              (newViewCount / Math.max(profile.followers, 1)) * 100,
              80,
            );
            return {
              ...s,
              viewCount: newViewCount,
              viewRate: newViewRate,
              peakReached: s.peakReached || newViewRate > 30,
            };
          }
          const addViews = Math.floor(50 + Math.random() * 450);
          const cap = 50000;
          return { ...s, viewCount: Math.min(s.viewCount + addViews, cap) };
        }),
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [profile.followers]);

  // Update performanceDelta for user stories every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setStories((prev) => {
        const userStories = prev.filter((s) => s.userId === "me");
        if (userStories.length === 0) return prev;
        const avgViewRate =
          userStories.reduce((acc, s) => acc + s.viewRate, 0) /
          userStories.length;
        return prev.map((s) => {
          if (s.userId !== "me") return s;
          return {
            ...s,
            performanceDelta:
              avgViewRate > 0
                ? ((s.viewRate - avgViewRate) / avgViewRate) * 100
                : 0,
          };
        });
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const activeStories = stories.filter(
    (s) => (s.expiresAt ?? s.createdAt + TWENTY_FOUR_HOURS) > Date.now(),
  );

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        posts,
        setPosts,
        savedPosts,
        likedPosts,
        followedUserIds,
        stories: activeStories,
        notifications,
        addNotification,
        conversations,
        setConversations,
        achievements,
        setAchievements,
        unreadDMs,
        setUnreadDMs,
        hideMobileNav,
        setHideMobileNav,
        analyticsData,
        setAnalyticsData,
        monetization,
        setMonetization,
        merchProducts,
        setMerchProducts,
        addMerchSale,
        acceptSponsorship,
        aiCreators: AI_CREATORS,
        pendingCollabs,
        acceptCollab,
        boostFollowers,
        savePost,
        unsavePost,
        likePost,
        unlikePost,
        followUser,
        unfollowUser,
        addStory,
        reactToStory,
        replyToStory,
        addCommentReply,
        addSimulatedPost,
        currentRoute,
        navigate,
        houses,
        setHouses,
        userHouseId,
        setUserHouseId,
        competitions,
        setCompetitions,
        weeklyChallenges,
        setWeeklyChallenges,
        activePlatformEvent,
        setActivePlatformEvent,
        shadowBan,
        setShadowBan,
        audienceRegions,
        joinHouse,
        createHouse,
        joinCompetition,
        claimChallengeReward,
        // Phase 2
        fanLoyalty,
        reputationScore,
        burnoutActive,
        coldAudienceActive,
        contentSeries,
        negotiateSponsorship,
        addPostToSeries,
        sessionStartFollowers: sessionStartFollowers.current,
        isNewUser,
        setIsNewUser,
        creatorCoins,
        setCreatorCoins,
        lastSaved,
        isSaving,
        triggerSave,
        newGame,
        // V5 Pass 2
        skills,
        setSkills,
        agency,
        setAgency,
        investments,
        setInvestments,
        loginStreak,
        setLoginStreak,
        lastLoginDate,
        setLastLoginDate,
        postingStreak,
        setPostingStreak,
        lastPostTime,
        setLastPostTime,
        dailyRewardClaimed,
        setDailyRewardClaimed,
        lastRewardDate,
        setLastRewardDate,
        audienceMood,
        setAudienceMood,
        audienceMoodScore,
        setAudienceMoodScore,
        aiManagerMessages,
        setAiManagerMessages,
        // Batch 4
        legacyScore,
        setLegacyScore,
        updateLegacyScore,
        celebrityMode,
        // Algorithm Hacks
        activeAlgoHack,
        setActiveAlgoHack,
        algoHackHistory,
        setAlgoHackHistory,
        // Sponsor Bidding Wars
        activeBiddingWar,
        biddingWarHistory,
        acceptBiddingDeal,
        triggerBiddingWar,
        // Creator Energy
        creatorEnergy,
        setCreatorEnergy,
        lastEnergyUpdate,
        burnoutExpiresAt,
        energyHistory,
        restModeActive,
        restModeExpiresAt,
        lastRestModeUsed,
        activateRestMode,
        drainEnergy,
        // Batch 2
        rivalCreator,
        setRivalCreator,
        dramaCount,
        setDramaCount,
        fanRebellionActive,
        setFanRebellionActive,
        platformTakeoverActive,
        setPlatformTakeoverActive,
        platformTakeoverEndsAt,
        setPlatformTakeoverEndsAt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#\w+/g);
  return matches ? matches.map((t) => t.toLowerCase()) : [];
}
