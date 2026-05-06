import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const SKILL_DEFS = [
  {
    key: "contentQuality" as const,
    emoji: "✨",
    label: "Content Quality",
    desc: "Improves post reach and impressions",
    levelDescs: [
      "Baseline reach",
      "+15% post reach",
      "+30% post reach",
      "+45% post reach",
      "+60% post reach (MAX)",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 230))",
  },
  {
    key: "engagementBoost" as const,
    emoji: "💬",
    label: "Engagement Boost",
    desc: "Increases likes, comments and shares",
    levelDescs: [
      "Baseline engagement",
      "+10% engagement",
      "+20% engagement",
      "+30% engagement",
      "+40% engagement (MAX)",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.62 0.22 145), oklch(0.58 0.18 160))",
  },
  {
    key: "viralChance" as const,
    emoji: "🔥",
    label: "Viral Chance",
    desc: "Higher chance of hitting viral stages",
    levelDescs: [
      "Standard viral odds",
      "+5% viral chance",
      "+10% viral chance",
      "+15% viral chance",
      "+20% viral chance (MAX)",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.68 0.22 50), oklch(0.62 0.2 30))",
  },
  {
    key: "brandValue" as const,
    emoji: "🤝",
    label: "Brand Value",
    desc: "Better brand deal payouts",
    levelDescs: [
      "Standard deal rates",
      "+10% deal value",
      "+20% deal value",
      "+30% deal value",
      "+40% deal value (MAX)",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.6 0.2 295), oklch(0.55 0.22 270))",
  },
];

const UPGRADE_COSTS = [0, 50, 100, 200, 400];

export default function SkillUpgrades() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    skills,
    setSkills,
    triggerSave,
  } = useApp();

  const handleUpgrade = (key: keyof typeof skills) => {
    const current = skills[key];
    if (current >= 5) return;
    const cost = UPGRADE_COSTS[current];
    if (creatorCoins < cost) {
      toast.error(`Not enough coins! Need ${cost} 🪙`);
      return;
    }
    setCreatorCoins((c) => c - cost);
    setSkills((s) => ({ ...s, [key]: s[key] + 1 }));
    triggerSave();
    toast.success(`${key} upgraded to level ${current + 1}! ⚡`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="skills.back.button"
          onClick={() => navigate("hub")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          style={{
            background: "oklch(0.15 0.02 280 / 0.5)",
            border: "1px solid oklch(0.3 0.025 280 / 0.3)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Skill Upgrades</h1>
          <p className="text-xs text-muted-foreground">
            Invest coins to grow faster
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            border: "1px solid oklch(0.55 0.2 80 / 0.3)",
          }}
        >
          <span className="text-sm">🪙</span>
          <span
            className="text-sm font-bold"
            style={{ color: "oklch(0.8 0.18 80)" }}
          >
            {creatorCoins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Skill Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SKILL_DEFS.map((skill, i) => {
          const level = skills[skill.key];
          const cost = UPGRADE_COSTS[level] ?? 0;
          const maxed = level >= 5;
          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                data-ocid={`skills.${skill.key}.card`}
                style={{
                  background: "oklch(0.13 0.016 280 / 0.95)",
                  border: "1px solid oklch(0.25 0.025 280 / 0.4)",
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: skill.gradient }}
                    >
                      {skill.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold">
                        {skill.label}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {skill.desc}
                      </p>
                    </div>
                    {maxed && (
                      <Badge
                        style={{
                          background: "oklch(0.55 0.22 145 / 0.3)",
                          color: "oklch(0.75 0.2 145)",
                        }}
                      >
                        MAX
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Level Dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground mr-1">
                      Lv {level}/5
                    </span>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={`dot-${skill.key}-${i}`}
                        className="h-2 flex-1 rounded-full transition-all duration-500"
                        style={{
                          background:
                            i < level ? skill.gradient : "oklch(0.22 0.02 280)",
                        }}
                      />
                    ))}
                  </div>
                  {/* Effect desc */}
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.78 0.1 260)" }}
                  >
                    <Zap className="w-3 h-3 inline mr-1" />
                    {skill.levelDescs[level - 1]}
                  </p>
                  {/* Next level */}
                  {!maxed && (
                    <p className="text-xs text-muted-foreground">
                      Next: {skill.levelDescs[level]} — {cost} 🪙
                    </p>
                  )}
                  {/* Upgrade button */}
                  {!maxed && (
                    <Button
                      data-ocid={`skills.${skill.key}.primary_button`}
                      size="sm"
                      className="w-full text-white border-none"
                      style={{ background: skill.gradient }}
                      disabled={creatorCoins < cost}
                      onClick={() => handleUpgrade(skill.key)}
                    >
                      Upgrade — {cost} 🪙
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
