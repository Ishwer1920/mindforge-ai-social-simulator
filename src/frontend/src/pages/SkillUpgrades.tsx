import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { Skills } from "../context/AppContext";

/* ── Skill definitions ─────────────────────────────────────────────────── */
const SKILLS = [
  {
    key: "editing" as const,
    icon: "✂️",
    label: "Editing",
    desc: "Sharpens post quality — makes every frame count.",
    color: "#F59E0B",
    colorDark: "oklch(0.62 0.22 80)",
    accentBg: "oklch(0.62 0.22 80 / 0.12)",
    border: "oklch(0.62 0.22 80 / 0.35)",
    glow: "0 0 28px oklch(0.62 0.22 80 / 0.3)",
    levelBenefits: [
      "Post quality +10% (reach +5%)",
      "Post quality +20% (reach +12%)",
      "Post quality +35% (reach +20%)",
      "Post quality +50% (reach +30%)",
      "MAX — Elite editor, reach +45%",
    ],
    impactLabel: "Post Reach",
    impactCalc: (lv: number) => `+${[0, 5, 12, 20, 30, 45][lv]}%`,
  },
  {
    key: "speaking" as const,
    icon: "🎙️",
    label: "Speaking",
    desc: "Drives live & video engagement through your voice.",
    color: "#3B82F6",
    colorDark: "oklch(0.6 0.2 250)",
    accentBg: "oklch(0.6 0.2 250 / 0.12)",
    border: "oklch(0.6 0.2 250 / 0.35)",
    glow: "0 0 28px oklch(0.6 0.2 250 / 0.3)",
    levelBenefits: [
      "Live viewers +8%, retention +5%",
      "Live viewers +16%, retention +12%",
      "Live viewers +25%, watch time +20%",
      "Live viewers +35%, watch time +30%",
      "MAX — Master speaker, live boost +50%",
    ],
    impactLabel: "Live Engagement",
    impactCalc: (lv: number) => `+${[0, 8, 16, 25, 35, 50][lv]}%`,
  },
  {
    key: "creativity" as const,
    icon: "🎨",
    label: "Creativity",
    desc: "Multiplies viral chance — ideas that spread.",
    color: "#A855F7",
    colorDark: "oklch(0.6 0.25 295)",
    accentBg: "oklch(0.6 0.25 295 / 0.12)",
    border: "oklch(0.6 0.25 295 / 0.35)",
    glow: "0 0 28px oklch(0.6 0.25 295 / 0.3)",
    levelBenefits: [
      "Viral chance +5%",
      "Viral chance +10%, share boost +8%",
      "Viral chance +18%, trending boost +15%",
      "Viral chance +28%, all engagement +10%",
      "MAX — Viral multiplier ×2.5",
    ],
    impactLabel: "Viral Chance",
    impactCalc: (lv: number) => `+${[0, 5, 10, 18, 28, 50][lv]}%`,
  },
  {
    key: "branding" as const,
    icon: "👑",
    label: "Branding",
    desc: "Elevates your creator identity & deal value.",
    color: "#10B981",
    colorDark: "oklch(0.62 0.2 160)",
    accentBg: "oklch(0.62 0.2 160 / 0.12)",
    border: "oklch(0.62 0.2 160 / 0.35)",
    glow: "0 0 28px oklch(0.62 0.2 160 / 0.3)",
    levelBenefits: [
      "Brand deal value +10%",
      "Brand deal value +20%, trust +5%",
      "Brand deal value +35%, reputation +10%",
      "Brand deal value +50%, premium sponsorships",
      "MAX — Brand empire, deals ×2",
    ],
    impactLabel: "Brand Deals",
    impactCalc: (lv: number) => `+${[0, 10, 20, 35, 50, 100][lv]}%`,
  },
  {
    key: "networking" as const,
    icon: "🌐",
    label: "Networking",
    desc: "Opens collab doors & amplifies follower crossover.",
    color: "#EC4899",
    colorDark: "oklch(0.62 0.24 340)",
    accentBg: "oklch(0.62 0.24 340 / 0.12)",
    border: "oklch(0.62 0.24 340 / 0.35)",
    glow: "0 0 28px oklch(0.62 0.24 340 / 0.3)",
    levelBenefits: [
      "Collab chance +8%, crossover +1%",
      "Collab chance +16%, crossover +2%",
      "Collab chance +25%, crossover +4%",
      "Collab chance +35%, crossover +6%",
      "MAX — Network master, crossover +10%",
    ],
    impactLabel: "Collab Chance",
    impactCalc: (lv: number) => `+${[0, 8, 16, 25, 35, 50][lv]}%`,
  },
];

const UPGRADE_COSTS = [50, 100, 200, 400, 800];

