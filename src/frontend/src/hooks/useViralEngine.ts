import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  ALGORITHM_UPDATE_EVENTS,
  computeViralScore,
  getMomentumSignal,
  getViralStage,
} from "../utils/viralEngine";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useViralEngine() {
  const { setPosts, profile, addNotification } = useApp();
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    // Stage progression: every 8-15s, re-compute viralScore and advance stages
    let stageTimerId: ReturnType<typeof setTimeout>;
    function scheduleStageCheck() {
      const delay = randomBetween(8000, 15000);
      stageTimerId = setTimeout(() => {
        setPosts((prev) =>
          prev.map((p) => {
            const newScore = computeViralScore(p);
            const newStage = getViralStage(newScore);
            const oldStage = p.viralStage ?? 0;
            let updated = { ...p, viralScore: newScore, viralStage: newStage };
            // Mark trending if stage 3+
            if (newStage >= 3) updated = { ...updated, isTrending: true };
            // Fire notification if user's post advanced
            if (
              p.authorUsername === profileRef.current.username &&
              newStage > oldStage &&
              newStage > 0
            ) {
              const signal = getMomentumSignal(newStage);
              if (signal) {
                addNotification({
                  icon: newStage >= 3 ? "🔥" : "📈",
                  message: `Your post "${p.caption.slice(0, 35)}..." is ${signal.toLowerCase()}!`,
                  type: "viral",
                });
              }
            }
            return updated;
          }),
        );
        scheduleStageCheck();
      }, delay);
    }
    scheduleStageCheck();

    // Algorithm update: every 3-5 minutes
    let algoTimerId: ReturnType<typeof setTimeout>;
    function scheduleAlgoUpdate() {
      const delay = randomBetween(180000, 300000);
      algoTimerId = setTimeout(() => {
        const event =
          ALGORITHM_UPDATE_EVENTS[
            Math.floor(Math.random() * ALGORITHM_UPDATE_EVENTS.length)
          ];
        event.apply();
        addNotification({
          icon: "⚙️",
          message: event.message,
          type: "viral",
        });
        scheduleAlgoUpdate();
      }, delay);
    }
    scheduleAlgoUpdate();

    return () => {
      clearTimeout(stageTimerId);
      clearTimeout(algoTimerId);
    };
  }, [setPosts, addNotification]);
}
