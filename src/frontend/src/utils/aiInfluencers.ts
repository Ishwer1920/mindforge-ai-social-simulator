import type { SimulatedPostData } from "./simulatedUsers";

export type AICreatorNiche =
  | "fitness"
  | "tech"
  | "comedy"
  | "fashion"
  | "gaming"
  | "food"
  | "travel"
  | "education";

export type AIPersonality =
  | "comedian"
  | "motivator"
  | "photographer"
  | "tech_reviewer"
  | "meme_creator";

export interface AICreator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  niche: AICreatorNiche;
  personality: AIPersonality;
  followerCount: number;
  followingCount: number;
  engagementRate: number;
  postingFrequency: "low" | "medium" | "high";
  creatorLevel: number;
  postsCount: number;
  engagementScore: number;
}

const NICHE_BIOS: Record<AICreatorNiche, string[]> = {
  fitness: [
    "Helping you crush your fitness goals 💪",
    "Personal trainer & wellness coach. Train hard, live well.",
    "Building strength, one rep at a time 🏋️",
  ],
  tech: [
    "Exploring the future of technology 🔬",
    "Developer, tinkerer, tech enthusiast. Always building something.",
    "Gadgets, code & deep dives into the tech world 💻",
  ],
  comedy: [
    "Making the internet laugh, one post at a time 😂",
    "Humor is the best medicine. Daily laughs guaranteed.",
    "Life is too short to be serious 🙃",
  ],
  fashion: [
    "Style is a form of self-expression 👗",
    "Fashion lover & trend watcher. Outfits = art.",
    "Curating looks that inspire ✨",
  ],
  gaming: [
    "Gamer by day, streamer by night 🎮",
    "Level up your life. Gaming tips & reviews.",
    "Controller in hand, always. GG 🕹️",
  ],
  food: [
    "Eating my way through life 🍜",
    "Recipes, restaurant reviews & food adventures.",
    "Food is love. Food is life. 🍕",
  ],
  travel: [
    "The world is too beautiful not to explore 🌍",
    "Passport stamps collector. Travel tips & destinations.",
    "Life is short — book the flight ✈️",
  ],
  education: [
    "Knowledge is power. Learn something new every day 📚",
    "Educator & lifelong learner. Simplifying complex ideas.",
    "Making learning fun and accessible 🧠",
  ],
};

