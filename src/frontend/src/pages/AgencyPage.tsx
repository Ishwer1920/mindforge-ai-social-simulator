import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const TIERS = [
  {
    key: "basic" as const,
    label: "Basic Agent",
    emoji: "👔",
    cost: 500,
    revenueBoostPct: 10,
    dealBoostPct: 5,
    growthBoostPct: 5,
    passiveCoins: 2,
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.15 220), oklch(0.5 0.12 200))",
    borderColor: "oklch(0.5 0.15 220 / 0.4)",
  },
  {
    key: "premium" as const,
    label: "Premium Agent",
    emoji: "🕴️",
    cost: 1500,
    revenueBoostPct: 25,
    dealBoostPct: 15,
    growthBoostPct: 15,
    passiveCoins: 5,
    gradient:
      "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.55 0.2 270))",
    borderColor: "oklch(0.55 0.2 295 / 0.4)",
  },
  {
    key: "elite" as const,
    label: "Elite Agent",
    emoji: "💼",
    cost: 3500,
    revenueBoostPct: 50,
    dealBoostPct: 30,
    growthBoostPct: 30,
    passiveCoins: 12,
    gradient:
      "linear-gradient(135deg, oklch(0.72 0.2 75), oklch(0.65 0.22 55))",
    borderColor: "oklch(0.65 0.2 75 / 0.4)",
  },
];

const TIER_ORDER = ["none", "basic", "premium", "elite"];

export default function AgencyPage() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    agency,
    setAgency,
    setMonetization,
    triggerSave,
  } = useApp();

  // Passive income tick every 30s
  useEffect(() => {
    if (agency.tier === "none") return;
    const tier = TIERS.find((t) => t.key === agency.tier);
    if (!tier) return;
    const interval = setInterval(() => {
      setCreatorCoins((c) => c + tier.passiveCoins);
      const passiveEarning = tier.revenueBoostPct * 0.01;
      setMonetization((m) => ({
        ...m,
        adRevenue: m.adRevenue + passiveEarning,
        totalEarnings: m.totalEarnings + passiveEarning,
        dailyEarnings: m.dailyEarnings.map((v, i) =>
          i === m.dailyEarnings.length - 1 ? v + passiveEarning : v,
        ),
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, [agency.tier, setCreatorCoins, setMonetization]);

  const handleHire = (tierKey: "basic" | "premium" | "elite") => {
    const tier = TIERS.find((t) => t.key === tierKey);
    if (!tier) return;
    if (creatorCoins < tier.cost) {
      toast.error(
        `Need ${tier.cost.toLocaleString()} 🪙 to hire ${tier.label}`,
      );
      return;
    }
    setCreatorCoins((c) => c - tier.cost);
    setAgency({
      tier: tierKey,
      revenueBoostPct: tier.revenueBoostPct,
      dealBoostPct: tier.dealBoostPct,
      growthBoostPct: tier.growthBoostPct,
    });
    triggerSave();
    toast.success(`${tier.label} hired! Passive income started. 🎉`);
  };

  const currentTierIndex = TIER_ORDER.indexOf(agency.tier);
  const activeTier = TIERS.find((t) => t.key === agency.tier);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="agency.back.button"
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
          <h1 className="text-xl font-bold">Agency</h1>
          <p className="text-xs text-muted-foreground">
            Hire an agent for passive revenue
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

      {/* Active agent banner */}
      {activeTier && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{
            background: activeTier.gradient,
            boxShadow: "0 0 30px oklch(0.5 0.2 280 / 0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTier.emoji}</span>
            <div>
              <p className="font-bold text-white">{activeTier.label} Active</p>
              <p className="text-xs text-white/80">
                +{activeTier.revenueBoostPct}% revenue · +
                {activeTier.dealBoostPct}% deals · +{activeTier.growthBoostPct}%
                growth
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                Earning +{activeTier.passiveCoins} 🪙 every 30 seconds
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-white/90 ml-auto" />
          </div>
        </motion.div>
      )}

      {/* Tier Cards */}
      <div className="space-y-3">
        {TIERS.map((tier, i) => {
          const owned =
            TIER_ORDER.indexOf(tier.key) <= currentTierIndex &&
            agency.tier !== "none";
          const isNext = TIER_ORDER.indexOf(tier.key) === currentTierIndex + 1;
          const canAfford = creatorCoins >= tier.cost;
          return (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                data-ocid={`agency.${tier.key}.card`}
                style={{
                  background: owned
                    ? "oklch(0.16 0.025 280 / 0.95)"
                    : "oklch(0.13 0.016 280 / 0.95)",
                  border: `1px solid ${owned ? tier.borderColor : "oklch(0.25 0.025 280 / 0.3)"}`,
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: tier.gradient }}
                    >
                      {tier.emoji}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm">{tier.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {tier.cost.toLocaleString()} 🪙
                      </p>
                    </div>
                    {owned && !isNext && (
                      <Badge
                        style={{
                          background: "oklch(0.55 0.22 145 / 0.2)",
                          color: "oklch(0.72 0.2 145)",
                        }}
                      >
                        Owned
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Revenue", val: `+${tier.revenueBoostPct}%` },
                      { label: "Deals", val: `+${tier.dealBoostPct}%` },
                      { label: "Growth", val: `+${tier.growthBoostPct}%` },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg py-2"
                        style={{ background: "oklch(0.18 0.02 280 / 0.4)" }}
                      >
                        <p
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.78 0.15 145)" }}
                        >
                          {stat.val}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    Passive: +{tier.passiveCoins} 🪙 / 30s
                  </p>
                  {(isNext || agency.tier === "none") && (
                    <Button
                      data-ocid={`agency.${tier.key}.primary_button`}
                      size="sm"
                      className="w-full text-white border-none"
                      style={{
                        background: tier.gradient,
                        opacity: canAfford ? 1 : 0.5,
                      }}
                      disabled={!canAfford}
                      onClick={() => handleHire(tier.key)}
                    >
                      {agency.tier === "none" ? "Hire" : "Upgrade"} —{" "}
                      {tier.cost.toLocaleString()} 🪙
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
