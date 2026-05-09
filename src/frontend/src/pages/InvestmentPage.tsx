import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  Clock,
  DollarSign,
  Megaphone,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { toast } from "sonner";
import type { InvestmentItem } from "../context/AppContext";
import { useApp } from "../context/AppContext";

// ── Category Definitions ──────────────────────────────────────────────────────

type Category = "equipment" | "ads" | "studios" | "businesses" | "crypto";

interface CategoryDef {
  id: Category;
  name: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  emoji: string;
  returnRange: [number, number]; // [min%, max%]
  durationMs: number;
  riskLevel: "low" | "medium" | "high";
  lossChance: number; // 0–1
  minAmount: number;
  color: string; // oklch accent
  glowColor: string;
  badgeColor: string;
  badgeText: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "equipment",
    name: "Equipment",
    description:
      "Cameras, mics & lighting. Steady returns from content quality boost.",
    icon: Camera,
    emoji: "📸",
    returnRange: [12, 20],
    durationMs: 2 * 60 * 60 * 1000,
    riskLevel: "low",
    lossChance: 0,
    minAmount: 100,
    color: "oklch(0.65 0.2 145)",
    glowColor: "oklch(0.65 0.2 145 / 0.15)",
    badgeColor: "oklch(0.55 0.2 145 / 0.2)",
    badgeText: "Steady",
  },
  {
    id: "ads",
    name: "Ad Campaigns",
    description: "Run targeted ad campaigns. Medium risk with strong upside.",
    icon: Megaphone,
    emoji: "📢",
    returnRange: [20, 45],
    durationMs: 6 * 60 * 60 * 1000,
    riskLevel: "medium",
    lossChance: 0.25,
    minAmount: 200,
    color: "oklch(0.75 0.18 80)",
    glowColor: "oklch(0.75 0.18 80 / 0.15)",
    badgeColor: "oklch(0.6 0.18 80 / 0.2)",
    badgeText: "Medium Risk",
  },
  {
    id: "studios",
    name: "Studio Space",
    description:
      "Rent premium studio space. Slow but highly reliable passive income.",
    icon: Building2,
    emoji: "🏢",
    returnRange: [10, 15],
    durationMs: 24 * 60 * 60 * 1000,
    riskLevel: "low",
    lossChance: 0,
    minAmount: 500,
    color: "oklch(0.65 0.2 180)",
    glowColor: "oklch(0.65 0.2 180 / 0.15)",
    badgeColor: "oklch(0.55 0.2 180 / 0.2)",
    badgeText: "Reliable",
  },
  {
    id: "businesses",
    name: "Creator Business",
    description: "Launch a merch & media business. Medium risk, medium reward.",
    icon: DollarSign,
    emoji: "💼",
    returnRange: [25, 55],
    durationMs: 6 * 60 * 60 * 1000,
    riskLevel: "medium",
    lossChance: 0.2,
    minAmount: 300,
    color: "oklch(0.72 0.18 60)",
    glowColor: "oklch(0.72 0.18 60 / 0.15)",
    badgeColor: "oklch(0.6 0.18 60 / 0.2)",
    badgeText: "Medium Risk",
  },
  {
    id: "crypto",
    name: "Crypto",
    description:
      "High-volatility creator tokens. Massive gains or total loss — your call.",
    icon: Zap,
    emoji: "⚡",
    returnRange: [60, 120],
    durationMs: 3 * 60 * 60 * 1000,
    riskLevel: "high",
    lossChance: 0.45,
    minAmount: 100,
    color: "oklch(0.65 0.22 25)",
    glowColor: "oklch(0.65 0.22 25 / 0.15)",
    badgeColor: "oklch(0.55 0.22 25 / 0.2)",
    badgeText: "High Risk",
  },
];

const PRESET_AMOUNTS = [100, 500, 1000, 2500];

