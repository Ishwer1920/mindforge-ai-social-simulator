import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Conversation } from "../context/AppContext";

type FilterTab = "all" | "ai_creator" | "brand" | "fan" | "system";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const REPLY_POOLS: Record<string, string[]> = {
  fitness: [
    "That sounds awesome! A workout collab would definitely hit different 🔥",
    "Let's do it! Fitness content is popping off right now 💪",
    "Yes! Let's smash this collab — my audience will love it!",
    "Absolutely, fitness collabs always go viral. Let's plan it!",
    "Love the energy! A joint workout challenge would crush it 🏋️",
  ],
  tech: [
    "Sick idea, let's build something that goes viral in the tech space 📱",
    "Love it — tech audiences are hungry for collabs rn",
    "Let's do a deep-dive together, my followers would love your take!",
    "That's a great angle. Tech collabs hit different when the content is fire 🔧",
    "Totally down. Let's sync and make something the algorithm loves 🤖",
  ],
  comedy: [
    "lmaooo yes let's do it, the people need this 😂",
    "OK but only if we make something actually funny 💀",
    "bro YES. This collab is going to break the internet 🤣",
    "I'm already thinking of bits we could do together 😭",
    "lol let's cook something up that goes absolutely viral 🔥",
  ],
  photography: [
    "Your shots are incredible! I'd love to do a collab shoot ✨",
    "We should do a dual-perspective series together!",
    "A photo collab would be stunning — your style is amazing 📸",
    "Yes! Let's find a location and create something beautiful!",
    "Our aesthetics complement each other perfectly, let's do it!",
  ],
  motivation: [
    "You're going to achieve incredible things! Let's inspire together 💫",
    "A motivation collab would be so powerful for both our audiences!",
    "Keep pushing! I'd love to create something inspiring with you 🌟",
    "Your journey is incredible. Together we can motivate millions!",
    "Collaboration is how we multiply impact. I'm in! 💪",
  ],
  brand: [
    "Thanks for reaching out! We'd love to discuss a partnership. Our team will follow up shortly.",
    "Great timing — we're looking for creators in your niche. Let's talk numbers.",
    "We've been following your content! Our budget is flexible. When can we connect?",
    "We think you'd be a perfect fit for our upcoming campaign. Interested?",
    "Your engagement rates are impressive. Let's set up a call this week!",
  ],
  fan: [
    "omg you replied!! I love your content 😭",
    "yesss this made my day, keep posting pls!!",
    "your last post was everything 🔥",
    "I've been watching you since day 1 and you inspire me so much!!",
    "please never stop creating, you're literally my favorite creator 💜",
  ],
  system: [
    "Your account is in good standing. Keep creating!",
    "New platform features are available. Check Creator Studio.",
    "Your content quality score has improved this week!",
    "Reminder: The weekly challenge ends in 2 days. Check your progress!",
    "You have new analytics insights available in your dashboard.",
  ],
  default: [
    "Thanks for your message! Let's connect soon.",
    "Sounds great, let me think about that 🤔",
    "Appreciate you reaching out! Chat soon.",
    "Good to hear from you!",
    "Love the idea, will get back to you soon!",
  ],
};

function getReplyPool(convo: Conversation): string[] {
  if (convo.type === "brand") return REPLY_POOLS.brand;
  if (convo.type === "fan") return REPLY_POOLS.fan;
  if (convo.type === "system") return REPLY_POOLS.system;
  if (convo.niche && REPLY_POOLS[convo.niche]) return REPLY_POOLS[convo.niche];
  return REPLY_POOLS.default;
}

