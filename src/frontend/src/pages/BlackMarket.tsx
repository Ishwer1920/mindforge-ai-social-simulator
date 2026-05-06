import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

interface BmItem {
  id: string;
  emoji: string;
  name: string;
  cost: number;
  effect: string;
  risk: string;
  riskChance: number;
}

const BM_ITEMS: BmItem[] = [
  {
    id: "engagement-data",
    emoji: "📊",
    name: "Stolen Engagement Data",
    cost: 500,
    effect: "+50% engagement boost for next 3 posts",
    risk: "30% chance of Trust Score -15 penalty",
    riskChance: 0.3,
  },
  {
    id: "algorithm-info",
    emoji: "🔓",
    name: "Leaked Algorithm Info",
    cost: 1000,
    effect: "2× viral multiplier for 1 hour",
    risk: "20% chance of shadow ban (1 hour)",
    riskChance: 0.2,
  },
  {
    id: "rival-sabotage",
    emoji: "🗡️",
    name: "Rival Sabotage",
    cost: 2000,
    effect: "Reduces rival's engagement by 40% for 24h",
    risk: "15% chance of backfire — affects you instead",
    riskChance: 0.15,
  },
];

const ACTIVE_EFFECTS_KEY = "mindforge-bm-effects";

function loadEffects(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ACTIVE_EFFECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function saveEffects(effects: Record<string, number>) {
  localStorage.setItem(ACTIVE_EFFECTS_KEY, JSON.stringify(effects));
}

export default function BlackMarket() {
  const {
    navigate,
    creatorCoins,
    setCreatorCoins,
    setShadowBan,
    addNotification,
  } = useApp();

  const [activeEffects, setActiveEffects] = useState<Record<string, number>>(
    () => loadEffects(),
  );
  const [purchasing, setPurchasing] = useState<string | null>(null);

  function purchase(item: BmItem) {
    if (creatorCoins < item.cost) {
      toast.error("Not enough Creator Coins");
      return;
    }
    setPurchasing(item.id);
    setTimeout(() => {
      setCreatorCoins((c) => c - item.cost);

      const rollRisk = Math.random() < item.riskChance;

      if (rollRisk) {
        // Apply risk penalty
        if (item.id === "engagement-data") {
          addNotification({
            type: "shadow_ban",
            icon: "⚠️",
            message: "⚠️ Black Market: Stolen data traced — Trust Score -15",
          });
          toast.error("Risk triggered! Trust score penalized.");
        } else if (item.id === "algorithm-info") {
          setShadowBan({
            active: true,
            endsAt: Date.now() + 3600000,
          });
          addNotification({
            type: "shadow_ban",
            icon: "⚠️",
            message: "⚠️ Black Market: Shadow ban triggered for 1 hour",
          });
          toast.error("Risk triggered! Shadow ban activated.");
        } else if (item.id === "rival-sabotage") {
          addNotification({
            type: "shadow_ban",
            icon: "⚠️",
            message: "⚠️ Sabotage backfired! Your own engagement is reduced.",
          });
          toast.error("Backfire! The sabotage turned against you.");
        }
      } else {
        // Apply benefit
        const expiresAt =
          item.id === "algorithm-info"
            ? Date.now() + 3600000
            : Date.now() + 86400000;
        const next = { ...activeEffects, [item.id]: expiresAt };
        setActiveEffects(next);
        saveEffects(next);

        addNotification({
          type: "smart",
          icon: "✅",
          message: `✅ Black Market: ${item.name} activated!`,
        });
        toast.success(`${item.emoji} ${item.name} activated!`);
      }
      setPurchasing(null);
    }, 1500);
  }

  function isActive(itemId: string) {
    const exp = activeEffects[itemId];
    return exp && exp > Date.now();
  }

  function timeLeft(itemId: string): string {
    const exp = activeEffects[itemId];
    if (!exp) return "";
    const secs = Math.floor((exp - Date.now()) / 1000);
    if (secs <= 0) return "";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
      data-ocid="black_market.page"
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.11 0.018 280 / 0.95)",
          borderBottom: "1px solid oklch(0.2 0.025 280 / 0.4)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("hub")}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="black_market.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            ⚫ Black Market
          </h1>
          <p className="text-xs text-muted-foreground">
            Underground deals — high risk, high reward
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: "oklch(0.55 0.22 25 / 0.2)",
            border: "1px solid oklch(0.6 0.22 25 / 0.4)",
            color: "oklch(0.75 0.22 25)",
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          HIGH RISK
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Warning banner */}
        <div
          className="rounded-xl p-4 flex gap-3"
          style={{
            background: "oklch(0.18 0.06 30 / 0.3)",
            border: "1px solid oklch(0.65 0.22 30 / 0.4)",
          }}
        >
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0"
            style={{ color: "oklch(0.75 0.22 30)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.82 0.15 30)" }}>
            These deals are illegal on the platform. Using them risks shadow
            bans, trust score penalties, and account reputation damage. Proceed
            at your own risk.
          </p>
        </div>

        {/* Coin balance */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
        >
          <span className="text-sm text-muted-foreground">Your balance</span>
          <span
            className="text-lg font-black"
            style={{ color: "oklch(0.8 0.18 80)" }}
          >
            🪙 {creatorCoins.toLocaleString()}
          </span>
        </div>

        {/* Items */}
        {BM_ITEMS.map((item, idx) => {
          const active = isActive(item.id);
          const tl = active ? timeLeft(item.id) : null;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.13 0.016 280 / 0.95)",
                border: active
                  ? "1px solid oklch(0.7 0.22 145 / 0.5)"
                  : "1px solid oklch(0.22 0.025 280 / 0.5)",
              }}
              data-ocid={`black_market.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "oklch(0.18 0.025 280)" }}
                  >
                    {item.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "oklch(0.8 0.18 80)" }}
                    >
                      🪙 {item.cost.toLocaleString()} coins
                    </p>
                  </div>
                </div>
                {active && (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0"
                    style={{
                      background: "oklch(0.7 0.22 145 / 0.2)",
                      border: "1px solid oklch(0.7 0.22 145 / 0.4)",
                      color: "oklch(0.75 0.22 145)",
                    }}
                  >
                    ACTIVE {tl && `· ${tl}`}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                ✅ {item.effect}
              </p>
              <p
                className="text-xs mb-4"
                style={{ color: "oklch(0.72 0.2 30)" }}
              >
                ⚠️ {item.risk}
              </p>
              <Button
                onClick={() => purchase(item)}
                disabled={
                  purchasing === item.id || creatorCoins < item.cost || !!active
                }
                className="w-full"
                style={{
                  background:
                    creatorCoins >= item.cost && !active
                      ? "linear-gradient(135deg, oklch(0.35 0.04 280), oklch(0.28 0.035 260))"
                      : undefined,
                  border: "1px solid oklch(0.35 0.04 280 / 0.8)",
                }}
                data-ocid={`black_market.purchase_button.${idx + 1}`}
              >
                {purchasing === item.id
                  ? "Processing..."
                  : active
                    ? "Already Active"
                    : creatorCoins < item.cost
                      ? "Insufficient Coins"
                      : `Buy for ${item.cost.toLocaleString()} coins`}
              </Button>
            </motion.div>
          );
        })}

        <p
          className="text-center text-xs pb-4"
          style={{ color: "oklch(0.38 0.03 280)" }}
        >
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
