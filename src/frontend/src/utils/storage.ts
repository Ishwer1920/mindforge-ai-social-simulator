// MindForge V5 — LocalStorage Persistence Utility

const STORAGE_KEY = "mindforge_v5";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export interface SavedGameState {
  profile: {
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
  };
  posts: unknown[];
  savedPosts: string[];
  likedPosts: string[];
  followedUserIds: string[];
  notifications: unknown[];
  conversations: unknown[];
  achievements: unknown[];
  unreadDMs: number;
  analyticsData: unknown;
  monetization: unknown;
  merchProducts: unknown[];
  houses: unknown[];
  userHouseId: string | null;
  competitions: unknown[];
  weeklyChallenges: unknown[];
  activePlatformEvent: unknown;
  shadowBan: unknown;
  fanLoyalty: unknown;
  reputationScore: number;
  burnoutActive: boolean;
  coldAudienceActive: boolean;
  contentSeries: unknown[];
  pendingCollabs: unknown[];
  creatorCoins: number;
  skills?: unknown;
  agency?: unknown;
  investments?: unknown[];
  loginStreak?: number;
  lastLoginDate?: string;
  postingStreak?: number;
  lastPostTime?: number;
  dailyRewardClaimed?: boolean;
  lastRewardDate?: string;
  stories?: unknown[];
  rivalCreator?: unknown;
  dramaCount?: number;
  fanRebellionActive?: boolean;
  platformTakeoverActive?: boolean;
  platformTakeoverEndsAt?: number | null;
  audienceMoodScore?: number;
  aiManagerMessages?: unknown[];
  savedAt: number;
}

export function saveGameState(state: SavedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (quota exceeded, private mode)
  }
}

export function saveGameStateDebounced(
  state: SavedGameState,
  onSaving: () => void,
  onSaved: () => void,
  delay = 2000,
): void {
  onSaving();
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveGameState(state);
    onSaved();
  }, delay);
}

export function loadGameState(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGameState;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
