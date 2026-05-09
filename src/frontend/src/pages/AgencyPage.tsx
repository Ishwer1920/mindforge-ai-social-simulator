import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Crown,
  LogOut,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

// ── Tier definitions ──────────────────────────────────────────────────────────
const TIERS = [
  {
    key: "starter" as const,
    label: "Starter Agency",
    shortLabel: "Starter",
    emoji: "🥉",
    theme: "bronze",
    cost: 500,
    revenueBoostPct: 15,
    dealBoostPct: 10,
    growthBoostPct: 10,
    collabsPerWeek: 1,
    incomeMultiplier: 1.15,
    passiveCoins: 3,
    perks: [
      "Basic sponsorship matching",
      "1 collab opportunity/week",
      "+15% ad revenue",
      "+10% deal value",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.65 0.18 55), oklch(0.55 0.22 40))",
    glowColor: "oklch(0.6 0.2 50 / 0.35)",
    borderColor: "oklch(0.6 0.2 50 / 0.5)",
    accentColor: "oklch(0.75 0.18 55)",
    bgColor: "oklch(0.18 0.04 50 / 0.2)",
  },
  {
    key: "pro" as const,
    label: "Pro Agency",
    shortLabel: "Pro",
    emoji: "🥈",
    theme: "silver",
    cost: 2000,
    revenueBoostPct: 30,
    dealBoostPct: 20,
    growthBoostPct: 20,
    collabsPerWeek: 3,
    incomeMultiplier: 1.3,
    passiveCoins: 7,
    perks: [
      "Premium brand partnerships",
      "3 collab opportunities/week",
      "+30% ad revenue",
      "+20% deal value",
      "Priority brand matching",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.75 0.06 270), oklch(0.62 0.08 260))",
    glowColor: "oklch(0.7 0.07 265 / 0.35)",
    borderColor: "oklch(0.7 0.07 265 / 0.5)",
    accentColor: "oklch(0.82 0.06 270)",
    bgColor: "oklch(0.18 0.03 265 / 0.2)",
  },
  {
    key: "elite" as const,
    label: "Elite Agency",
    shortLabel: "Elite",
    emoji: "🥇",
    theme: "gold",
    cost: 5000,
    revenueBoostPct: 60,
    dealBoostPct: 40,
    growthBoostPct: 40,
    collabsPerWeek: 7,
    incomeMultiplier: 1.6,
    passiveCoins: 15,
    perks: [
      "Exclusive mega-brand deals",
      "7 collab opportunities/week",
      "+60% ad revenue",
      "+40% deal value",
      "Agency-exclusive sponsors",
      "Celebrity introductions",
    ],
    gradient:
      "linear-gradient(135deg, oklch(0.82 0.22 80), oklch(0.68 0.24 60))",
    glowColor: "oklch(0.75 0.22 72 / 0.4)",
    borderColor: "oklch(0.75 0.22 72 / 0.6)",
    accentColor: "oklch(0.88 0.2 80)",
    bgColor: "oklch(0.18 0.05 72 / 0.2)",
  },
];

const TIER_ORDER = ["none", "starter", "pro", "elite"];

// ── Agency leaderboard data ───────────────────────────────────────────────────
const AGENCY_RANKINGS = [
  {
    name: "Nexus Elite",
    members: 2840,
    avgBoost: 58,
    tier: "elite",
    emoji: "🥇",
  },
  {
    name: "TrendForge",
    members: 1920,
    avgBoost: 52,
    tier: "elite",
    emoji: "🥇",
  },
  {
    name: "ViralVault Agency",
    members: 3100,
    avgBoost: 45,
    tier: "pro",
    emoji: "🥈",
  },
  {
    name: "ContentKings",
    members: 1450,
    avgBoost: 42,
    tier: "pro",
    emoji: "🥈",
  },
  {
    name: "CreatorCircle",
    members: 2200,
    avgBoost: 38,
    tier: "pro",
    emoji: "🥈",
  },
  {
    name: "StartUp Collabs",
    members: 4500,
    avgBoost: 22,
    tier: "starter",
    emoji: "🥉",
  },
  {
    name: "RisingCreators",
    members: 3800,
    avgBoost: 18,
    tier: "starter",
    emoji: "🥉",
  },
];

