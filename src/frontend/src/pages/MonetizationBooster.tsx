import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const LS_KEY = "mindforge-monetization-booster";

interface Campaign {
  id: string;
  tier: "mini" | "standard" | "mega";
  cost: number;
  minEarn: number;
  maxEarn: number;
  durationMs: number;
  startedAt: number;
  projectedEarning: number;
  collected: boolean;
}

const TIERS = [
  {
    id: "mini",
    emoji: "⚡",
    label: "Mini Campaign",
    cost: 500,
    minEarn: 800,
    maxEarn: 1200,
    durationMs: 2 * 3600000,
    desc: "Quick 2-hour ad burst",
  },
  {
    id: "standard",
    emoji: "📣",
    label: "Standard Campaign",
    cost: 1500,
    minEarn: 2500,
    maxEarn: 4000,
    durationMs: 6 * 3600000,
    desc: "6-hour reach maximizer",
  },
  {
    id: "mega",
    emoji: "🚀",
    label: "Mega Campaign",
    cost: 5000,
    minEarn: 9000,
    maxEarn: 15000,
    durationMs: 24 * 3600000,
    desc: "Full 24-hour domination",
  },
] as const;

function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Campaign[];
  } catch (_) {}
  return [];
}

function saveCampaigns(c: Campaign[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(c));
}

