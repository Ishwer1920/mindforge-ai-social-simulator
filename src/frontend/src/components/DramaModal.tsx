import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { DramaEvent } from "../hooks/useDramaEngine";

interface Props {
  event: DramaEvent | null;
  onClose: () => void;
}

type DramaOutcome = "respond" | "ignore" | "escalate";

function getOutcome(
  choice: DramaOutcome,
  creatorName: string,
): {
  text: string;
  followersChange: number;
  reputationChange: number;
  viralChance: boolean;
} {
  const rand = Math.random();
  if (choice === "respond") {
    const won = rand > 0.45;
    return {
      text: won
        ? `You clapped back perfectly! The community rallied behind you. ${creatorName} went quiet 🏆`
        : `${creatorName} hit back harder and the drama got messy. Some fans unfollowed to avoid the negativity 😬`,
      followersChange: won
        ? Math.floor(500 + Math.random() * 2500)
        : -Math.floor(200 + Math.random() * 800),
      reputationChange: won ? 5 : -8,
      viralChance: won && rand > 0.7,
    };
  }
  if (choice === "ignore") {
    return {
      text: `You took the high road and stayed silent. Most fans respected the maturity, but a few followed ${creatorName} out of curiosity.`,
      followersChange: -Math.floor(50 + Math.random() * 200),
      reputationChange: -3,
      viralChance: false,
    };
  }
  // escalate
  const blownUp = rand > 0.5;
  const tanked = rand < 0.25;
  return {
    text: blownUp
      ? "You went ALL IN. The post went viral, the drama exploded in your favor! +massive reach 🔥🔥🔥"
      : tanked
        ? "The escalation backfired badly. Your trust score took a huge hit and followers are dropping 💀"
        : `The drama spread but didn't land. Mixed reactions — some gains, some losses.`,
    followersChange: blownUp
      ? Math.floor(3000 + Math.random() * 12000)
      : tanked
        ? -Math.floor(1000 + Math.random() * 4000)
        : Math.floor(-200 + Math.random() * 400),
    reputationChange: blownUp ? 10 : tanked ? -20 : -5,
    viralChance: blownUp && rand > 0.6,
  };
}

