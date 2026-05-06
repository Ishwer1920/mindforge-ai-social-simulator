import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { BrandBid } from "../context/AppContext";

const INDUSTRY_GRADIENTS: Record<string, string> = {
  Tech: "linear-gradient(135deg, oklch(0.55 0.22 260), oklch(0.5 0.2 240))",
  Fashion: "linear-gradient(135deg, oklch(0.65 0.22 320), oklch(0.6 0.2 300))",
  Fitness:
    "linear-gradient(135deg, oklch(0.62 0.22 145), oklch(0.58 0.18 160))",
  Food: "linear-gradient(135deg, oklch(0.68 0.22 50), oklch(0.62 0.2 30))",
  Gaming: "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 270))",
  Beauty: "linear-gradient(135deg, oklch(0.6 0.22 350), oklch(0.6 0.2 330))",
  Travel: "linear-gradient(135deg, oklch(0.6 0.2 200), oklch(0.55 0.18 180))",
  Finance: "linear-gradient(135deg, oklch(0.6 0.18 140), oklch(0.55 0.15 120))",
  Lifestyle: "linear-gradient(135deg, oklch(0.65 0.2 30), oklch(0.6 0.22 15))",
  Education:
    "linear-gradient(135deg, oklch(0.55 0.15 220), oklch(0.5 0.12 200))",
};

function getIndustryGradient(industry: string): string {
  return (
    INDUSTRY_GRADIENTS[industry] ||
    "linear-gradient(135deg, oklch(0.55 0.15 260), oklch(0.5 0.12 240))"
  );
}

function getOfferTier(
  offer: number,
  maxOffer: number,
): { label: string; color: string } {
  const pct = offer / maxOffer;
  if (pct >= 0.85) return { label: "TOP", color: "oklch(0.7 0.2 80)" };
  if (pct >= 0.55) return { label: "HOT", color: "oklch(0.7 0.2 30)" };
  return { label: "GOOD", color: "oklch(0.65 0.15 145)" };
}

function TimerDisplay({ secondsLeft }: { secondsLeft: number }) {
  const pct = secondsLeft / 90;
  const color =
    secondsLeft > 45
      ? "oklch(0.65 0.2 145)"
      : secondsLeft > 20
        ? "oklch(0.72 0.2 70)"
        : "oklch(0.65 0.25 25)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="text-3xl font-black tabular-nums transition-colors duration-500"
        style={{ color }}
      >
        {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
        {String(secondsLeft % 60).padStart(2, "0")}
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: "oklch(0.18 0.02 280)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
      <div className="text-xs" style={{ color: "oklch(0.55 0.05 280)" }}>
        {secondsLeft > 0 ? "Expires in" : "Expired"}
      </div>
    </div>
  );
}

