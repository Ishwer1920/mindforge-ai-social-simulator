import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const PRESET_AVATARS = [
  "alexrivera",
  "samchen",
  "miatorres",
  "jordankim",
  "riley",
  "artist",
  "gamer",
  "explorer",
  "creator",
  "athlete",
  "techie",
  "foodie",
];

const NICHES = [
  { id: "Tech", emoji: "💻", label: "Tech" },
  { id: "Finance", emoji: "💰", label: "Finance" },
  { id: "Fitness", emoji: "💪", label: "Fitness" },
  { id: "Comedy", emoji: "😂", label: "Comedy" },
  { id: "Memes", emoji: "👻", label: "Memes" },
  { id: "Fashion", emoji: "👗", label: "Fashion" },
  { id: "Gaming", emoji: "🎮", label: "Gaming" },
  { id: "Travel", emoji: "✈️", label: "Travel" },
  { id: "Food", emoji: "🍕", label: "Food" },
  { id: "Education", emoji: "📚", label: "Education" },
];

export default function Onboarding() {
  const { setProfile, setIsNewUser, triggerSave } = useApp();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [niche, setNiche] = useState("");

  const canProceed = [username.trim().length >= 2, !!avatar, !!niche][step];

  const handleStart = () => {
    const followers = Math.floor(Math.random() * 1500) + 500;
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "");
    setProfile({
      name: username.trim(),
      username: `@${cleanUsername}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`,
      bio: `${NICHES.find((n) => n.id === niche)?.emoji || "✨"} ${niche} Creator`,
      followers,
      following: Math.floor(Math.random() * 200) + 50,
      postsCount: 0,
      xp: 0,
      level: 1,
      niche,
    });
    setIsNewUser(false);
    triggerSave();
  };

  const steps = [
    {
      title: "What's your creator name?",
      subtitle: "Choose a name your audience will remember",
    },
    {
      title: "Pick your avatar",
      subtitle: "Choose how you appear to the world",
    },
    {
      title: "Choose your niche",
      subtitle: "This shapes your audience, CPM, and sponsorship deals",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "oklch(0.09 0.018 280)" }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.35 0.2 295 / 0.15), transparent)",
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))",
            }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              background:
                "linear-gradient(135deg, oklch(0.75 0.22 295), oklch(0.75 0.18 210))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MindForge
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: step order never changes
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === step ? "32px" : "8px",
                background:
                  i === step
                    ? "oklch(0.65 0.22 295)"
                    : i < step
                      ? "oklch(0.5 0.15 295)"
                      : "oklch(0.3 0.03 280)",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-6"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.25 0.025 280 / 0.6)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h2
              className="text-xl font-bold text-foreground mb-1"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {steps[step].title}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {steps[step].subtitle}
            </p>

            {/* Step 0 - Username */}
            {step === 0 && (
              <div className="space-y-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your creator name..."
                  className="text-base"
                  style={{
                    background: "oklch(0.18 0.02 280)",
                    border: "1px solid oklch(0.3 0.03 280)",
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canProceed && setStep(1)
                  }
                  autoFocus
                  data-ocid="onboarding.input"
                />
                {username.trim().length > 0 && username.trim().length < 2 && (
                  <p className="text-xs text-destructive">
                    At least 2 characters required
                  </p>
                )}
              </div>
            )}

            {/* Step 1 - Avatar */}
            {step === 1 && (
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setAvatar(seed)}
                    className="aspect-square rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      border:
                        avatar === seed
                          ? "2px solid oklch(0.65 0.22 295)"
                          : "2px solid oklch(0.25 0.025 280 / 0.4)",
                      boxShadow:
                        avatar === seed
                          ? "0 0 12px oklch(0.55 0.22 295 / 0.4)"
                          : "none",
                    }}
                    data-ocid="onboarding.select"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                      alt={seed}
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 - Niche */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {NICHES.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNiche(n.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background:
                        niche === n.id
                          ? "linear-gradient(135deg, oklch(0.55 0.25 295 / 0.3), oklch(0.55 0.2 240 / 0.2))"
                          : "oklch(0.18 0.02 280)",
                      border:
                        niche === n.id
                          ? "1px solid oklch(0.6 0.22 295 / 0.5)"
                          : "1px solid oklch(0.25 0.025 280 / 0.4)",
                      color:
                        niche === n.id
                          ? "oklch(0.9 0.05 260)"
                          : "oklch(0.65 0.03 280)",
                    }}
                    data-ocid="onboarding.select"
                  >
                    <span>{n.emoji}</span>
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
              style={{
                background: "oklch(0.15 0.02 280)",
                border: "1px solid oklch(0.3 0.03 280)",
              }}
              data-ocid="onboarding.back.button"
            >
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              className="flex-1"
              style={{
                background: canProceed
                  ? "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))"
                  : undefined,
              }}
              data-ocid="onboarding.next.button"
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={!canProceed}
              className="flex-1 font-bold"
              style={{
                background: canProceed
                  ? "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))"
                  : undefined,
              }}
              data-ocid="onboarding.submit_button"
            >
              ⚡ Start Creating
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