function randomReply(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

const TYPE_LABELS: Record<FilterTab, string> = {
  all: "All",
  ai_creator: "Creators",
  brand: "Brands",
  fan: "Fans",
  system: "System",
};

const TYPE_COLORS: Record<Conversation["type"], string> = {
  ai_creator: "oklch(0.6 0.22 295)",
  brand: "oklch(0.72 0.2 50)",
  fan: "oklch(0.72 0.18 145)",
  system: "oklch(0.65 0.12 270)",
};

export default function Messages() {
  const { conversations, setConversations, setUnreadDMs, setHideMobileNav } =
    useApp();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"inbox" | "chat">("inbox");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [inputText, setInputText] = useState("");
  const [typingConvoId, setTypingConvoId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find((c) => c.id === activeConvoId) ?? null;

  useEffect(() => {
    setUnreadDMs(0);
  }, [setUnreadDMs]);

  useEffect(() => {
    setHideMobileNav(mobileView === "chat");
    return () => setHideMobileNav(false);
  }, [mobileView, setHideMobileNav]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    const id = setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(id);
  }, [activeConvoId, activeConvo?.messages.length]);

  const handleSelectConvo = (convo: Conversation) => {
    // Clear unread for selected convo
    setConversations((prev) =>
      prev.map((c) => (c.id === convo.id ? { ...c, unread: 0 } : c)),
    );
    setActiveConvoId(convo.id);
    setMobileView("chat");
  };

  const handleBackToInbox = () => {
    setMobileView("inbox");
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeConvo) return;
    const msgText = inputText.trim();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvo.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m-${Date.now()}`,
                  text: msgText,
                  sent: true,
                  timestamp: Date.now(),
                },
              ],
            }
          : c,
      ),
    );
    setInputText("");

    // Simulate typing + AI reply
    const replyDelay = 1500 + Math.random() * 1500;
    const typingDelay = replyDelay - 600;
    setTimeout(() => setTypingConvoId(activeConvo.id), typingDelay);
    setTimeout(() => {
      setTypingConvoId(null);
      const pool = getReplyPool(activeConvo);
      const reply = randomReply(pool);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvo.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `m-reply-${Date.now()}`,
                    text: reply,
                    sent: false,
                    timestamp: Date.now(),
                  },
                ],
              }
            : c,
        ),
      );
    }, replyDelay + 600);
  };

  const filteredConvos = conversations.filter(
    (c) => filter === "all" || c.type === filter,
  );

  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unread ?? 0),
    0,
  );

  const InboxPanel = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-4 border-b flex-shrink-0"
        style={{ borderColor: "oklch(0.25 0.025 280 / 0.3)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Messages</h2>
          {totalUnread > 0 && (
            <Badge
              className="text-xs h-5 px-1.5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.55 0.25 310))",
                color: "white",
                border: "none",
              }}
            >
              {totalUnread}
            </Badge>
          )}
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {(["all", "ai_creator", "brand", "fan", "system"] as FilterTab[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                data-ocid={"messages.filter.tab"}
                onClick={() => setFilter(tab)}
                className="text-xs px-2.5 py-1 rounded-full transition-all font-medium"
                style={{
                  background:
                    filter === tab
                      ? "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.55 0.25 310))"
                      : "oklch(0.2 0.02 280 / 0.6)",
                  color: filter === tab ? "white" : "oklch(0.6 0.04 280)",
                  border:
                    filter === tab
                      ? "none"
                      : "1px solid oklch(0.3 0.03 280 / 0.3)",
                }}
              >
                {TYPE_LABELS[tab]}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filteredConvos.length === 0 && (
            <div
              data-ocid="messages.empty_state"
              className="text-center text-muted-foreground text-sm py-12"
            >
              No conversations in this category
            </div>
          )}
          {filteredConvos.map((conv, idx) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isActive = conv.id === activeConvoId;
            return (
              <button
                type="button"
                key={conv.id}
                data-ocid={`messages.conversation.item.${idx + 1}`}
                onClick={() => handleSelectConvo(conv)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left"
                style={{
                  background: isActive
                    ? "oklch(0.22 0.025 280 / 0.6)"
                    : undefined,
                  borderLeft: isActive
                    ? "2px solid oklch(0.6 0.22 295)"
                    : "2px solid transparent",
                }}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback
                      style={{ background: "oklch(0.25 0.04 280)" }}
                    >
                      {conv.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {/* Type indicator dot */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-background"
                    style={{ background: TYPE_COLORS[conv.type] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-semibold text-sm truncate"
                      style={{
                        color:
                          (conv.unread ?? 0) > 0
                            ? "oklch(0.97 0.01 260)"
                            : undefined,
                      }}
                    >
                      {conv.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(conv.unread ?? 0) > 0 && (
                        <span
                          className="text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                          style={{
                            background: "oklch(0.6 0.22 295)",
                            color: "white",
                            fontSize: "10px",
                          }}
                        >
                          {conv.unread}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {lastMsg ? timeAgo(lastMsg.timestamp) : ""}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{
                      color:
                        (conv.unread ?? 0) > 0
                          ? "oklch(0.75 0.04 280)"
                          : "oklch(0.5 0.03 280)",
                    }}
                  >
                    {lastMsg
                      ? `${lastMsg.sent ? "You: " : ""}${lastMsg.text}`
                      : "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const ChatPanel = activeConvo ? (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div
        className="flex items-center gap-3 p-3 border-b flex-shrink-0"
        style={{ borderColor: "oklch(0.25 0.025 280 / 0.3)" }}
      >
        {/* Mobile back button */}
        <button
          type="button"
          data-ocid="messages.back_button"
          onClick={handleBackToInbox}
          className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarImage src={activeConvo.avatar} />
          <AvatarFallback style={{ background: "oklch(0.25 0.04 280)" }}>
            {activeConvo.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{activeConvo.name}</p>
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: `${TYPE_COLORS[activeConvo.type]}20`,
                color: TYPE_COLORS[activeConvo.type],
                border: `1px solid ${TYPE_COLORS[activeConvo.type]}40`,
              }}
            >
              {TYPE_LABELS[activeConvo.type as FilterTab]}
            </span>
            {activeConvo.niche && (
              <span className="text-xs text-muted-foreground">
                · {activeConvo.niche}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ overscrollBehavior: "contain" }}
      >
        {activeConvo.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
          >
            {!msg.sent && (
              <Avatar className="w-7 h-7 flex-shrink-0 mr-2 mt-1">
                <AvatarImage src={activeConvo.avatar} />
                <AvatarFallback style={{ background: "oklch(0.25 0.04 280)" }}>
                  {activeConvo.name[0]}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col gap-1 max-w-[72%]">
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sent
                    ? "text-white rounded-br-sm"
                    : "text-foreground rounded-bl-sm"
                }`}
                style={
                  msg.sent
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))",
                      }
                    : {
                        background: "oklch(0.2 0.022 280 / 0.8)",
                        border: "1px solid oklch(0.28 0.025 280 / 0.4)",
                      }
                }
              >
                {msg.text}
              </div>
              <div
                className={`flex items-center gap-1 text-xs text-muted-foreground ${
                  msg.sent ? "justify-end" : "justify-start"
                }`}
              >
                <span>{timeAgo(msg.timestamp)}</span>
                {msg.sent && (
                  <span style={{ color: "oklch(0.6 0.18 210)" }}>✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingConvoId === activeConvo.id && (
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 flex-shrink-0">
              <AvatarImage src={activeConvo.avatar} />
              <AvatarFallback style={{ background: "oklch(0.25 0.04 280)" }}>
                {activeConvo.name[0]}
              </AvatarFallback>
            </Avatar>
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
              style={{
                background: "oklch(0.2 0.022 280 / 0.8)",
                border: "1px solid oklch(0.28 0.025 280 / 0.4)",
              }}
            >
              <span className="typing-dot" />
              <span
                className="typing-dot"
                style={{ animationDelay: "0.15s" }}
              />
              <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area — pinned to bottom */}
      <div
        className="p-3 border-t flex gap-2 flex-shrink-0"
        style={{ borderColor: "oklch(0.25 0.025 280 / 0.3)" }}
      >
        <Input
          data-ocid="messages.input"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
          style={{
            background: "oklch(0.18 0.02 280 / 0.6)",
            border: "1px solid oklch(0.3 0.03 280 / 0.3)",
          }}
        />
        <Button
          data-ocid="messages.send_button"
          size="icon"
          className="flex-shrink-0"
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 295), oklch(0.55 0.25 310))",
            color: "white",
            border: "none",
          }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
      <div className="text-4xl">💬</div>
      <p className="text-sm">Select a conversation to start chatting</p>
    </div>
  );

  return (
    <>
      {/* Desktop: side-by-side layout */}
      <div
        data-ocid="messages.panel"
        className="hidden md:flex h-screen max-h-screen"
        style={{ paddingBottom: 0 }}
      >
        {/* Inbox panel */}
        <div
          className="w-72 flex-shrink-0 flex flex-col h-full"
          style={{
            borderRight: "1px solid oklch(0.25 0.025 280 / 0.3)",
            background: "oklch(0.13 0.016 280 / 0.5)",
          }}
        >
          {InboxPanel}
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {ChatPanel}
        </div>
      </div>

      {/* Mobile: full-screen inbox OR chat */}
      <div
        className="flex flex-col md:hidden"
        style={{ height: "calc(100vh - 80px)" }}
      >
        {mobileView === "inbox" ? (
          <div className="flex flex-col h-full">{InboxPanel}</div>
        ) : (
          <div className="flex flex-col h-full">{ChatPanel}</div>
        )}
      </div>
    </>
  );
}