/* map new skill keys to old Skills interface keys in AppContext */
const KEY_MAP: Record<string, keyof Skills> = {
  editing: "contentQuality",
  speaking: "engagementBoost",
  creativity: "viralChance",
  branding: "brandValue",
};

/* ── Component ─────────────────────────────────────────────────────────── */
export default function SkillUpgrades() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    skills,
    setSkills,
    triggerSave,
    addNotification,
  } = useApp();
  const [celebKey, setCelebKey] = useState<string | null>(null);

  /* networking is a UI-only skill stored in skills.brandValue overlay — we
     track it separately in localStorage to keep AppContext untouched */
  const [networkingLevel, setNetworkingLevel] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("mf_skill_networking") ?? 0);
    } catch {
      return 0;
    }
  });

  const getLevel = (key: string): number => {
    if (key === "networking") return networkingLevel;
    const mapped = KEY_MAP[key];
    return mapped ? skills[mapped] : 0;
  };

  const handleUpgrade = (key: string) => {
    const level = getLevel(key);
    if (level >= 5) return;
    const cost = UPGRADE_COSTS[level];
    if (creatorCoins < cost) {
      toast.error(`Need ${cost} 🪙 to upgrade!`);
      return;
    }
    const skill = SKILLS.find((s) => s.key === key)!;
    setCreatorCoins((c) => c - cost);
    if (key === "networking") {
      const next = networkingLevel + 1;
      setNetworkingLevel(next);
      localStorage.setItem("mf_skill_networking", String(next));
    } else {
      const mapped = KEY_MAP[key];
      setSkills((s) => ({ ...s, [mapped]: s[mapped] + 1 }));
    }
    triggerSave();
    setCelebKey(key);
    setTimeout(() => setCelebKey(null), 1200);
    toast.success(`${skill.label} upgraded to Level ${level + 1}! ✨`);
    addNotification({
      icon: skill.icon,
      message: `Skill upgrade! ${skill.label} is now Level ${level + 1}. ${skill.levelBenefits[level]}`,
      type: "achievement",
    });
  };

  /* Impact panel values */
  const impactStats = [
    {
      label: "Post Reach",
      val: `+${[0, 5, 12, 20, 30, 45][getLevel("editing")]}%`,
      color: "oklch(0.62 0.22 80)",
    },
    {
      label: "Live Engagement",
      val: `+${[0, 8, 16, 25, 35, 50][getLevel("speaking")]}%`,
      color: "oklch(0.6 0.2 250)",
    },
    {
      label: "Viral Chance",
      val: `+${[0, 5, 10, 18, 28, 50][getLevel("creativity")]}%`,
      color: "oklch(0.6 0.25 295)",
    },
    {
      label: "Brand Deals",
      val: `+${[0, 10, 20, 35, 50, 100][getLevel("branding")]}%`,
      color: "oklch(0.62 0.2 160)",
    },
    {
      label: "Collab Chance",
      val: `+${[0, 8, 16, 25, 35, 50][getLevel("networking")]}%`,
      color: "oklch(0.62 0.24 340)",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.09 0.015 280)" }}
    >
      {/* BG grid decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, oklch(0.55 0.22 295 / 0.07) 0%, transparent 60%), radial-gradient(circle at 75% 75%, oklch(0.55 0.2 250 / 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="skills.back_button"
            onClick={() => navigate("hub")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: "oklch(0.15 0.02 280 / 0.6)",
              border: "1px solid oklch(0.3 0.025 280 / 0.4)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Skill Tree</h1>
            <p className="text-xs" style={{ color: "oklch(0.65 0.06 280)" }}>
              Invest coins to unlock your creator potential
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{
              background: "oklch(0.62 0.22 80 / 0.12)",
              border: "1px solid oklch(0.62 0.22 80 / 0.35)",
              color: "oklch(0.82 0.18 80)",
            }}
          >
            🪙 {creatorCoins.toLocaleString()}
          </div>
        </div>

        {/* Skill Tree Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {SKILLS.map((skill, i) => {
            const level = getLevel(skill.key);
            const maxed = level >= 5;
            const cost = maxed ? 0 : UPGRADE_COSTS[level];
            const canAfford = creatorCoins >= cost;
            const isCelebrating = celebKey === skill.key;

            return (
              <motion.div
                key={skill.key}
                data-ocid={`skills.${skill.key}.card`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.07,
                  type: "spring",
                  stiffness: 280,
                  damping: 24,
                }}
                className="relative rounded-2xl overflow-hidden cursor-default"
                style={{
                  background: "oklch(0.13 0.018 280 / 0.95)",
                  border: `1px solid ${skill.border}`,
                  boxShadow: isCelebrating ? skill.glow : undefined,
                  transition: "box-shadow 0.4s",
                }}
              >
                {/* Celebrate burst */}
                <AnimatePresence>
                  {isCelebrating && (
                    <motion.div
                      key="burst"
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${skill.accentBg} 0%, transparent 70%)`,
                      }}
                    />
                  )}
                </AnimatePresence>

                <div className="p-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: skill.accentBg,
                        border: `1px solid ${skill.border}`,
                        boxShadow: `0 0 12px ${skill.accentBg}`,
                      }}
                    >
                      {skill.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">{skill.label}</h3>
                        {maxed && (
                          <Badge
                            className="text-xs px-1.5 py-0 h-4"
                            style={{
                              background: skill.accentBg,
                              color: skill.colorDark,
                              border: `1px solid ${skill.border}`,
                            }}
                          >
                            MAX
                          </Badge>
                        )}
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.6 0.05 280)" }}
                      >
                        {skill.desc}
                      </p>
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: skill.accentBg,
                        color: skill.colorDark,
                      }}
                    >
                      Lv {level}/5
                    </div>
                  </div>

                  {/* Progress nodes (tree dots) */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }, (_, idx) => (
                      <motion.div
                        key={`node-${skill.key}-${idx}`}
                        className="relative flex-1 flex flex-col items-center gap-0.5"
                        animate={
                          idx < level && isCelebrating
                            ? { scale: [1, 1.3, 1] }
                            : {}
                        }
                        transition={{ delay: idx * 0.06 }}
                      >
                        <div
                          className="w-full h-2 rounded-full transition-all duration-500"
                          style={{
                            background:
                              idx < level
                                ? `linear-gradient(90deg, ${skill.colorDark}, ${skill.colorDark})`
                                : "oklch(0.2 0.02 280)",
                            boxShadow:
                              idx < level
                                ? `0 0 6px ${skill.accentBg}`
                                : undefined,
                          }}
                        />
                        {idx < level ? (
                          <CheckCircle2
                            className="w-2.5 h-2.5"
                            style={{ color: skill.colorDark }}
                          />
                        ) : (
                          <Lock
                            className="w-2.5 h-2.5"
                            style={{ color: "oklch(0.35 0.02 280)" }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Current benefit */}
                  {level > 0 && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                      style={{ background: skill.accentBg }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: skill.colorDark }}
                      />
                      <span style={{ color: skill.colorDark }}>
                        {skill.levelBenefits[level - 1]}
                      </span>
                    </div>
                  )}

                  {/* Next level preview */}
                  {!maxed && (
                    <div
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "oklch(0.55 0.05 280)" }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Next: {skill.levelBenefits[level]}</span>
                    </div>
                  )}

                  {/* Upgrade button */}
                  {maxed ? (
                    <div
                      className="w-full text-center text-xs font-bold py-2 rounded-xl"
                      style={{
                        background: skill.accentBg,
                        color: skill.colorDark,
                      }}
                    >
                      ✅ Fully Upgraded
                    </div>
                  ) : (
                    <Button
                      data-ocid={`skills.${skill.key}.primary_button`}
                      size="sm"
                      className="w-full font-bold border-none transition-all duration-200"
                      style={{
                        background: canAfford
                          ? `linear-gradient(135deg, ${skill.colorDark}, ${skill.colorDark})`
                          : "oklch(0.18 0.02 280)",
                        color: canAfford
                          ? "oklch(0.98 0.01 280)"
                          : "oklch(0.4 0.03 280)",
                        boxShadow: canAfford ? skill.glow : undefined,
                      }}
                      disabled={!canAfford}
                      onClick={() => handleUpgrade(skill.key)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Upgrade — {cost.toLocaleString()} 🪙
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Impact Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.13 0.018 280 / 0.95)",
            border: "1px solid oklch(0.25 0.025 280 / 0.5)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "oklch(0.7 0.15 260)" }}
            />
            <h2 className="text-sm font-bold">Current Impact</h2>
            <span className="text-xs" style={{ color: "oklch(0.55 0.05 280)" }}>
              How your skills affect the game
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {impactStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-0.5 p-2 rounded-xl"
                style={{ background: "oklch(0.16 0.02 280 / 0.7)" }}
              >
                <span
                  className="text-lg font-black"
                  style={{ color: stat.color }}
                >
                  {stat.val}
                </span>
                <span
                  className="text-xs text-center"
                  style={{ color: "oklch(0.55 0.04 280)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "oklch(0.45 0.04 280)" }}>
            Upgrade costs: 50 → 100 → 200 → 400 → 800 🪙
          </p>
        </motion.div>
      </div>
    </div>
  );
}
