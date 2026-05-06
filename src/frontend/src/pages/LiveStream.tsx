import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, Radio, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const LIVE_COMMENTS = [
  "🔥 this is fire!",
  "omg youre live!",
  "❤️ love your content",
  "first!!",
  "lets gooo 🚀",
  "YOOO this is crazy",
  "I always watch you 💯",
  "stream more please!",
  "you're so good at this",
  "🎉🎉🎉",
  "W streamer fr",
  "pls pin me 🙏",
  "been waiting for this",
  "new subscriber here!",
  "💎💎💎",
  "the goat is live",
  "bro this slaps",
  "notifications on for you always",
  "👀👀👀",
  "no way youre live rn",
];

const AI_NAMES = [
  "nova_watches",
  "xtra_bytes",
  "pixelstorm99",
  "lunavibes",
  "driftking_",
  "solarflare07",
  "techwave22",
  "memeorbit",
  "coastlinekai",
  "glitchpulse",
  "voidcat",
  "zenflow_",
  "hyperdash9",
  "neonrain",
  "staticjunky",
];

interface LiveComment {
  id: string;
  username: string;
  text: string;
}

interface StreamSummary {
  peakViewers: number;
  totalDonations: number;
  followersGained: number;
}

export default function LiveStream() {
  const { profile, setProfile, creatorCoins, setCreatorCoins, navigate } =
    useApp();
  const [isLive, setIsLive] = useState(false);

  const [viewers, setViewers] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [summary, setSummary] = useState<StreamSummary | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const peakViewersRef = useRef(0);
  const totalDonationsRef = useRef(0);

  const baseViewers = Math.max(10, Math.floor(profile.followers * 0.03));

  useEffect(() => {
    if (!isLive) return;
    // Timer
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  useEffect(() => {
    if (!isLive) return;
    // Viewer growth
    const viewerInterval = setInterval(() => {
      setViewers((v) => {
        let next: number;
        if (elapsed < 60) {
          next = Math.min(
            v + Math.floor(Math.random() * 15 + 5),
            baseViewers * 2,
          );
        } else if (elapsed < 90) {
          next = Math.floor(v * (2.5 + Math.random() * 0.5)); // spike
        } else {
          next = Math.max(
            baseViewers,
            Math.floor(v * (0.97 + Math.random() * 0.02)),
          );
        }
        if (next > peakViewersRef.current) {
          peakViewersRef.current = next;
          setPeakViewers(next);
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(viewerInterval);
  }, [isLive, elapsed, baseViewers]);

  useEffect(() => {
    if (!isLive) return;
    // AI comments
    const commentInterval = setInterval(
      () => {
        const username = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
        const text =
          LIVE_COMMENTS[Math.floor(Math.random() * LIVE_COMMENTS.length)];
        setComments((c) => [
          ...c.slice(-49),
          { id: `${Date.now()}-${Math.random()}`, username, text },
        ]);
      },
      Math.random() * 2000 + 1000,
    );
    return () => clearInterval(commentInterval);
  }, [isLive]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref scroll, comments dep intentional
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    if (!isLive) return;
    // Coin donations
    const donationInterval = setInterval(
      () => {
        const amount = Math.floor(Math.random() * 451 + 50);
        const donor = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
        totalDonationsRef.current += amount;
        setTotalDonations((d) => d + amount);
        setCreatorCoins((c) => c + amount);
        toast.success(`💰 ${donor} donated ${amount} coins!`, {
          duration: 3000,
        });
        setComments((c) => [
          ...c.slice(-49),
          {
            id: `donation-${Date.now()}`,
            username: donor,
            text: `💰 donated ${amount} coins!`,
          },
        ]);
      },
      Math.random() * 5000 + 15000,
    );
    return () => clearInterval(donationInterval);
  }, [isLive, setCreatorCoins]);

  const startStream = () => {
    setIsLive(true);

    setViewers(baseViewers);
    peakViewersRef.current = baseViewers;
    setPeakViewers(baseViewers);
    setElapsed(0);
    setComments([
      {
        id: "start",
        username: "MindForge",
        text: "🔴 Stream started! Welcome everyone!",
      },
    ]);
  };

  const endStream = () => {
    setIsLive(false);
    const followersGained = Math.floor(
      peakViewersRef.current * (0.01 + Math.random() * 0.02),
    );
    setProfile((p) => ({ ...p, followers: p.followers + followersGained }));
    setSummary({
      peakViewers: peakViewersRef.current,
      totalDonations: totalDonationsRef.current,
      followersGained,
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (summary) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "oklch(0.08 0.015 280)" }}
        data-ocid="livestream.summary.panel"
      >
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{
            background: "oklch(0.13 0.02 280)",
            border: "1px solid oklch(0.25 0.04 280 / 0.6)",
            boxShadow: "0 0 60px oklch(0.6 0.25 10 / 0.15)",
          }}
        >
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-1">Stream Ended!</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Here's how it went
          </p>

          <div className="space-y-4 mb-8">
            <div
              className="rounded-2xl p-4"
              style={{ background: "oklch(0.17 0.025 280)" }}
            >
              <div className="text-3xl font-bold text-white">
                {summary.peakViewers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Peak Viewers
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-4"
                style={{ background: "oklch(0.17 0.025 280)" }}
              >
                <div
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.78 0.18 80)" }}
                >
                  +{summary.totalDonations}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Coins Earned
                </div>
              </div>
              <div
                className="rounded-2xl p-4"
                style={{ background: "oklch(0.17 0.025 280)" }}
              >
                <div
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.65 0.2 145)" }}
                >
                  +{summary.followersGained.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  New Followers
                </div>
              </div>
            </div>
          </div>

          <Button
            data-ocid="livestream.summary.close_button"
            className="w-full btn-gradient text-white border-none"
            onClick={() => navigate("home")}
          >
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.06 0.015 280)" }}
      data-ocid="livestream.page"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          background: "oklch(0.06 0.015 280 / 0.95)",
          borderBottom: "1px solid oklch(0.2 0.02 280 / 0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          data-ocid="livestream.back.button"
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          {isLive && (
            <>
              <span
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: "oklch(0.55 0.25 25)",
                  color: "white",
                  animation: "pulse 1.5s infinite",
                }}
              >
                <Radio className="w-3 h-3" />
                LIVE
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {formatTime(elapsed)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Coins className="w-4 h-4" style={{ color: "oklch(0.78 0.18 80)" }} />
          <span style={{ color: "oklch(0.78 0.18 80)" }}>
            {creatorCoins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Camera area */}
      <div
        className="relative flex-1 flex flex-col"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="relative flex-1 flex items-center justify-center"
          style={{
            background: isLive
              ? "linear-gradient(160deg, oklch(0.1 0.03 280), oklch(0.08 0.04 10))"
              : "oklch(0.1 0.015 280)",
            boxShadow: isLive
              ? "inset 0 0 100px oklch(0.55 0.25 25 / 0.15)"
              : "none",
            minHeight: "260px",
          }}
        >
          {isLive ? (
            <div className="text-center">
              <div
                className="text-8xl mb-6"
                style={{
                  filter: "drop-shadow(0 0 20px oklch(0.55 0.25 25 / 0.6))",
                }}
              >
                {profile.avatar.startsWith("http") ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full mx-auto"
                  />
                ) : (
                  <span>{profile.avatar}</span>
                )}
              </div>
              <div className="text-white font-bold text-lg">{profile.name}</div>
              <div className="text-muted-foreground text-sm">
                @{profile.username}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-muted-foreground text-sm">Ready to go live?</p>
            </div>
          )}

          {/* Viewers badge */}
          {isLive && (
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: "oklch(0.08 0.02 280 / 0.8)",
                border: "1px solid oklch(0.3 0.04 280 / 0.5)",
                color: "white",
                backdropFilter: "blur(8px)",
              }}
            >
              <Users
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.65 0.2 145)" }}
              />
              {viewers.toLocaleString()}
            </div>
          )}

          {/* Glow ring when live */}
          {isLive && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: "inset 0 0 2px 2px oklch(0.55 0.25 25 / 0.3)",
                borderRadius: "inherit",
              }}
            />
          )}
        </div>

        {/* Chat */}
        {isLive && (
          <div
            className="h-52 overflow-y-auto px-4 py-3 space-y-1.5"
            style={{ background: "oklch(0.09 0.015 280 / 0.95)" }}
            data-ocid="livestream.chat.panel"
          >
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <span
                  className="font-semibold shrink-0"
                  style={{ color: "oklch(0.72 0.2 295)" }}
                >
                  {c.username}
                </span>
                <span className="text-white/80">{c.text}</span>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className="p-4 space-y-3"
        style={{
          background: "oklch(0.1 0.02 280)",
          borderTop: "1px solid oklch(0.2 0.02 280 / 0.5)",
        }}
      >
        {isLive ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Peak: {peakViewers.toLocaleString()} viewers
              </span>
              <span style={{ color: "oklch(0.78 0.18 80)" }}>
                +{totalDonations} coins donated
              </span>
            </div>
            <Button
              data-ocid="livestream.end.button"
              variant="outline"
              className="w-full"
              style={{
                borderColor: "oklch(0.55 0.25 25 / 0.5)",
                color: "oklch(0.72 0.22 25)",
              }}
              onClick={endStream}
            >
              End Stream
            </Button>
          </>
        ) : (
          <Button
            data-ocid="livestream.go_live.button"
            className="w-full h-14 text-lg font-bold text-white border-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.28 25), oklch(0.5 0.25 10))",
              boxShadow: "0 4px 24px oklch(0.55 0.28 25 / 0.4)",
            }}
            onClick={startStream}
          >
            🔴 Go Live
          </Button>
        )}
      </div>
    </div>
  );
}