export default function DramaModal({ event, onClose }: Props) {
  const { setProfile, addNotification, setDramaCount } = useApp();
  const [resolved, setResolved] = useState<{
    text: string;
    followersChange: number;
  } | null>(null);

  const handleChoice = (choice: DramaOutcome) => {
    if (!event) return;
    const outcome = getOutcome(choice, event.creatorName);
    setProfile((prev) => ({
      ...prev,
      followers: Math.max(0, prev.followers + outcome.followersChange),
    }));
    setDramaCount((c) => c + 1);

    if (outcome.viralChance) {
      addNotification({
        icon: "🔥",
        message: "The drama made your post go VIRAL! Algorithm is pushing you!",
        type: "viral",
      });
    }

    if (outcome.followersChange > 0) {
      toast.success(
        `Drama resolved! +${outcome.followersChange.toLocaleString()} followers`,
      );
    } else if (outcome.followersChange < 0) {
      toast.error(
        `Drama hit you hard! ${outcome.followersChange.toLocaleString()} followers`,
      );
    }

    setResolved({
      text: outcome.text,
      followersChange: outcome.followersChange,
    });
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          style={{
            background: "oklch(0.08 0.02 280 / 0.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && resolved) onClose();
          }}
        >
          <motion.div
            initial={{ y: 80, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 80, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.14 0.03 280)",
              border: "1px solid oklch(0.65 0.25 25 / 0.5)",
              boxShadow:
                "0 0 60px oklch(0.6 0.25 25 / 0.25), 0 24px 60px oklch(0.04 0.01 280 / 0.8)",
            }}
          >
            {/* Header gradient */}
            <div
              className="px-4 pt-4 pb-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.28 0.1 25 / 0.6), oklch(0.22 0.06 350 / 0.4))",
                borderBottom: "1px solid oklch(0.65 0.25 25 / 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-base font-black tracking-wider"
                  style={{ color: "oklch(0.75 0.28 25)" }}
                >
                  🎭 CREATOR DRAMA
                </span>
              </div>
              <p className="text-xs" style={{ color: "oklch(0.72 0.18 25)" }}>
                You have a situation on your hands...
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Creator info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={event.creatorAvatar}
                      alt={event.creatorName}
                    />
                    <AvatarFallback>{event.creatorName[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className="absolute -top-1 -right-1 text-sm"
                    style={{ filter: "drop-shadow(0 1px 3px black)" }}
                  >
                    😤
                  </span>
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "oklch(0.92 0.02 260)" }}
                  >
                    {event.creatorName}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.04 280)" }}
                  >
                    Drama incoming
                  </p>
                </div>
              </div>

              {/* Drama message */}
              <div
                className="rounded-xl p-3 text-sm leading-relaxed"
                style={{
                  background: "oklch(0.18 0.04 25 / 0.4)",
                  border: "1px solid oklch(0.5 0.2 25 / 0.25)",
                  color: "oklch(0.88 0.02 260)",
                }}
              >
                {event.message}
              </div>

              {/* Outcome display or action buttons */}
              {resolved ? (
                <div className="space-y-3">
                  <div
                    className="rounded-xl p-3 text-sm leading-relaxed"
                    style={{
                      background:
                        resolved.followersChange >= 0
                          ? "oklch(0.18 0.06 145 / 0.4)"
                          : "oklch(0.18 0.06 25 / 0.4)",
                      border:
                        resolved.followersChange >= 0
                          ? "1px solid oklch(0.55 0.22 145 / 0.4)"
                          : "1px solid oklch(0.55 0.22 25 / 0.4)",
                      color: "oklch(0.88 0.02 260)",
                    }}
                  >
                    {resolved.text}
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold px-1">
                    <span style={{ color: "oklch(0.65 0.04 280)" }}>
                      Follower change:
                    </span>
                    <span
                      style={{
                        color:
                          resolved.followersChange >= 0
                            ? "oklch(0.72 0.22 145)"
                            : "oklch(0.72 0.22 25)",
                      }}
                    >
                      {resolved.followersChange >= 0 ? "+" : ""}
                      {resolved.followersChange.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    data-ocid="drama.close_button"
                    className="w-full text-white font-bold border-none"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.45 0.18 280), oklch(0.4 0.15 260))",
                    }}
                    onClick={onClose}
                  >
                    Got it 💪
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    data-ocid="drama.respond.button"
                    className="w-full text-white border-none text-sm font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.22 25), oklch(0.45 0.2 10))",
                      boxShadow: "0 2px 12px oklch(0.5 0.22 25 / 0.35)",
                    }}
                    onClick={() => handleChoice("respond")}
                  >
                    ⚔️ Respond — Fight back (risk: medium)
                  </Button>
                  <Button
                    data-ocid="drama.ignore.button"
                    variant="outline"
                    className="w-full text-sm"
                    style={{
                      borderColor: "oklch(0.35 0.03 280 / 0.6)",
                      background: "oklch(0.18 0.02 280 / 0.5)",
                      color: "oklch(0.72 0.04 280)",
                    }}
                    onClick={() => handleChoice("ignore")}
                  >
                    🤫 Ignore — Stay unbothered (risk: low)
                  </Button>
                  <Button
                    data-ocid="drama.escalate.button"
                    className="w-full text-sm font-bold text-white border-none"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.48 0.22 295), oklch(0.42 0.2 320))",
                      boxShadow: "0 2px 12px oklch(0.48 0.22 295 / 0.4)",
                    }}
                    onClick={() => handleChoice("escalate")}
                  >
                    🔥 Escalate — Go nuclear (risk: extreme)
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