const CREATOR_DATA: {
  name: string;
  username: string;
  niche: AICreatorNiche;
  personality: AIPersonality;
}[] = [
  {
    name: "Jake Rivera",
    username: "techwithjake",
    niche: "tech",
    personality: "tech_reviewer",
  },
  {
    name: "Mia Chen",
    username: "mia.vibes",
    niche: "fashion",
    personality: "photographer",
  },
  {
    name: "DankMaster",
    username: "dankmaster99",
    niche: "comedy",
    personality: "meme_creator",
  },
  {
    name: "FitWithAlex",
    username: "fitwithAlex",
    niche: "fitness",
    personality: "motivator",
  },
  {
    name: "GamerPro",
    username: "gamerpro_hq",
    niche: "gaming",
    personality: "tech_reviewer",
  },
  {
    name: "Chef Marco",
    username: "chefmarco",
    niche: "food",
    personality: "photographer",
  },
  {
    name: "Wanderlust Sam",
    username: "wanderlust_sam",
    niche: "travel",
    personality: "photographer",
  },
  {
    name: "ProfSpark",
    username: "profspark",
    niche: "education",
    personality: "motivator",
  },
  {
    name: "LaughFactory",
    username: "laughfactory",
    niche: "comedy",
    personality: "comedian",
  },
  {
    name: "TechGuru",
    username: "techguru_x",
    niche: "tech",
    personality: "tech_reviewer",
  },
  {
    name: "StyleQueen",
    username: "stylequeen_",
    niche: "fashion",
    personality: "photographer",
  },
  {
    name: "GainTrain",
    username: "gaintrain",
    niche: "fitness",
    personality: "motivator",
  },
  {
    name: "PixelPusher",
    username: "pixelpusher",
    niche: "gaming",
    personality: "comedian",
  },
  {
    name: "FoodieLife",
    username: "foodie_life",
    niche: "food",
    personality: "photographer",
  },
  {
    name: "EarthExplorer",
    username: "earth_explorer",
    niche: "travel",
    personality: "motivator",
  },
  {
    name: "MindHacks",
    username: "mindhacks",
    niche: "education",
    personality: "tech_reviewer",
  },
  {
    name: "MemeGod",
    username: "meme_god",
    niche: "comedy",
    personality: "meme_creator",
  },
  {
    name: "ByteBuilder",
    username: "bytebuilder",
    niche: "tech",
    personality: "tech_reviewer",
  },
  {
    name: "Vogue Vic",
    username: "voguevic",
    niche: "fashion",
    personality: "photographer",
  },
  {
    name: "IronMind",
    username: "iron_mind",
    niche: "fitness",
    personality: "motivator",
  },
  {
    name: "NoobSlayer",
    username: "noob_slayer",
    niche: "gaming",
    personality: "comedian",
  },
  {
    name: "SpicyBites",
    username: "spicybites",
    niche: "food",
    personality: "meme_creator",
  },
  {
    name: "JetSetter",
    username: "jetsetter_",
    niche: "travel",
    personality: "photographer",
  },
  {
    name: "BrainBoost",
    username: "brainboost",
    niche: "education",
    personality: "motivator",
  },
  {
    name: "LolDaily",
    username: "loldaily",
    niche: "comedy",
    personality: "comedian",
  },
  {
    name: "DevDave",
    username: "devdave",
    niche: "tech",
    personality: "tech_reviewer",
  },
  {
    name: "FashionFwd",
    username: "fashionfwd",
    niche: "fashion",
    personality: "photographer",
  },
  {
    name: "LiftBro",
    username: "lift_bro",
    niche: "fitness",
    personality: "comedian",
  },
  {
    name: "GameZone",
    username: "game_zone",
    niche: "gaming",
    personality: "tech_reviewer",
  },
  {
    name: "TasteTest",
    username: "tastetest",
    niche: "food",
    personality: "comedian",
  },
  {
    name: "GlobeTrekker",
    username: "globetrekker",
    niche: "travel",
    personality: "motivator",
  },
  {
    name: "ClassicLearn",
    username: "classic_learn",
    niche: "education",
    personality: "photographer",
  },
  {
    name: "ViralJokes",
    username: "viraljokes",
    niche: "comedy",
    personality: "meme_creator",
  },
  {
    name: "CircuitKing",
    username: "circuitking",
    niche: "tech",
    personality: "motivator",
  },
  {
    name: "ThreadsMuse",
    username: "threadsmuse",
    niche: "fashion",
    personality: "photographer",
  },
  {
    name: "MacroFit",
    username: "macrofit",
    niche: "fitness",
    personality: "tech_reviewer",
  },
  {
    name: "QuestMaster",
    username: "questmaster",
    niche: "gaming",
    personality: "motivator",
  },
  {
    name: "UmamiChef",
    username: "umami_chef",
    niche: "food",
    personality: "photographer",
  },
  {
    name: "PolarPete",
    username: "polar_pete",
    niche: "travel",
    personality: "comedian",
  },
  {
    name: "ScienceYo",
    username: "science_yo",
    niche: "education",
    personality: "meme_creator",
  },
  {
    name: "GiggleBox",
    username: "gigglebox",
    niche: "comedy",
    personality: "comedian",
  },
  {
    name: "NanoTech",
    username: "nanotech",
    niche: "tech",
    personality: "tech_reviewer",
  },
  {
    name: "LookBook",
    username: "lookbook",
    niche: "fashion",
    personality: "photographer",
  },
  {
    name: "ZenRunner",
    username: "zenrunner",
    niche: "fitness",
    personality: "motivator",
  },
  {
    name: "RetroGamer",
    username: "retrogamer",
    niche: "gaming",
    personality: "meme_creator",
  },
  {
    name: "NoodleKing",
    username: "noodle_king",
    niche: "food",
    personality: "comedian",
  },
  {
    name: "SunsetChaser",
    username: "sunsetchaser",
    niche: "travel",
    personality: "photographer",
  },
  {
    name: "BioHacker",
    username: "biohacker",
    niche: "fitness",
    personality: "tech_reviewer",
  },
  {
    name: "SketchyAI",
    username: "sketchyai",
    niche: "tech",
    personality: "meme_creator",
  },
  {
    name: "VoguePixel",
    username: "voguepixel",
    niche: "fashion",
    personality: "comedian",
  },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, min: number, max: number): number {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

export const AI_CREATORS: AICreator[] = CREATOR_DATA.map((data, i) => {
  const seed = i * 7 + 13;
  const followerCount =
    seededRange(seed, 5, 999) * 1000 + seededRange(seed + 1, 0, 999);
  return {
    id: `ai-${i + 1}`,
    name: data.name,
    username: `@${data.username}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=ai-${i + 1}`,
    bio: NICHE_BIOS[data.niche][
      seededRange(seed + 2, 0, NICHE_BIOS[data.niche].length - 1)
    ],
    niche: data.niche,
    personality: data.personality,
    followerCount,
    followingCount: seededRange(seed + 3, 100, 5000),
    engagementRate: 0.03 + seededRandom(seed + 4) * 0.09,
    postingFrequency: (["low", "medium", "high"] as const)[
      seededRange(seed + 5, 0, 2)
    ],
    creatorLevel: seededRange(seed + 6, 1, 10),
    postsCount: seededRange(seed + 7, 20, 500),
    engagementScore: Math.floor(
      followerCount * (0.03 + seededRandom(seed + 8) * 0.09),
    ),
  };
});

const CAPTION_TEMPLATES: Record<AIPersonality, string[]> = {
  comedian: [
    "Tried to be productive today... didn't work 😂 #comedy #relatable",
    "My brain at 2am vs my brain at 9am... not the same person 💀 #mood #funny",
    "Nobody: ... Me: creates a whole new problem to solve the original one 😭 #comedy",
    "Plot twist: adulting is just googling everything and hoping for the best 🤡 #relatable",
    "I said I'd be there in 5 minutes. It's been 3 days. #comedy #oops",
  ],
  motivator: [
    "Every day is a new chance to become better 💪 #motivation #mindset",
    "The only bad workout is the one that didn't happen. Get moving! 🏃 #fitness #goals",
    "Small steps every day lead to massive results. Trust the process 🌟 #growth",
    "Your future self will thank you for starting today. No excuses 🔥 #motivation",
    "Discipline beats motivation every time. Build the habit 💎 #success #mindset",
  ],
  photographer: [
    "Light and shadow tell the real story 📸 #photography #art",
    "Every frame is a moment frozen in time 🌅 #photography #golden_hour",
    "The best camera is the one you have with you 📷 #photography #aesthetic",
    "Found this hidden gem and couldn't stop clicking 🌿 #photography #nature",
    "Colors speak louder than words 🎨 #photography #art #aesthetic",
  ],
  tech_reviewer: [
    "Just tested this new gadget — here's my honest take 🔬 #tech #review",
    "Setup upgrade complete. Productivity is about to hit different 💻 #tech #setup",
    "This one feature changed how I work forever ⚡ #tech #productivity",
    "Hot take: this is the most underrated piece of tech right now 🛠️ #tech",
    "Benchmarked 5 tools so you don't have to 📊 #tech #review #productivity",
  ],
  meme_creator: [
    "Me explaining my schedule to my brain at 2am 💀 #meme #relatable",
    "This image lives in my head rent free 😭 #meme #viral",
    "Nobody asked but here we are 🐸 #meme #comedy #relatable",
    "The accuracy of this hurts 😂💀 #meme #mood",
    "I'm not the problem. I'm the plot twist 😈 #meme #relatable #comedy",
  ],
};

const NICHE_HASHTAGS: Record<AICreatorNiche, string[]> = {
  fitness: ["#fitness", "#workout", "#gym", "#health", "#gains", "#wellness"],
  tech: ["#tech", "#coding", "#developer", "#innovation", "#gadgets", "#AI"],
  comedy: ["#comedy", "#funny", "#humor", "#relatable", "#lol", "#memes"],
  fashion: ["#fashion", "#style", "#outfit", "#ootd", "#aesthetic", "#looks"],
  gaming: ["#gaming", "#gamer", "#games", "#esports", "#twitch", "#pcgaming"],
  food: ["#food", "#foodie", "#recipe", "#cooking", "#tasty", "#delicious"],
  travel: ["#travel", "#wanderlust", "#explore", "#adventure", "#destination"],
  education: ["#education", "#learning", "#knowledge", "#study", "#growth"],
};

export function generateAIPost(
  creator: AICreator,
  postIndex: number,
): SimulatedPostData {
  const seed = creator.id.charCodeAt(3) * 100 + postIndex;
  const captions = CAPTION_TEMPLATES[creator.personality];
  const caption = captions[postIndex % captions.length];
  const hashtags = NICHE_HASHTAGS[creator.niche].slice(0, 4);
  const imgSeed = seed * 17 + 42;
  const imageUrl = `https://picsum.photos/seed/${imgSeed}/600/600`;
  const views = Math.floor(
    creator.followerCount * (0.1 + seededRandom(seed + 1) * 0.4),
  );
  const likes = Math.floor(views * creator.engagementRate);
  const commentCount = Math.floor(likes * 0.08);
  const shares = Math.floor(likes * 0.04);
  const engagementScore = likes + commentCount * 2 + shares * 3;

  return {
    id: `${creator.id}-post-${postIndex}-${Date.now()}`,
    authorId: creator.id,
    authorName: creator.name,
    authorUsername: creator.username,
    authorAvatar: creator.avatar,
    imageUrl,
    images: [imageUrl],
    caption,
    likes,
    commentCount,
    shares,
    views,
    saves: Math.floor(likes * 0.05),
    engagementScore,
    timestamp: Date.now() - seededRange(seed + 2, 0, 12) * 3600 * 1000,
    isTrending: engagementScore > 5000,
    hashtags,
    reach: Math.floor(views * 1.2),
    impressions: Math.floor(views * 1.8),
    followersGained: Math.floor(shares * 2),
  };
}

const AI_COMMENT_TEMPLATES: Record<AIPersonality, string[]> = {
  comedian: [
    "This is literally me every single day 😂",
    "I didn't need to be called out like this 💀",
    "Ok but why is this my entire personality 😭",
    "I'm sending this to everyone I know lmao",
    "Not me dying at this at 2am 💀💀",
  ],
  motivator: [
    "This is the content we need more of! 🔥",
    "Keep pushing, you're doing amazing! 💪",
    "Love the energy here. Stay consistent! 🌟",
    "This is so inspiring. Thank you for sharing! ✨",
    "Big goals require big actions. Let's go! 🚀",
  ],
  photographer: [
    "The composition here is stunning 📸",
    "That lighting is absolutely perfect ✨",
    "Such a beautiful capture! Love the mood here 🌅",
    "The colors in this are incredible 🎨",
    "Frame worthy! Absolutely love this shot 🖼️",
  ],
  tech_reviewer: [
    "Great breakdown! Very helpful info 🔬",
    "I've been waiting for someone to cover this 💻",
    "Solid review. Agree with all your points ⚡",
    "The specs on this are actually wild 📊",
    "Finally an honest take. Following for more! 🛠️",
  ],
  meme_creator: [
    "THE ACCURACY 💀💀💀",
    "Bro said exactly what we were all thinking 😭",
    "This image lives in my head rent free 🐸",
    "Showing this to my therapist 😂",
    "I felt this in my soul fr 💀",
  ],
};

export function generateAIComment(creator: AICreator): string {
  const templates = AI_COMMENT_TEMPLATES[creator.personality];
  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx];
}

const COLLAB_TEMPLATES = [
  (_a: string, b: string) =>
    `Collab drop with the one and only ${b}! 🔥 Two creators, one incredible post. What do you all think? #collab`,
  (_a: string, b: string) =>
    `Teamed up with ${b} for something special 🤝 This is just the beginning! #collab #creators`,
  (a: string, b: string) =>
    `${a} × ${b} collab is here! We cooked this one up just for you 🚀 #collab #viral`,
  (_a: string, b: string) =>
    `When two worlds collide... ${b} and I joined forces and created something magical ✨ #collab`,
];

export function getAICollabCaption(
  creatorA: AICreator,
  creatorB: AICreator,
): string {
  const template =
    COLLAB_TEMPLATES[Math.floor(Math.random() * COLLAB_TEMPLATES.length)];
  return template(creatorA.name, creatorB.name);
}
