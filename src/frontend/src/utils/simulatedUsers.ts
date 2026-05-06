export interface SimulatedUser {
  id: string;
  index: number;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  creatorLevel: number;
  postsCount: number;
  engagementScore: number;
}

export interface SimulatedPostData {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  imageUrl: string;
  images: string[];
  caption: string;
  likes: number;
  commentCount: number;
  shares: number;
  views: number;
  saves: number;
  engagementScore: number;
  timestamp: number;
  isTrending: boolean;
  hashtags: string[];
  reach: number;
  impressions: number;
  followersGained: number;
}

const FIRST_NAMES = [
  "Alex",
  "Sam",
  "Mia",
  "Jordan",
  "Riley",
  "Casey",
  "Morgan",
  "Taylor",
  "Quinn",
  "Avery",
  "Blake",
  "Cameron",
  "Dakota",
  "Elliot",
  "Finley",
  "Gray",
  "Harper",
  "Indigo",
  "Jamie",
  "Kai",
];
const LAST_NAMES = [
  "Chen",
  "Rodriguez",
  "Torres",
  "Park",
  "Thompson",
  "Williams",
  "Davis",
  "Brown",
  "Martinez",
  "Johnson",
  "Wilson",
  "Lee",
  "Hall",
  "Turner",
  "Moore",
  "Anderson",
  "Jackson",
  "White",
  "Harris",
  "Clark",
];
const BIOS = [
  "Content creator & storyteller 📸",
  "Travel enthusiast 🌍 | Lifestyle blogger",
  "Photography | Art | Life ✨",
  "Digital creator | Building my brand 🚀",
  "Sharing moments that matter 💫",
  "Coffee lover ☕ | Creative soul",
  "Life is an adventure 🏔️",
  "Making memories one post at a time 📱",
  "Visual storyteller | Dreamer",
  "Capturing life's beautiful chaos 🌈",
  "Tech & design 💻 | Creating daily",
  "Fitness + mindset 💪 | Inspire to be great",
];

const CAPTIONS_WITH_TAGS = [
  [
    "Golden hour magic ✨ The light was absolutely perfect today",
    "#photography #golden #sunset",
  ],
  [
    "Adventure is calling and I must go 🏔️ Breathtaking views at every turn",
    "#travel #explore #mountains",
  ],
  ["Sunday vibes only ☀️ Living my best life", "#lifestyle #chill #weekend"],
  [
    "Making memories that last forever 💫 Cherish every moment",
    "#life #moments #memories",
  ],
  [
    "City lights never get old 🌆 This skyline is unreal",
    "#citylife #urban #nightlife",
  ],
  [
    "Nature therapy is real 🌿 This hike was absolutely worth it",
    "#nature #outdoors #hiking",
  ],
  [
    "Chasing sunsets every chance I get 🌅 Today's was a masterpiece",
    "#sunset #golden #travel",
  ],
  [
    "Coffee and good vibes only ☕ Starting the morning right",
    "#morning #coffee #vibes",
  ],
  [
    "Lost in the right direction 🗺️ Every road leads somewhere beautiful",
    "#travel #wanderlust #adventure",
  ],
  [
    "Creating something beautiful every day ✨ Art is life",
    "#creative #art #design",
  ],
  [
    "Fresh air clears the mind 🌲 Nature never disappoints",
    "#nature #wellness #mindful",
  ],
  [
    "The world is full of magic if you know where to look 🌟",
    "#wonder #explore #magic",
  ],
  ["Just dropped a new look 🔥 What do you think?", "#fashion #style #ootd"],
  [
    "Hustle hard, rest harder 💪 Balance is everything",
    "#motivation #fitness #grind",
  ],
  [
    "Throwback to this perfect day 🏖️ Need to go back ASAP",
    "#throwback #beach #vacation",
  ],
  [
    "Food that looks as good as it tastes 🍝 Recipe coming soon",
    "#foodie #cooking #recipe",
  ],
  [
    "When the light hits just right 📷 Photography is my meditation",
    "#photography #portrait #light",
  ],
  [
    "New beginnings ✨ Every day is a fresh start",
    "#inspiration #motivation #mindset",
  ],
  [
    "Building something amazing one brick at a time 🏗️",
    "#startup #entrepreneur #hustle",
  ],
  [
    "Grateful for every single moment 🙏 Life is beautiful",
    "#grateful #blessed #positivity",
  ],
];

const IMAGE_SEEDS = [
  "travel",
  "nature",
  "city",
  "food",
  "portrait",
  "art",
  "fashion",
  "tech",
  "sports",
  "music",
  "arch",
  "street",
  "beach",
  "mountain",
  "sky",
];