function formatTimeLeft(endsAt: number): string {
  const diff = Math.max(0, endsAt - Date.now());
  if (diff === 0) return "Ready to collect!";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export default function MonetizationBooster() {
  const { navigate, creatorCoins, setCreatorCoins, addNotification } = useApp();
  const [campaigns, setCampaigns] = useState<Campaign[]>(loadCampaigns);
  const [_tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const activeCampaigns = campaigns.filter((c) => !c.collected);
  const totalEarnedFromCampaigns = campaigns
    .filter((c) => c.collected)
    .reduce((s, c) => s + c.projectedEarning, 0);

  function startCampaign(tierId: "mini" | "standard" | "mega") {
    const tier = TIERS.find((t) => t.id === tierId)!;
    if (creatorCoins < tier.cost) {
      toast.error(
        `Not enough coins! You need ${tier.cost.toLocaleString()} coins.`,
      );
      return;
    }
    const existing = activeCampaigns.find((c) => c.tier === tierId);
    if (existing) {
      toast.info(`A ${tier.label} is already running!`);
      return;
    }
    setCreatorCoins((c) => c - tier.cost);
    const projectedEarning = Math.floor(
      tier.minEarn + Math.random() * (tier.maxEarn - tier.minEarn),
    );
    const campaign: Campaign = {
      id: `campaign-${Date.now()}-${tierId}`,
      tier: tierId,
      cost: tier.cost,
      minEarn: tier.minEarn,
      maxEarn: tier.maxEarn,
      durationMs: tier.durationMs,
      startedAt: Date.now(),
      projectedEarning,
      collected: false,
    };
    const updated = [...campaigns, campaign];
    setCampaigns(updated);
    saveCampaigns(updated);
    addNotification({
      icon: tier.emoji,
      message: `${tier.label} started! Projected earnings: ${projectedEarning.toLocaleString()} coins.`,
      type: "sponsorship",
    });
    toast.success(
      `${tier.emoji} ${tier.label} launched! Expected: ${projectedEarning.toLocaleString()} coins`,
    );
  }

  function collectCampaign(id: string) {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;
    const endsAt = campaign.startedAt + campaign.durationMs;
    if (Date.now() < endsAt) {
      toast.info("Campaign is still running! Check back when it ends.");
      return;
    }
    setCreatorCoins((c) => c + campaign.projectedEarning);
    const updated = campaigns.map((c) =>
      c.id === id ? { ...c, collected: true } : c,
    );
    setCampaigns(updated);
    saveCampaigns(updated);
    addNotification({
      icon: "💰",
      message: `Campaign complete! +${campaign.projectedEarning.toLocaleString()} coins collected.`,
      type: "sponsorship",
    });
    toast.success(
      `💰 +${campaign.projectedEarning.toLocaleString()} coins collected!`,
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
    >
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
          data-ocid="monetization-booster.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            Monetization Booster
          </h1>
          <p className="text-xs text-muted-foreground">
            Run ad campaigns to earn coins passively
          </p>
        </div>
        <div
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: "oklch(0.18 0.04 80 / 0.3)",
            color: "oklch(0.78 0.18 80)",
            border: "1px solid oklch(0.6 0.2 80 / 0.35)",
          }}
        >
          🪙 {creatorCoins.toLocaleString()}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Total earnings */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: "oklch(0.13 0.016 280 / 0.95)",
            border: "1px solid oklch(0.22 0.025 280 / 0.5)",
          }}
        >
          <TrendingUp
            className="w-5 h-5"
            style={{ color: "oklch(0.72 0.2 145)" }}
          />
          <div>
            <p className="text-xs text-muted-foreground">
              Total campaign earnings
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: "oklch(0.78 0.18 80)" }}
            >
              {totalEarnedFromCampaigns.toLocaleString()} coins
            </p>
          </div>
        </div>

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Active Campaigns
            </h2>
            {activeCampaigns.map((c, idx) => {
              const tier = TIERS.find((t) => t.id === c.tier)!;
              const endsAt = c.startedAt + c.durationMs;
              const isReady = Date.now() >= endsAt;
              const pct = Math.min(
                100,
                ((Date.now() - c.startedAt) / c.durationMs) * 100,
              );
              return (
                <div
                  key={c.id}
                  data-ocid={`monetization-booster.campaign.${idx + 1}`}
                  className="rounded-2xl p-4 space-y-3"
                  style={{
                    background: isReady
                      ? "oklch(0.14 0.03 145 / 0.5)"
                      : "oklch(0.13 0.016 280 / 0.95)",
                    border: `1px solid ${isReady ? "oklch(0.45 0.15 145 / 0.4)" : "oklch(0.22 0.025 280 / 0.5)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {tier.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: isReady
                            ? "oklch(0.72 0.22 145)"
                            : "oklch(0.55 0.04 280)",
                        }}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatTimeLeft(endsAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.78 0.18 80)" }}
                      >
                        ~{c.projectedEarning.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">coins</p>
                    </div>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.18 0.02 280)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: isReady
                          ? "oklch(0.55 0.22 145)"
                          : "linear-gradient(90deg, oklch(0.55 0.22 260), oklch(0.55 0.22 295))",
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => collectCampaign(c.id)}
                    disabled={!isReady}
                    className="w-full h-8 text-xs"
                    style={
                      isReady
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.65 0.22 80), oklch(0.6 0.2 60))",
                            color: "white",
                          }
                        : {}
                    }
                    data-ocid={`monetization-booster.collect.button.${idx + 1}`}
                  >
                    {isReady
                      ? `💰 Collect ${c.projectedEarning.toLocaleString()} coins`
                      : "Running..."}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tier Selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Launch Campaign
          </h2>
          {TIERS.map((tier, idx) => {
            const isRunning = activeCampaigns.some((c) => c.tier === tier.id);
            const canAfford = creatorCoins >= tier.cost;
            return (
              <div
                key={tier.id}
                data-ocid={`monetization-booster.tier.${idx + 1}`}
                className="rounded-2xl p-4"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.95)",
                  border: "1px solid oklch(0.22 0.025 280 / 0.5)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{tier.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {tier.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{tier.desc}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span style={{ color: "oklch(0.72 0.22 25)" }}>
                        Cost: {tier.cost.toLocaleString()} coins
                      </span>
                      <span style={{ color: "oklch(0.72 0.22 145)" }}>
                        Earn: {tier.minEarn.toLocaleString()}–
                        {tier.maxEarn.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    startCampaign(tier.id as "mini" | "standard" | "mega")
                  }
                  disabled={isRunning || !canAfford}
                  className="w-full h-8 text-xs"
                  style={
                    !isRunning && canAfford
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.5 0.28 300))",
                          color: "white",
                        }
                      : {}
                  }
                  data-ocid={`monetization-booster.launch.button.${idx + 1}`}
                >
                  {isRunning
                    ? "Already Running"
                    : !canAfford
                      ? `Need ${tier.cost.toLocaleString()} coins`
                      : `🚀 Launch for ${tier.cost.toLocaleString()} coins`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
