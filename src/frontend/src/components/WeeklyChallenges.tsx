import { Progress } from "@/components/ui/progress";
import { useApp } from "../context/AppContext";

export default function WeeklyChallenges() {
  const { weeklyChallenges, claimChallengeReward } = useApp();

  return (
    <div
      className="px-2 py-3"
      style={{
        borderTop: "1px solid oklch(0.25 0.025 280 / 0.4)",
      }}
    >
      <p className="text-xs font-semibold text-muted-foreground mb-2 px-1 uppercase tracking-wide">
        Weekly Challenges
      </p>
      <div className="space-y-2">
        {weeklyChallenges.map((ch, i) => {
          const pct = Math.min(100, (ch.current / ch.target) * 100);
          return (
            <div
              key={ch.id}
              data-ocid={`challenges.item.${i + 1}`}
              className="px-2 py-2 rounded-xl"
              style={{
                background: ch.completed
                  ? "oklch(0.55 0.2 145 / 0.08)"
                  : "oklch(0.18 0.02 280 / 0.4)",
                border: ch.completed
                  ? "1px solid oklch(0.55 0.2 145 / 0.25)"
                  : "1px solid oklch(0.28 0.025 280 / 0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p
                  className="text-xs font-medium truncate flex-1 mr-1"
                  style={{
                    color: ch.completed
                      ? "oklch(0.75 0.18 145)"
                      : "oklch(0.88 0.01 270)",
                  }}
                >
                  {ch.completed && !ch.rewardClaimed
                    ? "✨ "
                    : ch.completed
                      ? "✅ "
                      : ""}
                  {ch.title}
                </p>
                {ch.completed && !ch.rewardClaimed && (
                  <button
                    type="button"
                    data-ocid={`challenges.claim.button.${i + 1}`}
                    onClick={() => claimChallengeReward(ch.id)}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap"
                    style={{
                      background: "oklch(0.55 0.2 145 / 0.25)",
                      color: "oklch(0.75 0.18 145)",
                      border: "1px solid oklch(0.55 0.2 145 / 0.4)",
                    }}
                  >
                    Claim
                  </button>
                )}
                {ch.rewardClaimed && (
                  <span
                    className="text-[10px]"
                    style={{ color: "oklch(0.55 0.02 270)" }}
                  >
                    Claimed
                  </span>
                )}
              </div>
              <Progress
                value={pct}
                className="h-1"
                style={{
                  background: "oklch(0.22 0.02 280)",
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground truncate">
                  {ch.description}
                </span>
                <span
                  className="text-[10px] font-medium ml-1 whitespace-nowrap"
                  style={{ color: "oklch(0.65 0.15 295)" }}
                >
                  {ch.current >= ch.target
                    ? "Done!"
                    : `${ch.current.toLocaleString()} / ${ch.target.toLocaleString()}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