function seededRand(seed: number): number {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const FIXED_USERS: Record<number, SimulatedUser> = {
  1: {
    id: "1",
    index: 1,
    username: "@samchen",
    displayName: "Sam Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    bio: "Tech enthusiast & creative photographer 📸",
    followerCount: 12400,
    followingCount: 892,
    creatorLevel: 5,
    postsCount: 48,
    engagementScore: 48200,
  },
  2: {
    id: "2",
    index: 2,
    username: "@miatorres",
    displayName: "Mia Torres",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mia",
    bio: "Travel | Lifestyle | Wellness 🌍✨",
    followerCount: 28600,
    followingCount: 1240,
    creatorLevel: 7,
    postsCount: 112,
    engagementScore: 112000,
  },
  3: {
    id: "3",
    index: 3,
    username: "@jordankim",
    displayName: "Jordan Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    bio: "Portrait & street photography 📷 Telling stories",
    followerCount: 8900,
    followingCount: 540,
    creatorLevel: 4,
    postsCount: 67,
    engagementScore: 35600,
  },
  4: {
    id: "4",
    index: 4,
    username: "@rileylee",
    displayName: "Riley Lee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
    bio: "Fashion creator 👗 Building a community",
    followerCount: 45200,
    followingCount: 2100,
    creatorLevel: 9,
    postsCount: 234,
    engagementScore: 208000,
  },
};

export function generateUser(index: number): SimulatedUser {
  if (FIXED_USERS[index]) return FIXED_USERS[index];
  const r = (offset: number) => seededRand(index * 31 + offset);
  const firstName = FIRST_NAMES[Math.floor(r(1) * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(r(2) * LAST_NAMES.length)];
  const num = Math.floor(r(3) * 900) + 10;
  const followers = Math.floor(r(5) * 900000) + 500;
  const level = Math.min(10, Math.floor(r(7) * 10) + 1);
  return {
    id: String(index),
    index,
    username: `@${firstName.toLowerCase()}${lastName.toLowerCase()}${num}`,
    displayName: `${firstName} ${lastName}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    bio: BIOS[Math.floor(r(4) * BIOS.length)],
    followerCount: followers,
    followingCount: Math.floor(r(6) * 2000) + 50,
    creatorLevel: level,
    postsCount: Math.floor(r(8) * 300) + 5,
    engagementScore: Math.floor(followers * r(9) * 0.3),
  };
}

export function generatePostsForUser(
  userIndex: number,
  count: number,
  startOffset = 0,
): SimulatedPostData[] {
  const user = generateUser(userIndex);
  return Array.from({ length: count }, (_, i) => {
    const postIndex = userIndex * 1000 + startOffset + i;
    const r = (off: number) => seededRand(postIndex * 17 + off);
    const captionEntry =
      CAPTIONS_WITH_TAGS[Math.floor(r(1) * CAPTIONS_WITH_TAGS.length)];
    const caption = captionEntry[0];
    const tagStr = captionEntry[1];
    const hashtags = tagStr.match(/#\w+/g) ?? [];
    const imageSeed = IMAGE_SEEDS[Math.floor(r(2) * IMAGE_SEEDS.length)];
    const imgNum = Math.floor(r(3) * 900) + 100;
    const viewerBase = Math.floor(user.followerCount * (0.05 + r(4) * 0.15));
    const likes = Math.floor(viewerBase * (0.06 + r(5) * 0.04));
    const comments = Math.floor(viewerBase * (0.005 + r(6) * 0.015));
    const shares = Math.floor(viewerBase * (0.002 + r(7) * 0.008));
    const score = likes + comments * 2 + shares * 3;
    const multiImage = r(10) < 0.3;
    const images = multiImage
      ? Array.from(
          { length: Math.floor(r(11) * 3) + 2 },
          (_, mi) =>
            `https://picsum.photos/seed/${imageSeed}${imgNum + mi}/600/400`,
        )
      : [`https://picsum.photos/seed/${imageSeed}${imgNum}/600/400`];
    const hoursAgo = Math.floor(r(8) * 48) + 1;
    return {
      id: `sp-${postIndex}`,
      authorId: user.id,
      authorName: user.displayName,
      authorUsername: user.username,
      authorAvatar: user.avatar,
      imageUrl: images[0],
      images,
      caption: `${caption} ${tagStr}`,
      likes,
      commentCount: comments,
      shares,
      views: viewerBase,
      saves: Math.floor(likes * 0.12),
      engagementScore: score,
      timestamp: Date.now() - hoursAgo * 3600000,
      isTrending: score > 500,
      hashtags,
      reach: Math.floor(viewerBase * 0.8),
      impressions: Math.floor(viewerBase * 1.3),
      followersGained: Math.floor(shares * 0.7 + comments * 0.2 + likes * 0.03),
    };
  });
}

export function getTopCreators(count: number): SimulatedUser[] {
  return Array.from({ length: count }, (_, i) => generateUser(i + 1)).sort(
    (a, b) => b.followerCount - a.followerCount,
  );
}