// ── Sponsored post messages ───────────────────────────────────────────────────
const SPONSOR_MSGS = [
  { brand: "NexTech Pro", amount: 450, icon: "💻" },
  { brand: "FitLife Co.", amount: 320, icon: "💪" },
  { brand: "GlamForge", amount: 580, icon: "✨" },
  { brand: "GameZone", amount: 410, icon: "🎮" },
  { brand: "WellnessPlus", amount: 270, icon: "🌿" },
  { brand: "StyleEdge", amount: 640, icon: "👗" },
  { brand: "WanderDeals", amount: 390, icon: "✈️" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
      style={{
        background: "oklch(0.15 0.02 280 / 0.5)",
        border: "1px solid oklch(0.3 0.025 280 / 0.2)",
      }}
    >
      <span className="text-sm font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

function ActiveBenefitsPanel({ tier }: { tier: (typeof TIERS)[number] }) {
  const { monetization, profile } = useApp();
  const weeklyRevBoost =
    ((monetization.totalEarnings / 52) * tier.revenueBoostPct) / 100;
  const estimatedExtraFollowers = Math.floor(
    (profile.followers * tier.growthBoostPct) / 100 / 4,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card
        style={{
          background: `linear-gradient(135deg, oklch(0.14 0.02 280 / 0.9), ${tier.bgColor})`,
          border: `1px solid ${tier.borderColor}`,
          boxShadow: `0 0 24px ${tier.glowColor}`,
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: tier.accentColor }} />
            Active Benefits This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-xl p-3"
              style={{
                background: "oklch(0.18 0.025 280 / 0.5)",
                border: "1px solid oklch(0.3 0.02 280 / 0.3)",
              }}
            >
              <p className="text-xs text-muted-foreground">Extra Revenue</p>
              <p
                className="text-base font-bold mt-0.5"
                style={{ color: tier.accentColor }}
              >
                +${weeklyRevBoost.toFixed(0)}
              </p>
              <p className="text-[10px] text-muted-foreground">this week</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background: "oklch(0.18 0.025 280 / 0.5)",
                border: "1px solid oklch(0.3 0.02 280 / 0.3)",
              }}
            >
              <p className="text-xs text-muted-foreground">Growth Boost</p>
              <p
                className="text-base font-bold mt-0.5"
                style={{ color: "oklch(0.75 0.2 145)" }}
              >
                +{estimatedExtraFollowers.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">
                est. followers
              </p>
            </div>
          </div>
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: "oklch(0.18 0.025 280 / 0.5)",
              border: "1px solid oklch(0.3 0.02 280 / 0.3)",
            }}
          >
            <Sparkles
              className="w-4 h-4 shrink-0"
              style={{ color: tier.accentColor }}
            />
            <div>
              <p className="text-xs text-muted-foreground">Passive income</p>
              <p
                className="text-sm font-semibold"
                style={{ color: tier.accentColor }}
              >
                +{tier.passiveCoins} 🪙 every 30 seconds
              </p>
            </div>
          </div>
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: "oklch(0.18 0.025 280 / 0.5)",
              border: "1px solid oklch(0.3 0.02 280 / 0.3)",
            }}
          >
            <Users
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(0.75 0.18 220)" }}
            />
            <div>
              <p className="text-xs text-muted-foreground">
                Collab Opportunities
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(0.75 0.18 220)" }}
              >
                {tier.collabsPerWeek} per week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AgencyRankings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card
        style={{
          background: "oklch(0.13 0.016 280 / 0.95)",
          border: "1px solid oklch(0.25 0.025 280 / 0.3)",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy
              className="w-4 h-4"
              style={{ color: "oklch(0.8 0.2 80)" }}
            />
            Agency Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {AGENCY_RANKINGS.map((agency, i) => (
            <div
              key={agency.name}
              data-ocid={`agency.ranking.item.${i + 1}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
              style={{ border: "1px solid oklch(0.22 0.02 280 / 0.3)" }}
            >
              <span
                className="text-base w-5 text-center font-bold"
                style={{
                  color: i < 3 ? "oklch(0.8 0.2 80)" : "oklch(0.55 0.03 280)",
                }}
              >
                {i + 1}
              </span>
              <span className="text-sm">{agency.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{agency.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {agency.members.toLocaleString()} members
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.72 0.2 145)" }}
                >
                  +{agency.avgBoost}%
                </p>
                <p className="text-[10px] text-muted-foreground">avg boost</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgencyPage() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    agency,
    setAgency,
    setMonetization,
    addNotification,
    triggerSave,
  } = useApp();

  const [tab, setTab] = useState<"overview" | "tiers" | "rankings">("overview");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const sponsorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTierIndex = TIER_ORDER.indexOf(agency.tier);
  const activeTier = TIERS.find((t) => t.key === agency.tier);

  // ── Passive income tick ──────────────────────────────────────────────────
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

  // ── Agency sponsorship notifications ────────────────────────────────────
  useEffect(() => {
    if (agency.tier === "none") return;
    const tier = TIERS.find((t) => t.key === agency.tier);
    if (!tier) return;
    const scheduleNext = () => {
      const baseDelay =
        tier.key === "elite" ? 120000 : tier.key === "pro" ? 200000 : 360000;
      const jitter = Math.random() * baseDelay * 0.5;
      sponsorTimerRef.current = setTimeout(() => {
        const sponsor =
          SPONSOR_MSGS[Math.floor(Math.random() * SPONSOR_MSGS.length)];
        const boostedAmount = Math.floor(
          sponsor.amount * tier.incomeMultiplier,
        );
        addNotification({
          icon: sponsor.icon,
          message: `${sponsor.brand} sent a sponsored post request through your ${tier.shortLabel} Agency! Deal worth $${boostedAmount}`,
          type: "sponsorship",
        });
        setMonetization((m) => ({
          ...m,
          sponsorRevenue: m.sponsorRevenue + boostedAmount,
          totalEarnings: m.totalEarnings + boostedAmount,
        }));
        scheduleNext();
      }, baseDelay + jitter);
    };
    scheduleNext();
    return () => {
      if (sponsorTimerRef.current) clearTimeout(sponsorTimerRef.current);
    };
  }, [agency.tier, addNotification, setMonetization]);

  // ── Join/Upgrade handler ─────────────────────────────────────────────────
  const handleJoin = (tierKey: "starter" | "pro" | "elite") => {
    const tier = TIERS.find((t) => t.key === tierKey);
    if (!tier) return;

    // Calculate effective cost (pay difference when upgrading)
    const prevTier = activeTier ? activeTier : null;
    const upgradeCost = prevTier
      ? Math.max(0, tier.cost - prevTier.cost)
      : tier.cost;

    if (creatorCoins < upgradeCost) {
      toast.error(
        `Need ${upgradeCost.toLocaleString()} 🪙 to ${activeTier ? "upgrade to" : "join"} ${tier.label}`,
      );
      return;
    }

    setCreatorCoins((c) => c - upgradeCost);
    setAgency({
      tier: (tierKey === "starter"
        ? "basic"
        : tierKey === "pro"
          ? "premium"
          : tierKey) as "none" | "basic" | "premium" | "elite",
      revenueBoostPct: tier.revenueBoostPct,
      dealBoostPct: tier.dealBoostPct,
      growthBoostPct: tier.growthBoostPct,
    });
    triggerSave();

    addNotification({
      icon: tier.emoji,
      message: `Welcome to ${tier.label}! Your agency is now generating passive income and finding sponsorships for you. 🎉`,
      type: "sponsorship",
    });
    toast.success(`Joined ${tier.label}! Passive income started. 🎉`);
    setTab("overview");
  };

  // ── Leave agency handler ─────────────────────────────────────────────────
  const handleLeave = () => {
    setAgency({
      tier: "none",
      revenueBoostPct: 0,
      dealBoostPct: 0,
      growthBoostPct: 0,
    });
    triggerSave();
    toast.info("Left agency. You're now independent again.");
    setConfirmLeave(false);
  };

  const TABS = [
    { key: "overview" as const, label: "Overview" },
    { key: "tiers" as const, label: "Agencies" },
    { key: "rankings" as const, label: "Rankings" },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="agency.back_button"
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
            {activeTier
              ? `${activeTier.label} member`
              : "Join an agency to grow faster"}
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

      {/* ── Active tier banner ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeTier && (
          <motion.div
            key="active-banner"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-2xl p-4"
            style={{
              background: activeTier.gradient,
              boxShadow: `0 0 40px ${activeTier.glowColor}`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeTier.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{activeTier.label}</p>
                  <BadgeCheck className="w-4 h-4 text-white/90" />
                </div>
                <p className="text-xs text-white/80 mt-0.5">
                  +{activeTier.revenueBoostPct}% revenue · +
                  {activeTier.dealBoostPct}% deals · +
                  {activeTier.growthBoostPct}% growth
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  {activeTier.collabsPerWeek} collab opportunities/week ·{" "}
                  {activeTier.incomeMultiplier}x income multiplier
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-white/90 shrink-0" />
            </div>
            <Separator className="my-3 opacity-20" />
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Revenue", val: `+${activeTier.revenueBoostPct}%` },
                { label: "Deals", val: `+${activeTier.dealBoostPct}%` },
                { label: "Growth", val: `+${activeTier.growthBoostPct}%` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg py-1.5"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <p className="text-sm font-bold text-white">{s.val}</p>
                  <p className="text-[10px] text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── No agency prompt ────────────────────────────────────────────────── */}
      {!activeTier && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 text-center"
          style={{
            background: "oklch(0.15 0.025 280 / 0.5)",
            border: "1px solid oklch(0.3 0.025 280 / 0.3)",
          }}
        >
          <Building2
            className="w-8 h-8 mx-auto mb-2"
            style={{ color: "oklch(0.65 0.15 280)" }}
          />
          <p className="text-sm font-semibold">Not in an Agency</p>
          <p className="text-xs text-muted-foreground mt-1">
            Join an agency to unlock sponsorships, passive income, and collab
            opportunities
          </p>
          <Button
            data-ocid="agency.join_primary_button"
            size="sm"
            className="mt-3 text-white border-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 55), oklch(0.55 0.22 40))",
            }}
            onClick={() => setTab("tiers")}
          >
            Browse Agencies
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
        </motion.div>
      )}

      {/* ── Tab navigation ──────────────────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{
          background: "oklch(0.13 0.016 280 / 0.8)",
          border: "1px solid oklch(0.25 0.02 280 / 0.3)",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            data-ocid={`agency.${t.key}_tab`}
            className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background:
                tab === t.key
                  ? activeTier
                    ? activeTier.gradient
                    : "oklch(0.22 0.03 280)"
                  : "transparent",
              color: tab === t.key ? "white" : "oklch(0.65 0.05 280)",
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {activeTier ? (
            <>
              <ActiveBenefitsPanel tier={activeTier} />

              {/* Stat pills */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-2"
              >
                <StatPill
                  label="Revenue"
                  value={`+${activeTier.revenueBoostPct}%`}
                  color={activeTier.accentColor}
                />
                <StatPill
                  label="Deals"
                  value={`+${activeTier.dealBoostPct}%`}
                  color={activeTier.accentColor}
                />
                <StatPill
                  label="Growth"
                  value={`+${activeTier.growthBoostPct}%`}
                  color="oklch(0.75 0.2 145)"
                />
                <StatPill
                  label="Passive"
                  value={`${activeTier.passiveCoins}🪙`}
                  color="oklch(0.8 0.18 80)"
                />
              </motion.div>

              {/* Perks list */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <Card
                  style={{
                    background: "oklch(0.13 0.016 280 / 0.95)",
                    border: `1px solid ${activeTier.borderColor}`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star
                        className="w-4 h-4"
                        style={{ color: activeTier.accentColor }}
                      />
                      Your Agency Perks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activeTier.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2.5">
                        <CheckCircle2
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: activeTier.accentColor }}
                        />
                        <span className="text-xs">{perk}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upgrade + Leave actions */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex gap-3"
              >
                {currentTierIndex < TIER_ORDER.length - 1 && (
                  <Button
                    data-ocid="agency.upgrade_button"
                    size="sm"
                    className="flex-1 text-white border-none"
                    style={{
                      background:
                        TIERS[currentTierIndex]?.gradient ??
                        "oklch(0.55 0.15 280)",
                    }}
                    onClick={() => setTab("tiers")}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Upgrade Tier
                  </Button>
                )}
                {!confirmLeave ? (
                  <Button
                    data-ocid="agency.leave_button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    style={{
                      background: "oklch(0.16 0.025 0 / 0.4)",
                      border: "1px solid oklch(0.45 0.15 0 / 0.4)",
                      color: "oklch(0.75 0.15 0)",
                    }}
                    onClick={() => setConfirmLeave(true)}
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Leave Agency
                  </Button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Button
                      data-ocid="agency.leave_confirm_button"
                      size="sm"
                      className="flex-1 text-white border-none"
                      style={{ background: "oklch(0.5 0.2 0)" }}
                      onClick={handleLeave}
                    >
                      Confirm Leave
                    </Button>
                    <Button
                      data-ocid="agency.leave_cancel_button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmLeave(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </motion.div>
            </>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Crown
                className="w-12 h-12 mx-auto"
                style={{ color: "oklch(0.5 0.05 280)" }}
              />
              <p className="text-sm text-muted-foreground">No active agency</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Switch to the Agencies tab to browse and join an agency that
                matches your goals.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TIERS TAB ───────────────────────────────────────────────────────── */}
      {tab === "tiers" && (
        <div className="space-y-3">
          {TIERS.map((tier, i) => {
            const ownedIndex = TIER_ORDER.indexOf(tier.key);
            const isOwned =
              agency.tier !== "none" && ownedIndex <= currentTierIndex;
            const isActive = agency.tier === tier.key;
            const isNext = ownedIndex === currentTierIndex + 1;
            const isLocked = !isOwned && !isNext && agency.tier !== "none";
            const upgradeCost = activeTier
              ? Math.max(0, tier.cost - activeTier.cost)
              : tier.cost;
            const canAfford = creatorCoins >= upgradeCost;

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
                    background: isActive
                      ? `linear-gradient(135deg, oklch(0.16 0.03 280 / 0.9), ${tier.bgColor})`
                      : isOwned
                        ? "oklch(0.15 0.025 280 / 0.95)"
                        : "oklch(0.12 0.015 280 / 0.95)",
                    border: `1px solid ${isActive ? tier.borderColor : isOwned ? "oklch(0.3 0.02 280 / 0.4)" : "oklch(0.22 0.02 280 / 0.3)"}`,
                    boxShadow: isActive ? `0 0 24px ${tier.glowColor}` : "none",
                    opacity: isLocked ? 0.5 : 1,
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: tier.gradient }}
                      >
                        {tier.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm">
                            {tier.label}
                          </CardTitle>
                          {isActive && (
                            <Badge
                              className="text-[10px] px-1.5 py-0"
                              style={{
                                background: `${tier.bgColor}`,
                                color: tier.accentColor,
                                border: `1px solid ${tier.borderColor}`,
                              }}
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activeTier && !isActive && isNext
                            ? `Upgrade for ${upgradeCost.toLocaleString()} 🪙`
                            : `${tier.cost.toLocaleString()} 🪙`}
                        </p>
                      </div>
                      {isOwned && !isActive && (
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{ color: "oklch(0.65 0.15 145)" }}
                        />
                      )}
                      {isLocked && (
                        <Award
                          className="w-4 h-4"
                          style={{ color: "oklch(0.45 0.05 280)" }}
                        />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Stats grid */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {[
                        {
                          label: "Revenue",
                          val: `+${tier.revenueBoostPct}%`,
                          color: tier.accentColor,
                        },
                        {
                          label: "Deals",
                          val: `+${tier.dealBoostPct}%`,
                          color: tier.accentColor,
                        },
                        {
                          label: "Growth",
                          val: `+${tier.growthBoostPct}%`,
                          color: "oklch(0.75 0.2 145)",
                        },
                        {
                          label: "Collabs",
                          val: `${tier.collabsPerWeek}/wk`,
                          color: "oklch(0.75 0.18 220)",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg py-2"
                          style={{ background: "oklch(0.17 0.02 280 / 0.5)" }}
                        >
                          <p
                            className="text-[11px] font-bold"
                            style={{ color: s.color }}
                          >
                            {s.val}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Perks list */}
                    <div className="space-y-1.5">
                      {tier.perks.slice(0, 3).map((perk) => (
                        <div key={perk} className="flex items-center gap-2">
                          <div
                            className="w-1 h-1 rounded-full shrink-0"
                            style={{ background: tier.accentColor }}
                          />
                          <span className="text-[11px] text-muted-foreground">
                            {perk}
                          </span>
                        </div>
                      ))}
                      {tier.perks.length > 3 && (
                        <p className="text-[11px] text-muted-foreground pl-3">
                          +{tier.perks.length - 3} more perks
                        </p>
                      )}
                    </div>

                    {/* CTA button */}
                    {!isOwned && !isLocked && (
                      <Button
                        data-ocid={`agency.${tier.key}.join_button`}
                        size="sm"
                        className="w-full text-white border-none"
                        style={{
                          background: tier.gradient,
                          opacity: canAfford ? 1 : 0.5,
                        }}
                        disabled={!canAfford}
                        onClick={() => handleJoin(tier.key)}
                      >
                        {activeTier ? "Upgrade" : "Join"} —{" "}
                        {upgradeCost.toLocaleString()} 🪙
                      </Button>
                    )}
                    {isNext && activeTier && (
                      <Button
                        data-ocid={`agency.${tier.key}.upgrade_button`}
                        size="sm"
                        className="w-full text-white border-none"
                        style={{
                          background: tier.gradient,
                          opacity: canAfford ? 1 : 0.5,
                        }}
                        disabled={!canAfford}
                        onClick={() => handleJoin(tier.key)}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Upgrade — {upgradeCost.toLocaleString()} 🪙
                      </Button>
                    )}
                    {isActive && (
                      <div
                        className="w-full text-center py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: `${tier.bgColor}`,
                          color: tier.accentColor,
                        }}
                      >
                        ✓ Currently Active
                      </div>
                    )}
                    {isLocked && (
                      <div
                        className="w-full text-center py-1.5 rounded-lg text-xs"
                        style={{
                          background: "oklch(0.15 0.015 280 / 0.4)",
                          color: "oklch(0.5 0.03 280)",
                        }}
                      >
                        Upgrade to {TIERS[currentTierIndex - 1]?.label ?? "Pro"}{" "}
                        first
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── RANKINGS TAB ────────────────────────────────────────────────────── */}
      {tab === "rankings" && <AgencyRankings />}
    </div>
  );
}