function BrandCard({
  brand,
  maxOffer,
  onAccept,
  accepted,
  disabled,
  index,
}: {
  brand: BrandBid;
  maxOffer: number;
  onAccept: () => void;
  accepted: boolean;
  disabled: boolean;
  index: number;
}) {
  const tier = getOfferTier(brand.offer, maxOffer);
  const gradient = getIndustryGradient(brand.industry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.13 0.016 280 / 0.95)",
        border: accepted
          ? "2px solid oklch(0.65 0.2 145)"
          : "1px solid oklch(0.22 0.025 280 / 0.5)",
      }}
      data-ocid={`sponsor_bidding.brand_card.${index + 1}`}
    >
      {/* Gradient accent bar */}
      <div className="h-1 w-full" style={{ background: gradient }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: gradient }}
            >
              {brand.industry === "Tech"
                ? "💻"
                : brand.industry === "Fashion"
                  ? "👗"
                  : brand.industry === "Fitness"
                    ? "💪"
                    : brand.industry === "Food"
                      ? "🍕"
                      : brand.industry === "Gaming"
                        ? "🎮"
                        : brand.industry === "Beauty"
                          ? "✨"
                          : brand.industry === "Travel"
                            ? "✈️"
                            : brand.industry === "Finance"
                              ? "📈"
                              : brand.industry === "Lifestyle"
                                ? "🌟"
                                : "📚"}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground truncate">
                {brand.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {brand.industry}
              </div>
            </div>
          </div>
          <Badge
            className="text-xs font-black px-2 py-0.5 border-0 flex-shrink-0"
            style={{ background: `${tier.color}28`, color: tier.color }}
          >
            {tier.label}
          </Badge>
        </div>

        {/* Offer amount */}
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{ background: "oklch(0.09 0.015 280)" }}
        >
          <div
            className="text-2xl font-black"
            style={{ color: "oklch(0.75 0.22 80)" }}
          >
            ${brand.offer.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {brand.duration}-day campaign
          </div>
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "oklch(0.10 0.012 280)" }}
          >
            <div className="text-xs text-muted-foreground">Posts required</div>
            <div className="font-semibold text-sm text-foreground">
              {brand.requirements}
            </div>
          </div>
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "oklch(0.10 0.012 280)" }}
          >
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="font-semibold text-sm text-foreground">
              {brand.duration}d
            </div>
          </div>
        </div>

        {/* Bonus */}
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{
            background: "oklch(0.14 0.04 80 / 0.25)",
            border: "1px solid oklch(0.6 0.18 80 / 0.2)",
          }}
        >
          <Zap
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "oklch(0.75 0.2 80)" }}
          />
          <span className="text-xs" style={{ color: "oklch(0.72 0.15 80)" }}>
            {brand.bonus}
          </span>
        </div>

        {/* Action */}
        {accepted ? (
          <div
            className="rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-semibold text-sm"
            style={{
              background: "oklch(0.65 0.2 145 / 0.15)",
              color: "oklch(0.65 0.2 145)",
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Deal Locked In!
          </div>
        ) : (
          <Button
            onClick={onAccept}
            disabled={disabled}
            className="w-full font-bold"
            style={{
              background: disabled ? "oklch(0.2 0.02 280)" : gradient,
              color: disabled ? "oklch(0.4 0.03 280)" : "white",
              border: "none",
            }}
            data-ocid={`sponsor_bidding.accept_button.${index + 1}`}
          >
            Accept Deal
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function HistoryItem({
  item,
  index,
}: {
  item: {
    brands: BrandBid[];
    acceptedBrand: string;
    earnings: number;
    timestamp: number;
  };
  index: number;
}) {
  const timeAgo = (ts: number) => {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl p-3 flex items-center gap-3"
      style={{
        background: "oklch(0.12 0.015 280)",
        border: "1px solid oklch(0.2 0.02 280 / 0.5)",
      }}
      data-ocid={`sponsor_bidding.history_item.${index + 1}`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: getIndustryGradient(
            item.brands.find((b) => b.name === item.acceptedBrand)?.industry ??
              "Tech",
          ),
        }}
      >
        <CheckCircle2 className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">
          {item.acceptedBrand}
        </div>
        <div className="text-xs text-muted-foreground">
          {item.brands.length} brands competed · {timeAgo(item.timestamp)}
        </div>
      </div>
      <div
        className="font-bold text-sm flex-shrink-0"
        style={{ color: "oklch(0.75 0.2 80)" }}
      >
        +${item.earnings.toLocaleString()}
      </div>
    </motion.div>
  );
}

export default function SponsorBidding() {
  const {
    navigate,
    activeBiddingWar,
    biddingWarHistory,
    acceptBiddingDeal,
    profile,
  } = useApp();

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [acceptedIdx, setAcceptedIdx] = useState<number | null>(null);

  // Sync timer with activeBiddingWar.expiresAt
  useEffect(() => {
    if (!activeBiddingWar || activeBiddingWar.status !== "active") {
      setSecondsLeft(0);
      return;
    }
    const update = () => {
      const remaining = Math.max(
        0,
        Math.floor((activeBiddingWar.expiresAt - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [activeBiddingWar]);

  // Auto-expire: select best deal when timer runs out
  const handleAutoExpire = useCallback(() => {
    if (!activeBiddingWar || activeBiddingWar.status !== "active") return;
    const best = activeBiddingWar.brands.reduce((a, b) =>
      a.offer > b.offer ? a : b,
    );
    const bestIdx = activeBiddingWar.brands.indexOf(best);
    acceptBiddingDeal(bestIdx, true);
    toast("⏰ Time's up! We locked in the best offer for you.", {
      description: `${best.name} deal auto-accepted for $${best.offer.toLocaleString()}`,
    });
  }, [activeBiddingWar, acceptBiddingDeal]);

  useEffect(() => {
    if (secondsLeft === 0 && activeBiddingWar?.status === "active") {
      handleAutoExpire();
    }
  }, [secondsLeft, activeBiddingWar, handleAutoExpire]);

  const handleAccept = (idx: number) => {
    if (!activeBiddingWar || activeBiddingWar.status !== "active") return;
    setAcceptedIdx(idx);
    acceptBiddingDeal(idx, false);
    const brand = activeBiddingWar.brands[idx];
    toast(`✅ Deal locked in! ${brand.name} signed you!`, {
      description: `$${brand.offer.toLocaleString()} deal added to Monetization`,
    });
  };

  const isWarActive = activeBiddingWar?.status === "active" && secondsLeft > 0;
  const isWarJustAccepted = activeBiddingWar?.status === "accepted";
  const maxOffer = activeBiddingWar
    ? Math.max(...activeBiddingWar.brands.map((b) => b.offer))
    : 1;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "oklch(0.09 0.018 280)" }}
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
          data-ocid="sponsor_bidding.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Sponsor Bidding Wars
          </h1>
          <p className="text-xs text-muted-foreground">
            Brands competing for your channel
          </p>
        </div>
        <Trophy className="w-5 h-5" style={{ color: "oklch(0.72 0.2 80)" }} />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* BIDDING WAR LIVE banner */}
        <AnimatePresence>
          {isWarActive && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.08 25 / 0.5), oklch(0.18 0.06 350 / 0.4))",
                border: "1px solid oklch(0.55 0.2 25 / 0.35)",
              }}
              data-ocid="sponsor_bidding.live_banner"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: "oklch(0.65 0.25 25)" }}
                />
                <div>
                  <div
                    className="font-black text-sm uppercase tracking-widest"
                    style={{ color: "oklch(0.72 0.22 25)" }}
                  >
                    🔥 BIDDING WAR LIVE
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeBiddingWar?.brands.length} brands competing for @
                    {profile.username.replace("@", "")}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <TimerDisplay secondsLeft={secondsLeft} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accepted state */}
        <AnimatePresence>
          {isWarJustAccepted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl px-5 py-5 text-center space-y-1"
              style={{
                background: "oklch(0.14 0.05 145 / 0.4)",
                border: "1px solid oklch(0.55 0.2 145 / 0.3)",
              }}
              data-ocid="sponsor_bidding.accepted_state"
            >
              <CheckCircle2
                className="w-8 h-8 mx-auto mb-1"
                style={{ color: "oklch(0.65 0.2 145)" }}
              />
              <div
                className="font-black text-base"
                style={{ color: "oklch(0.65 0.2 145)" }}
              >
                Deal Secured! 🎉
              </div>
              <div className="text-sm text-muted-foreground">
                Check Monetization for your active sponsorship
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("monetization")}
                className="mt-2 border-current"
                style={{
                  color: "oklch(0.65 0.2 145)",
                  borderColor: "oklch(0.55 0.2 145 / 0.4)",
                }}
                data-ocid="sponsor_bidding.goto_monetization.button"
              >
                View Sponsorship →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No active war */}
        {!activeBiddingWar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-8 text-center space-y-3"
            style={{
              background: "oklch(0.13 0.016 280 / 0.95)",
              border: "1px solid oklch(0.22 0.025 280 / 0.5)",
            }}
            data-ocid="sponsor_bidding.empty_state"
          >
            <div className="text-4xl">🏆</div>
            <div className="font-bold text-base text-foreground">
              No Active Bidding War
            </div>
            <div className="text-sm text-muted-foreground max-w-xs mx-auto">
              Bidding wars trigger at follower milestones (50K, 100K, 500K, 1M)
              or randomly every 15–25 minutes. Keep growing!
            </div>
            <div
              className="rounded-xl p-3 flex items-center gap-2 text-sm mt-2"
              style={{
                background: "oklch(0.11 0.015 280)",
                border: "1px solid oklch(0.2 0.02 280 / 0.4)",
              }}
            >
              <TrendingUp
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "oklch(0.6 0.18 145)" }}
              />
              <span className="text-muted-foreground">
                Current followers:{" "}
                <span className="text-foreground font-semibold">
                  {profile.followers.toLocaleString()}
                </span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Active brand cards */}
        {isWarActive && activeBiddingWar && (
          <div className="space-y-3">
            <div
              className="text-xs font-semibold uppercase tracking-widest px-1"
              style={{ color: "oklch(0.55 0.08 260)" }}
            >
              Choose Your Deal
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeBiddingWar.brands.map((brand, i) => (
                <BrandCard
                  key={brand.name}
                  brand={brand}
                  maxOffer={maxOffer}
                  onAccept={() => handleAccept(i)}
                  accepted={acceptedIdx === i}
                  disabled={acceptedIdx !== null}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Expired / accepted: show all offers for context */}
        {(isWarJustAccepted || activeBiddingWar?.status === "expired") &&
          activeBiddingWar && (
            <div className="space-y-3">
              <div
                className="text-xs font-semibold uppercase tracking-widest px-1"
                style={{ color: "oklch(0.55 0.08 260)" }}
              >
                Competing Offers
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeBiddingWar.brands.map((brand, i) => (
                  <BrandCard
                    key={brand.name}
                    brand={brand}
                    maxOffer={maxOffer}
                    onAccept={() => {}}
                    accepted={acceptedIdx === i}
                    disabled
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Expired state notice */}
        {activeBiddingWar?.status === "expired" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl px-4 py-3 flex items-center gap-2.5"
            style={{
              background: "oklch(0.14 0.04 50 / 0.3)",
              border: "1px solid oklch(0.55 0.18 50 / 0.25)",
            }}
          >
            <AlertCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "oklch(0.7 0.2 50)" }}
            />
            <span className="text-xs" style={{ color: "oklch(0.7 0.18 50)" }}>
              The best offer was auto-selected. You just missed negotiating!
              Stay ready next time.
            </span>
          </motion.div>
        )}

        {/* Bidding War History */}
        {biddingWarHistory.length > 0 && (
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-1"
              style={{ color: "oklch(0.55 0.08 260)" }}
            >
              <Clock className="w-3.5 h-3.5" />
              Bidding War History
            </div>
            <div className="space-y-2" data-ocid="sponsor_bidding.history.list">
              {biddingWarHistory.map((item, i) => (
                <HistoryItem key={item.timestamp} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors ml-1"
          >
            Built with ❤ using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
