import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, Mail, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const MAIL_TYPES = ["praise", "question", "collab", "fanart"] as const;
type MailType = (typeof MAIL_TYPES)[number];

interface FanMail {
  id: string;
  from: string;
  avatar: string;
  type: MailType;
  message: string;
  timestamp: number;
  replied: boolean;
}

const MAIL_TEMPLATES: Record<MailType, string[]> = {
  praise: [
    "Your content literally saved my day, thank you so much!",
    "I've been watching you for months — you're my biggest inspiration!",
    "Your last post was EVERYTHING. I shared it with all my friends.",
    "You make content creation look effortless. Never stop! 💫",
  ],
  question: [
    "What editing app do you use for your posts? The quality is insane!",
    "How long have you been creating? I want to start too!",
    "What's your posting schedule? How do you stay consistent?",
    "Do you have any tips for growing from 0 to 1K followers?",
  ],
  collab: [
    "Hey! I'm a small creator in your niche — would love to collab sometime 🙏",
    "I run a fan page dedicated to your content. Could we do a shoutout exchange?",
    "I think our audiences would love a joint video — interested in partnering?",
    "My followers ask about you all the time — can we do a crossover?",
  ],
  fanart: [
    "I drew a portrait of your profile pic!! It took me 3 hours. Sending love ❤️",
    "Made a digital painting inspired by your last post — it's my best work yet!",
    "I designed a merch concept for your brand. Would love your thoughts!",
    "Created fan art for your channel — please feature it if you like it!",
  ],
};

const TYPE_ICONS: Record<MailType, string> = {
  praise: "💌",
  question: "❓",
  collab: "🤝",
  fanart: "🎨",
};
const TYPE_LABELS: Record<MailType, string> = {
  praise: "Fan Love",
  question: "Question",
  collab: "Collab Request",
  fanart: "Fan Art",
};

function generateMails(seed: number, count: number): FanMail[] {
  const names = [
    "nova_fan99",
    "creative_alex",
    "vibes_only_",
    "digital_dreamer",
    "cosmic_watcher",
    "pixel_maya",
    "stargazer88",
    "neon_rebel",
    "lunar_haze",
    "echo_rider",
  ];
  return Array.from({ length: count }, (_, i) => {
    const type = MAIL_TYPES[(seed + i) % MAIL_TYPES.length];
    const templates = MAIL_TEMPLATES[type];
    return {
      id: `fm-${seed}-${i}`,
      from: `@${names[(seed + i) % names.length]}`,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed + i}`,
      type,
      message: templates[(seed + i * 3) % templates.length],
      timestamp:
        Date.now() - (i * 3600000 + Math.floor(Math.random() * 3600000)),
      replied: false,
    };
  });
}

const LS_MAIL_KEY = "mindforge-fan-mail";
const LS_REPLY_KEY = "mindforge-fan-mail-replies";
const REFRESH_MS = 30 * 60 * 1000;
const MAX_DAILY_REPLIES = 10;

export default function FanMailCenter() {
  const { navigate, setCreatorCoins, addNotification } = useApp();

  const [mails, setMails] = useState<FanMail[]>(() => {
    try {
      const raw = localStorage.getItem(LS_MAIL_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Date.now() - d.ts < REFRESH_MS) return d.mails;
      }
    } catch (_) {}
    const m = generateMails(Math.floor(Date.now() / 1000), 8);
    localStorage.setItem(
      LS_MAIL_KEY,
      JSON.stringify({ ts: Date.now(), mails: m }),
    );
    return m;
  });

  const [replyData, setReplyData] = useState<{ count: number; date: string }>(
    () => {
      try {
        const raw = localStorage.getItem(LS_REPLY_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          const today = new Date().toISOString().slice(0, 10);
          if (d.date === today) return d;
          return { count: 0, date: today };
        }
      } catch (_) {}
      return { count: 0, date: new Date().toISOString().slice(0, 10) };
    },
  );

  function handleReply(mailId: string) {
    if (replyData.count >= MAX_DAILY_REPLIES) {
      toast.error(
        "Daily reply limit reached! Come back tomorrow for more coins.",
      );
      return;
    }
    setMails((prev) =>
      prev.map((m) => (m.id === mailId ? { ...m, replied: true } : m)),
    );
    const newCount = replyData.count + 1;
    const today = new Date().toISOString().slice(0, 10);
    const newReplyData = { count: newCount, date: today };
    setReplyData(newReplyData);
    localStorage.setItem(LS_REPLY_KEY, JSON.stringify(newReplyData));
    setCreatorCoins((c) => c + 50);
    addNotification({
      icon: "💌",
      message: `You replied to a fan! +50 coins earned. (${newCount}/${MAX_DAILY_REPLIES} today)`,
      type: "tip",
    });
    toast.success(
      `💌 Fan replied! +50 coins (${newCount}/${MAX_DAILY_REPLIES} replies today)`,
    );
  }

  const totalReplied = mails.filter((m) => m.replied).length;
  const coinsFromMail = totalReplied * 50;

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
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
          data-ocid="fan-mail.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Fan Mail Center</h1>
          <p className="text-xs text-muted-foreground">
            Reply to earn +50 coins each (max 10/day)
          </p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Mail className="w-4 h-4" />,
              label: "Total Mail",
              value: mails.length,
              color: "oklch(0.72 0.2 260)",
            },
            {
              icon: <MessageSquare className="w-4 h-4" />,
              label: "Replied",
              value: `${totalReplied}/${MAX_DAILY_REPLIES}`,
              color: "oklch(0.72 0.2 145)",
            },
            {
              icon: <Coins className="w-4 h-4" />,
              label: "Coins Earned",
              value: coinsFromMail,
              color: "oklch(0.78 0.18 80)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 text-center"
              style={{
                background: "oklch(0.13 0.016 280 / 0.95)",
                border: "1px solid oklch(0.22 0.025 280 / 0.5)",
              }}
            >
              <div
                style={{ color: s.color }}
                className="flex justify-center mb-1"
              >
                {s.icon}
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mail List */}
        <div className="space-y-3">
          {mails.map((mail, idx) => (
            <div
              key={mail.id}
              data-ocid={`fan-mail.item.${idx + 1}`}
              className="rounded-2xl p-4"
              style={{
                background: mail.replied
                  ? "oklch(0.14 0.03 145 / 0.4)"
                  : "oklch(0.13 0.016 280 / 0.95)",
                border: `1px solid ${mail.replied ? "oklch(0.45 0.15 145 / 0.35)" : "oklch(0.22 0.025 280 / 0.5)"}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={mail.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {mail.from}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background: "oklch(0.55 0.22 295 / 0.2)",
                        color: "oklch(0.72 0.22 295)",
                      }}
                    >
                      {TYPE_ICONS[mail.type]} {TYPE_LABELS[mail.type]}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {timeAgo(mail.timestamp)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-3">
                {mail.message}
              </p>
              <Button
                size="sm"
                onClick={() => handleReply(mail.id)}
                disabled={mail.replied || replyData.count >= MAX_DAILY_REPLIES}
                className="w-full h-8 text-xs gap-1"
                style={
                  mail.replied
                    ? {
                        background: "oklch(0.28 0.05 145)",
                        color: "oklch(0.72 0.22 145)",
                      }
                    : {
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.5 0.28 300))",
                        color: "white",
                      }
                }
                data-ocid={`fan-mail.reply.button.${idx + 1}`}
              >
                {mail.replied
                  ? "✓ Replied · +50 coins earned"
                  : "💌 Reply · +50 coins"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