// ── Helpers ───────────────────────────────────────────────────────────────────

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function fmtMs(ms: number) {
  if (ms <= 0) return "Ready";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mins = m % 60;
  const secs = s % 60;
  if (h > 0) return `${h}h ${mins}m`;
  return m > 0 ? `${m}m ${secs}s` : `${secs}s`;
}

function fmtDuration(ms: number) {
  const h = ms / (60 * 60 * 1000);
  if (h >= 1) return `${h}h`;
  const m = ms / (60 * 1000);
  return `${m}m`;
}

function getCategoryDef(category?: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === category);
}

// ── CircularProgress ──────────────────────────────────────────────────────────

function CircularProgress({
  progress,
  color,
  size = 48,
}: {
  progress: number;
  color: string;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="oklch(0.25 0.02 280)"
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s linear" }}
      />
    </svg>
  );
}

// ── InvestModal ───────────────────────────────────────────────────────────────

function InvestModal({
  cat,
  maxCoins,
  onConfirm,
  onClose,
}: {
  cat: CategoryDef;
  maxCoins: number;
  onConfirm: (amount: number, returnPct: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(Math.min(cat.minAmount, maxCoins));
  const maxAmount = Math.min(maxCoins, 10000);

  const returnPct =
    cat.returnRange[0] +
    Math.floor(Math.random() * (cat.returnRange[1] - cat.returnRange[0] + 1));
  const expectedReturn = Math.floor(amount * (returnPct / 100));
  const Icon = cat.icon;

  const canInvest = amount >= cat.minAmount && amount <= maxCoins;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0 0 0 / 0.7)" }}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.025 280 / 0.98), oklch(0.13 0.02 295 / 0.98))",
          border: `1px solid ${cat.color.replace(")", " / 0.3)")}`,
          backdropFilter: "blur(32px)",
          boxShadow: `0 24px 64px ${cat.glowColor}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: `1px solid ${cat.color.replace(")", " / 0.15)")}`,
            background: cat.glowColor,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: cat.glowColor,
                border: `1px solid ${cat.color.replace(")", " / 0.3)")}`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: cat.color }} />
            </div>
            <div>
              <p className="font-bold text-sm">{cat.name}</p>
              <p className="text-xs" style={{ color: "oklch(0.65 0.04 280)" }}>
                {fmtDuration(cat.durationMs)} · {cat.returnRange[0]}–
                {cat.returnRange[1]}% return
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ background: "oklch(0.25 0.02 280 / 0.5)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* Amount presets */}
          <div className="space-y-2">
            <p
              className="text-xs font-medium"
              style={{ color: "oklch(0.65 0.04 280)" }}
            >
              Quick amounts
            </p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_AMOUNTS.filter((a) => a <= maxCoins).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    background:
                      amount === a
                        ? cat.color.replace(")", " / 0.25)")
                        : "oklch(0.22 0.02 280 / 0.6)",
                    border: `1px solid ${amount === a ? cat.color.replace(")", " / 0.5)") : "oklch(0.3 0.02 280 / 0.4)"}`,
                    color: amount === a ? cat.color : "oklch(0.75 0.02 280)",
                  }}
                >
                  {a.toLocaleString()} 🪙
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-medium"
                style={{ color: "oklch(0.65 0.04 280)" }}
              >
                Custom amount
              </p>
              <span className="text-sm font-bold" style={{ color: cat.color }}>
                {amount.toLocaleString()} 🪙
              </span>
            </div>
            <Slider
              min={cat.minAmount}
              max={maxAmount}
              step={50}
              value={[amount]}
              onValueChange={([v]) => setAmount(v)}
            />
            <div
              className="flex justify-between text-xs"
              style={{ color: "oklch(0.5 0.03 280)" }}
            >
              <span>Min: {cat.minAmount}</span>
              <span>Max: {maxAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Return preview */}
          <div
            className="rounded-xl p-3.5 space-y-2"
            style={{
              background: cat.glowColor,
              border: `1px solid ${cat.color.replace(")", " / 0.2)")}`,
            }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-xs"
                style={{ color: "oklch(0.65 0.04 280)" }}
              >
                Expected return
              </span>
              <span className="text-sm font-bold" style={{ color: cat.color }}>
                +{expectedReturn} 🪙
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="text-xs"
                style={{ color: "oklch(0.65 0.04 280)" }}
              >
                Total back
              </span>
              <span className="text-sm font-semibold">
                {(amount + expectedReturn).toLocaleString()} 🪙
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="text-xs"
                style={{ color: "oklch(0.65 0.04 280)" }}
              >
                Matures in
              </span>
              <span className="text-sm">{fmtDuration(cat.durationMs)}</span>
            </div>
            {cat.lossChance > 0 && (
              <div
                className="flex items-center gap-1.5 pt-1 border-t"
                style={{ borderColor: "oklch(0.65 0.22 25 / 0.2)" }}
              >
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.22 25)" }}
                >
                  ⚠️ {Math.round(cat.lossChance * 100)}% chance of losing
                  investment
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <Button
            data-ocid="investment.modal.confirm_button"
            className="w-full text-white font-bold h-12 text-sm border-none"
            style={{
              background: canInvest
                ? `linear-gradient(135deg, ${cat.color}, ${cat.color.replace(")", " / 0.7)")})`
                : "oklch(0.3 0.02 280)",
              boxShadow: canInvest ? `0 4px 24px ${cat.glowColor}` : "none",
            }}
            disabled={!canInvest}
            onClick={() => onConfirm(amount, returnPct)}
          >
            Invest {amount.toLocaleString()} 🪙
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function InvestmentPage() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    investments,
    setInvestments,
    triggerSave,
    addNotification,
  } = useApp();
  const now = useNow();
  const [selectedCat, setSelectedCat] = useState<CategoryDef | null>(null);
  const returnPctRef = useRef<Record<string, number>>({});

  // Auto-resolve completed investments
  // biome-ignore lint/correctness/useExhaustiveDependencies: now is tick trigger
  useEffect(() => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.status !== "active") return inv;
        const elapsed = Date.now() - inv.startTime;
        if (elapsed < inv.durationMs) return inv;
        const cat = getCategoryDef(
          (inv as InvestmentItem & { category?: string }).category,
        );
        const lossChance = cat?.lossChance ?? (inv.type === "risky" ? 0.5 : 0);
        const won = Math.random() >= lossChance;
        return { ...inv, status: won ? "completed" : "lost" };
      }),
    );
  }, [now, setInvestments]);

  const handleConfirmInvest = (
    cat: CategoryDef,
    amount: number,
    returnPct: number,
  ) => {
    if (creatorCoins < amount) {
      toast.error(`Need ${amount} 🪙 to invest in ${cat.name}`);
      return;
    }
    const expectedReturn = Math.floor(amount * (returnPct / 100));
    const invId = `${cat.id}-${Date.now()}`;
    returnPctRef.current[invId] = returnPct;
    const newInv = {
      id: invId,
      type:
        cat.riskLevel === "high" || cat.lossChance > 0.3
          ? ("risky" as const)
          : ("safe" as const),
      category: cat.id,
      amount,
      expectedReturn,
      startTime: Date.now(),
      durationMs: cat.durationMs,
      status: "active" as const,
    };
    setCreatorCoins((c) => c - amount);
    setInvestments((prev) => [...prev, newInv]);
    triggerSave();
    toast.success(`Invested ${amount} 🪙 in ${cat.name}! ${cat.emoji}`);
    addNotification({
      icon: cat.emoji,
      message: `Investment started: ${cat.name} — matures in ${fmtDuration(cat.durationMs)}`,
      type: "smart",
    });
    setSelectedCat(null);
  };

  const handleClaim = (inv: InvestmentItem & { category?: string }) => {
    if (inv.status === "completed") {
      const total = inv.amount + inv.expectedReturn;
      setCreatorCoins((c) => c + total);
      const cat = getCategoryDef(inv.category);
      toast.success(`Claimed ${total} 🪙! Profit: +${inv.expectedReturn} 🎉`);
      addNotification({
        icon: "💰",
        message: `${cat?.name ?? "Investment"} matured! Earned +${inv.expectedReturn} 🪙 profit`,
        type: "tip",
      });
    } else {
      const cat = getCategoryDef(inv.category);
      toast.error(
        `${cat?.name ?? "Investment"} lost. Better luck next time! 📉`,
      );
    }
    setInvestments((prev) => prev.filter((i) => i.id !== inv.id));
    triggerSave();
  };

  // Portfolio stats
  const portfolioStats = useMemo(() => {
    const allInvs = investments as (InvestmentItem & { category?: string })[];
    const totalInvested = allInvs
      .filter((i) => i.status === "active")
      .reduce((s, i) => s + i.amount, 0);
    const totalEarned = allInvs
      .filter((i) => i.status === "completed")
      .reduce((s, i) => s + i.expectedReturn, 0);
    const portfolioValue = totalInvested + totalEarned;
    const roi =
      totalInvested > 0 ? Math.round((totalEarned / totalInvested) * 100) : 0;
    return { totalInvested, totalEarned, portfolioValue, roi };
  }, [investments]);

  const activeInvestments = investments.filter(
    (i) => i.status === "active",
  ) as (InvestmentItem & { category?: string })[];
  const claimableInvestments = investments.filter(
    (i) => i.status !== "active",
  ) as (InvestmentItem & { category?: string })[];

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.09 0.015 280)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4 flex items-center gap-3"
        style={{
          background: "oklch(0.11 0.018 280 / 0.95)",
          borderBottom: "1px solid oklch(0.22 0.02 280 / 0.6)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          type="button"
          data-ocid="investment.back.button"
          onClick={() => navigate("hub")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
          style={{
            background: "oklch(0.18 0.02 280 / 0.6)",
            border: "1px solid oklch(0.3 0.025 280 / 0.4)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Investments</h1>
          <p className="text-xs" style={{ color: "oklch(0.55 0.03 280)" }}>
            Grow your coins passively
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            border: "1px solid oklch(0.55 0.2 80 / 0.35)",
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

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          data-ocid="investment.portfolio.card"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.16 0.04 295 / 0.9), oklch(0.13 0.03 280 / 0.9))",
            border: "1px solid oklch(0.35 0.08 295 / 0.4)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px oklch(0.5 0.2 295 / 0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.2 295)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.72 0.2 295)" }}
            >
              Portfolio Summary
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Total Invested",
                value: `${portfolioStats.totalInvested.toLocaleString()} 🪙`,
                color: "oklch(0.75 0.04 280)",
              },
              {
                label: "Total Earned",
                value: `+${portfolioStats.totalEarned.toLocaleString()} 🪙`,
                color: "oklch(0.72 0.18 145)",
              },
              {
                label: "Portfolio Value",
                value: `${portfolioStats.portfolioValue.toLocaleString()} 🪙`,
                color: "oklch(0.72 0.2 295)",
              },
              {
                label: "ROI",
                value: `${portfolioStats.roi > 0 ? "+" : ""}${portfolioStats.roi}%`,
                color:
                  portfolioStats.roi >= 0
                    ? "oklch(0.72 0.18 145)"
                    : "oklch(0.65 0.22 25)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3"
                style={{ background: "oklch(0.13 0.02 280 / 0.6)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "oklch(0.5 0.03 280)" }}
                >
                  {stat.label}
                </p>
                <p className="text-sm font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Claimable Investments */}
        <AnimatePresence>
          {claimableInvestments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "oklch(0.55 0.03 280)" }}
              >
                Ready to Claim
              </h2>
              {claimableInvestments.map((inv) => {
                const cat = getCategoryDef(inv.category);
                const isWon = inv.status === "completed";
                const _Icon = cat?.icon ?? TrendingUp;
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    data-ocid={`investment.claimable.item.${inv.id}`}
                    className="rounded-xl p-3.5 flex items-center gap-3"
                    style={{
                      background: isWon
                        ? "oklch(0.16 0.04 145 / 0.4)"
                        : "oklch(0.16 0.03 25 / 0.4)",
                      border: `1px solid ${isWon ? "oklch(0.55 0.2 145 / 0.4)" : "oklch(0.55 0.2 25 / 0.4)"}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isWon
                          ? "oklch(0.55 0.2 145 / 0.15)"
                          : "oklch(0.55 0.2 25 / 0.15)",
                      }}
                    >
                      {isWon ? (
                        <Check
                          className="w-5 h-5"
                          style={{ color: "oklch(0.72 0.18 145)" }}
                        />
                      ) : (
                        <X
                          className="w-5 h-5"
                          style={{ color: "oklch(0.65 0.22 25)" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {cat?.name ?? "Investment"} {cat?.emoji}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.03 280)" }}
                      >
                        {isWon
                          ? `Profit: +${inv.expectedReturn} 🪙 · Total: ${(inv.amount + inv.expectedReturn).toLocaleString()} 🪙`
                          : `Lost ${inv.amount.toLocaleString()} 🪙`}
                      </p>
                    </div>
                    <Button
                      data-ocid="investment.claim.primary_button"
                      size="sm"
                      className="text-white border-none flex-shrink-0"
                      style={{
                        background: isWon
                          ? "oklch(0.55 0.2 145)"
                          : "oklch(0.5 0.15 25)",
                      }}
                      onClick={() => handleClaim(inv)}
                    >
                      {isWon ? "Claim" : "Dismiss"}
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "oklch(0.55 0.03 280)" }}
            >
              Active Investments · {activeInvestments.length}
            </h2>
            {activeInvestments.map((inv) => {
              const remaining = inv.startTime + inv.durationMs - now;
              const progress = Math.min(
                100,
                ((now - inv.startTime) / inv.durationMs) * 100,
              );
              const cat = getCategoryDef(inv.category);
              const _Icon = cat?.icon ?? TrendingUp;
              const accentColor = cat?.color ?? "oklch(0.65 0.2 295)";
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-ocid={`investment.active.item.${inv.id}`}
                  className="rounded-xl p-4"
                  style={{
                    background: "oklch(0.14 0.02 280 / 0.9)",
                    border: `1px solid ${accentColor.replace(")", " / 0.2)")}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <CircularProgress
                        progress={progress}
                        color={accentColor}
                        size={52}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base">{cat?.emoji ?? "📊"}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {cat?.name ?? "Investment"}
                        </p>
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: accentColor }}
                        >
                          <Clock className="w-3 h-3" />
                          {fmtMs(remaining)}
                        </div>
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.55 0.03 280)" }}
                      >
                        {inv.amount.toLocaleString()} 🪙 · Expected: +
                        {inv.expectedReturn.toLocaleString()} 🪙
                      </p>
                      <div
                        className="mt-2 h-1 rounded-full overflow-hidden"
                        style={{ background: "oklch(0.22 0.02 280)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${progress}%`,
                            background: accentColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Investment Categories */}
        <div className="space-y-3">
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "oklch(0.55 0.03 280)" }}
          >
            Investment Options
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              const hasActive = activeInvestments.some(
                (inv) => inv.category === cat.id,
              );
              const canAfford = creatorCoins >= cat.minAmount;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`investment.${cat.id}.card`}
                >
                  <button
                    type="button"
                    className="w-full text-left rounded-2xl p-4 transition-all duration-200 group"
                    style={{
                      background: "oklch(0.14 0.022 280 / 0.95)",
                      border: `1px solid ${cat.color.replace(")", " / 0.2)")}`,
                      backdropFilter: "blur(12px)",
                      opacity: hasActive ? 0.7 : 1,
                      cursor: hasActive ? "default" : "pointer",
                      boxShadow: `inset 0 1px 0 ${cat.color.replace(")", " / 0.06)")}`,
                    }}
                    onClick={() => {
                      if (hasActive) {
                        toast.info(`${cat.name} investment already active`);
                        return;
                      }
                      if (!canAfford) {
                        toast.error(
                          `Need at least ${cat.minAmount} 🪙 to invest`,
                        );
                        return;
                      }
                      setSelectedCat(cat);
                    }}
                  >
                    {/* Category icon row */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background: cat.glowColor,
                          border: `1px solid ${cat.color.replace(")", " / 0.3)")}`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: cat.color }}
                        />
                      </div>
                      <Badge
                        style={{
                          background: cat.badgeColor,
                          color: cat.color,
                          border: `1px solid ${cat.color.replace(")", " / 0.3)")}`,
                          fontSize: "0.65rem",
                        }}
                      >
                        {cat.badgeText}
                      </Badge>
                    </div>

                    {/* Name & description */}
                    <p className="font-bold text-sm mb-1">
                      {cat.emoji} {cat.name}
                    </p>
                    <p
                      className="text-xs leading-relaxed mb-3"
                      style={{ color: "oklch(0.55 0.03 280)" }}
                    >
                      {cat.description}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.5 0.03 280)" }}
                        >
                          Returns
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: cat.color }}
                        >
                          +{cat.returnRange[0]}–{cat.returnRange[1]}%
                        </p>
                      </div>
                      <div className="space-y-0.5 text-center">
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.5 0.03 280)" }}
                        >
                          Matures in
                        </p>
                        <p className="text-xs font-bold">
                          {fmtDuration(cat.durationMs)}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.5 0.03 280)" }}
                        >
                          Min invest
                        </p>
                        <p className="text-xs font-bold">{cat.minAmount} 🪙</p>
                      </div>
                    </div>

                    {/* Status row */}
                    {hasActive ? (
                      <div
                        className="mt-3 rounded-lg py-2 px-3 text-xs font-medium text-center"
                        style={{
                          background: cat.glowColor,
                          color: cat.color,
                        }}
                      >
                        ✓ Active — earning passive income
                      </div>
                    ) : (
                      <div
                        className="mt-3 rounded-lg py-2 px-3 text-xs font-semibold text-center transition-all duration-200"
                        style={{
                          background: canAfford
                            ? `linear-gradient(135deg, ${cat.color.replace(")", " / 0.2)")}, ${cat.color.replace(")", " / 0.1)")})`
                            : "oklch(0.22 0.02 280 / 0.4)",
                          color: canAfford ? cat.color : "oklch(0.45 0.03 280)",
                          border: `1px solid ${canAfford ? cat.color.replace(")", " / 0.3)") : "oklch(0.3 0.02 280 / 0.3)"}`,
                        }}
                      >
                        {canAfford
                          ? "Invest Now →"
                          : `Need ${cat.minAmount} 🪙`}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Passive income note */}
        <div
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{
            background: "oklch(0.14 0.03 295 / 0.5)",
            border: "1px solid oklch(0.35 0.08 295 / 0.25)",
          }}
        >
          <span className="text-base flex-shrink-0 mt-0.5">💡</span>
          <div>
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: "oklch(0.72 0.2 295)" }}
            >
              Passive Income
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.55 0.03 280)" }}
            >
              Investments mature even when you're away. Check back after the
              timer to claim your returns. Higher risk = higher potential
              reward.
            </p>
          </div>
        </div>
      </div>

      {/* Invest Modal */}
      <AnimatePresence>
        {selectedCat && (
          <InvestModal
            cat={selectedCat}
            maxCoins={creatorCoins}
            onConfirm={(amount, returnPct) =>
              handleConfirmInvest(selectedCat, amount, returnPct)
            }
            onClose={() => setSelectedCat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
