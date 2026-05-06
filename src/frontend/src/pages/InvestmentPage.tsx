import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { InvestmentItem } from "../context/AppContext";

const SAFE_OPTIONS = [
  {
    id: "safe-starter",
    label: "Starter Fund",
    emoji: "🌱",
    type: "safe" as const,
    amount: 100,
    returnPct: 15,
    durationMs: 5 * 60 * 1000,
  },
  {
    id: "safe-growth",
    label: "Growth Fund",
    emoji: "📈",
    type: "safe" as const,
    amount: 500,
    returnPct: 18,
    durationMs: 5 * 60 * 1000,
  },
  {
    id: "safe-premium",
    label: "Premium Bond",
    emoji: "💰",
    type: "safe" as const,
    amount: 1000,
    returnPct: 20,
    durationMs: 5 * 60 * 1000,
  },
];

const RISKY_OPTIONS = [
  {
    id: "risky-gamble",
    label: "Meme Coin",
    emoji: "🎰",
    type: "risky" as const,
    amount: 200,
    returnPct: 60,
    durationMs: 3 * 60 * 1000,
  },
  {
    id: "risky-high",
    label: "Viral Bet",
    emoji: "⚡",
    type: "risky" as const,
    amount: 1000,
    returnPct: 80,
    durationMs: 3 * 60 * 1000,
  },
  {
    id: "risky-allin",
    label: "All-In Trend",
    emoji: "🚀",
    type: "risky" as const,
    amount: 2500,
    returnPct: 100,
    durationMs: 3 * 60 * 1000,
  },
];

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
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function InvestmentPage() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    investments,
    setInvestments,
    triggerSave,
  } = useApp();
  const now = useNow();

  // Auto-resolve completed investments
  // biome-ignore lint/correctness/useExhaustiveDependencies: now used as tick trigger
  useEffect(() => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.status !== "active") return inv;
        const elapsed = Date.now() - inv.startTime;
        if (elapsed < inv.durationMs) return inv;
        // Resolve
        if (inv.type === "safe") {
          return { ...inv, status: "completed" };
        }
        // Risky: 50/50
        const won = Math.random() < 0.5;
        return { ...inv, status: won ? "completed" : "lost" };
      }),
    );
  }, [now, setInvestments]);

  const handleInvest = (opt: {
    id: string;
    label: string;
    emoji: string;
    type: "safe" | "risky";
    amount: number;
    returnPct: number;
    durationMs: number;
  }) => {
    if (creatorCoins < opt.amount) {
      toast.error(`Need ${opt.amount} 🪙 to invest`);
      return;
    }
    // Check if already have active of same id
    const alreadyActive = investments.some(
      (i) => i.id.startsWith(opt.id) && i.status === "active",
    );
    if (alreadyActive) {
      toast.error("You already have an active investment of this type");
      return;
    }
    const returnAmount = Math.floor(opt.amount * (opt.returnPct / 100));
    const newInv: InvestmentItem = {
      id: `${opt.id}-${Date.now()}`,
      type: opt.type,
      amount: opt.amount,
      expectedReturn: returnAmount,
      startTime: Date.now(),
      durationMs: opt.durationMs,
      status: "active",
    };
    setCreatorCoins((c) => c - opt.amount);
    setInvestments((prev) => [...prev, newInv]);
    triggerSave();
    toast.success(`Invested ${opt.amount} 🪙 in ${opt.label}!`);
  };

  const handleClaim = (inv: InvestmentItem) => {
    if (inv.status === "completed") {
      const total = inv.amount + inv.expectedReturn;
      setCreatorCoins((c) => c + total);
      toast.success(`Claimed ${total} 🪙! (+${inv.expectedReturn} profit) 🎉`);
    } else {
      toast.error("Investment lost. Better luck next time! 📉");
    }
    setInvestments((prev) => prev.filter((i) => i.id !== inv.id));
    triggerSave();
  };

  const activeInvestments = investments.filter((i) => i.status === "active");
  const resolvedInvestments = investments.filter((i) => i.status !== "active");

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="investment.back.button"
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
          <h1 className="text-xl font-bold">Investments</h1>
          <p className="text-xs text-muted-foreground">
            Grow your coins passively
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

      {/* Active investments */}
      {activeInvestments.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Active Investments
          </h2>
          {activeInvestments.map((inv) => {
            const remaining = inv.startTime + inv.durationMs - now;
            const progress = Math.min(
              100,
              ((now - inv.startTime) / inv.durationMs) * 100,
            );
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-3"
                style={{
                  background: "oklch(0.16 0.025 280 / 0.9)",
                  border: "1px solid oklch(0.3 0.04 280 / 0.4)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {inv.amount} 🪙 invested
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.type === "safe" ? "Safe" : "Risky"} · +
                      {inv.expectedReturn} 🪙 expected
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "oklch(0.72 0.18 295)" }}
                  >
                    <Clock className="w-3 h-3" />
                    {fmtMs(remaining)}
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.22 0.02 280)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${progress}%`,
                      background:
                        inv.type === "safe"
                          ? "oklch(0.65 0.2 145)"
                          : "oklch(0.65 0.2 50)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Resolved investments (claimable) */}
      {resolvedInvestments.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Ready to Claim
          </h2>
          {resolvedInvestments.map((inv) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background:
                  inv.status === "completed"
                    ? "oklch(0.18 0.05 145 / 0.3)"
                    : "oklch(0.18 0.03 25 / 0.3)",
                border: `1px solid ${inv.status === "completed" ? "oklch(0.55 0.2 145 / 0.4)" : "oklch(0.55 0.2 25 / 0.4)"}`,
              }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {inv.status === "completed"
                    ? `+${inv.amount + inv.expectedReturn} 🪙`
                    : "Lost investment"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inv.status === "completed"
                    ? `Profit: +${inv.expectedReturn} 🪙`
                    : `Lost ${inv.amount} 🪙`}
                </p>
              </div>
              <Button
                data-ocid="investment.claim.primary_button"
                size="sm"
                className="text-white border-none"
                style={{
                  background:
                    inv.status === "completed"
                      ? "oklch(0.55 0.2 145)"
                      : "oklch(0.5 0.15 25)",
                }}
                onClick={() => handleClaim(inv)}
              >
                {inv.status === "completed" ? "Claim" : "Dismiss"}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Safe Investments */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "oklch(0.65 0.2 145)" }}
          />
          <h2 className="text-sm font-semibold">Safe Investments</h2>
          <Badge
            style={{
              background: "oklch(0.55 0.2 145 / 0.2)",
              color: "oklch(0.72 0.18 145)",
            }}
          >
            Low Risk
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SAFE_OPTIONS.map((opt, i) => {
            const active = investments.some(
              (inv) => inv.id.startsWith(opt.id) && inv.status === "active",
            );
            return (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  data-ocid={`investment.${opt.id}.card`}
                  style={{
                    background: "oklch(0.13 0.016 280 / 0.95)",
                    border: "1px solid oklch(0.25 0.025 280 / 0.4)",
                  }}
                >
                  <CardHeader className="pb-1 pt-4 px-4">
                    <div className="text-2xl">{opt.emoji}</div>
                    <CardTitle className="text-sm">{opt.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {opt.amount} 🪙 · +{opt.returnPct}% in 5m
                    </p>
                    <Button
                      data-ocid={`investment.${opt.id}.primary_button`}
                      size="sm"
                      className="w-full text-white border-none"
                      style={{
                        background: "oklch(0.55 0.2 145)",
                        opacity: active || creatorCoins < opt.amount ? 0.5 : 1,
                      }}
                      disabled={active || creatorCoins < opt.amount}
                      onClick={() => handleInvest(opt)}
                    >
                      {active ? "Active" : "Invest"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Risky Investments */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <h2 className="text-sm font-semibold">Risky Investments</h2>
          <Badge
            style={{
              background: "oklch(0.55 0.2 50 / 0.2)",
              color: "oklch(0.75 0.2 50)",
            }}
          >
            High Risk
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {RISKY_OPTIONS.map((opt, i) => {
            const active = investments.some(
              (inv) => inv.id.startsWith(opt.id) && inv.status === "active",
            );
            return (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.06 }}
              >
                <Card
                  data-ocid={`investment.${opt.id}.card`}
                  style={{
                    background: "oklch(0.13 0.016 280 / 0.95)",
                    border: "1px solid oklch(0.25 0.025 280 / 0.4)",
                  }}
                >
                  <CardHeader className="pb-1 pt-4 px-4">
                    <div className="text-2xl">{opt.emoji}</div>
                    <CardTitle className="text-sm">{opt.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {opt.amount} 🪙 · +{opt.returnPct}% or lose all
                    </p>
                    <Button
                      data-ocid={`investment.${opt.id}.primary_button`}
                      size="sm"
                      className="w-full text-white border-none"
                      style={{
                        background: "oklch(0.6 0.2 50)",
                        opacity: active || creatorCoins < opt.amount ? 0.5 : 1,
                      }}
                      disabled={active || creatorCoins < opt.amount}
                      onClick={() => handleInvest(opt)}
                    >
                      {active ? "Active" : "Risk It"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
