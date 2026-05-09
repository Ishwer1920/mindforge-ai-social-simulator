import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Handshake, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { NotificationItem } from "../context/AppContext";

// ─── helpers ───────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type NotifColor = {
  accent: string;
  bg: string;
  border: string;
  dot: string;
};

function getTypeStyle(type: NotificationItem["type"]): NotifColor {
  switch (type) {
    case "follower":
    case "follower_gain":
    case "boost":
      return {
        accent: "oklch(0.72 0.2 145)",
        bg: "oklch(0.12 0.025 145 / 0.45)",
        border: "oklch(0.4 0.12 145 / 0.4)",
        dot: "oklch(0.68 0.22 145)",
      };
    case "sponsorship":
    case "merch_sale":
    case "tip":
      return {
        accent: "oklch(0.75 0.18 295)",
        bg: "oklch(0.12 0.025 295 / 0.45)",
        border: "oklch(0.4 0.12 295 / 0.4)",
        dot: "oklch(0.72 0.22 295)",
      };
    case "challenge":
    case "achievement":
      return {
        accent: "oklch(0.82 0.2 80)",
        bg: "oklch(0.12 0.03 80 / 0.45)",
        border: "oklch(0.45 0.15 80 / 0.4)",
        dot: "oklch(0.80 0.22 80)",
      };
    case "viral":
    case "event":
      return {
        accent: "oklch(0.72 0.22 25)",
        bg: "oklch(0.12 0.025 25 / 0.45)",
        border: "oklch(0.45 0.15 25 / 0.4)",
        dot: "oklch(0.70 0.24 25)",
      };
    case "collab_request":
    case "collab_accepted":
      return {
        accent: "oklch(0.72 0.2 260)",
        bg: "oklch(0.12 0.025 260 / 0.45)",
        border: "oklch(0.4 0.12 260 / 0.4)",
        dot: "oklch(0.68 0.22 260)",
      };
    default:
      // smart, like, comment, dm, house, shadow_ban
      return {
        accent: "oklch(0.72 0.18 220)",
        bg: "oklch(0.12 0.02 220 / 0.45)",
        border: "oklch(0.4 0.1 220 / 0.35)",
        dot: "oklch(0.68 0.2 220)",
      };
  }
}

const STREAK_ICON_TYPES = new Set(["challenge", "achievement"]);
const BRAND_TYPES = new Set(["sponsorship", "merch_sale", "tip"]);

function friendlyTypeLabel(type: NotificationItem["type"]): string {
  if (type === "follower" || type === "follower_gain") return "New Follower";
  if (BRAND_TYPES.has(type)) return "Brand Deal";
  if (STREAK_ICON_TYPES.has(type)) return "Challenge";
  if (type === "viral") return "Viral Post";
  if (type === "event") return "Platform Event";
  if (type === "boost") return "Boost";
  if (type === "house") return "House";
  if (type === "shadow_ban") return "Warning";
  if (type === "smart") return "Insight";
  return "Activity";
}

// ─── Collab Card ────────────────────────────────────────────
interface CollabCardProps {
  notif: NotificationItem;
  idx: number;
  onAccept: () => void;
  onDecline: () => void;
}

function CollabCard({ notif, idx, onAccept, onDecline }: CollabCardProps) {
  const isRequest = notif.type === "collab_request";
  const isAccepted = notif.type === "collab_accepted";

  // Derive fake stats from creator name seed
  const seed = notif.collabCreatorId ?? notif.id;
  const seedNum = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fakeFollowers = 10000 + (seedNum % 18) * 12000;
  const fakeEngagement = (2.8 + (seedNum % 12) * 0.4).toFixed(1);
  const earningsEst = Math.floor(fakeFollowers / 1000) * 15 + 80;

  return (
    <div
      data-ocid={`notifications.collabs.item.${idx + 1}`}
      className="rounded-xl p-3 space-y-3 notification-enter"
      style={{
        background: isAccepted
          ? "oklch(0.14 0.03 145 / 0.6)"
          : "oklch(0.16 0.025 260 / 0.65)",
        border: `1px solid ${isAccepted ? "oklch(0.42 0.14 145 / 0.35)" : "oklch(0.4 0.12 260 / 0.35)"}`,
        animation: "notifSlideIn 0.3s ease-out forwards",
      }}
    >
      {/* Creator header */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          {notif.collabCreatorAvatar ? (
            <img
              src={notif.collabCreatorAvatar}
              alt={notif.collabCreatorName ?? "Creator"}
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: "2px solid oklch(0.55 0.2 260 / 0.5)" }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: "oklch(0.22 0.04 260 / 0.8)" }}
            >
              {notif.icon}
            </div>
          )}
          {isAccepted && (
            <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none">
              ✅
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{
              color: isAccepted
                ? "oklch(0.78 0.18 145)"
                : "oklch(0.82 0.18 260)",
            }}
          >
            {notif.collabCreatorName ?? "Creator"}
          </p>
          {isRequest && (
            <div className="flex gap-2 mt-0.5">
              <span
                className="text-[10px] font-medium"
                style={{ color: "oklch(0.72 0.15 260)" }}
              >
                {(fakeFollowers / 1000).toFixed(0)}K followers
              </span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span
                className="text-[10px] font-medium"
                style={{ color: "oklch(0.78 0.2 80)" }}
              >
                {fakeEngagement}% eng.
              </span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground flex-shrink-0">
          {timeAgo(notif.timestamp)}
        </span>
      </div>

      {/* Message */}
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "oklch(0.82 0.04 260)" }}
      >
        {notif.message}
      </p>

      {/* Request CTA */}
      {isRequest && notif.collabId && (
        <div className="space-y-2">
          <div
            className="flex justify-between text-[10px] px-2 py-1 rounded-lg"
            style={{ background: "oklch(0.14 0.02 260 / 0.6)" }}
          >
            <span className="text-muted-foreground">Estimated earnings</span>
            <span
              style={{ color: "oklch(0.78 0.2 80)" }}
              className="font-semibold"
            >
              ~${earningsEst.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              data-ocid="notifications.collabs.confirm_button"
              size="sm"
              onClick={onAccept}
              className="flex-1 text-xs h-8 font-semibold text-white border-none transition-all duration-200 hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.5 0.28 300))",
                boxShadow: "0 2px 8px oklch(0.55 0.22 295 / 0.35)",
              }}
            >
              🤝 Accept
            </Button>
            <Button
              data-ocid="notifications.collabs.cancel_button"
              size="sm"
              variant="outline"
              onClick={onDecline}
              className="flex-1 text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {/* Accepted success state */}
      {isAccepted && (
        <div
          className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{
            background: "oklch(0.55 0.22 145 / 0.15)",
            color: "oklch(0.78 0.2 145)",
            border: "1px solid oklch(0.45 0.15 145 / 0.35)",
          }}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Collab live! Earning together 🚀
        </div>
      )}
    </div>
  );
}

// ─── Activity Notification Row ─────────────────────────────
interface ActivityRowProps {
  notif: NotificationItem;
  idx: number;
  onDismiss: (id: string) => void;
}

function ActivityRow({ notif, idx, onDismiss }: ActivityRowProps) {
  const style = getTypeStyle(notif.type);
  const label = friendlyTypeLabel(notif.type);

  return (
    <div
      data-ocid={`notifications.activity.item.${idx + 1}`}
      className="group relative flex gap-2.5 p-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] notification-enter"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        animation: `notifSlideIn 0.25s ease-out ${Math.min(idx * 0.05, 0.3)}s both`,
      }}
    >
      {/* Color dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
        style={{ background: style.dot, boxShadow: `0 0 6px ${style.dot}` }}
      />

      {/* Icon */}
      <span className="text-base leading-none mt-0.5 flex-shrink-0">
        {notif.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
            style={{
              background: `${style.accent}22`,
              color: style.accent,
              border: `1px solid ${style.accent}44`,
            }}
          >
            {label}
          </span>
        </div>
        <p className="text-[11px] text-foreground leading-relaxed">
          {notif.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {timeAgo(notif.timestamp)}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        data-ocid="notifications.activity.dismiss_button"
        onClick={() => onDismiss(notif.id)}
        aria-label="Dismiss notification"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted/60"
        style={{ color: "oklch(0.55 0.04 260)" }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────
export default function NotificationsSidebar({
  onClose,
}: { onClose?: () => void }) {
  const {
    notifications,
    acceptCollab,
    dismissNotification,
    clearActivityNotifications,
    clearCollabNotifications,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"collabs" | "activity">("collabs");

  const collabNotifs = notifications.filter(
    (n) => n.type === "collab_request" || n.type === "collab_accepted",
  );
  const regularNotifs = notifications.filter(
    (n) => n.type !== "collab_request" && n.type !== "collab_accepted",
  );
  const unreadCount = notifications.length;

  function handleAccept(collabId: string) {
    acceptCollab(collabId);
  }

  function handleDecline(notifId: string) {
    dismissNotification(notifId);
  }

  return (
    <aside
      data-ocid="notifications.panel"
      className="fixed right-0 top-0 h-screen w-[280px] flex flex-col z-20"
      style={{
        background: "oklch(0.13 0.016 280 / 0.97)",
        borderLeft: "1px solid oklch(0.25 0.025 280 / 0.5)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center gap-2 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.22 0.02 280 / 0.5)" }}
      >
        <Bell
          className="w-4.5 h-4.5"
          style={{ color: "oklch(0.72 0.18 295)" }}
        />
        <h2 className="font-semibold text-sm text-foreground">Notifications</h2>
        {unreadCount > 0 && (
          <Badge
            data-ocid="notifications.unread_badge"
            className="ml-1 text-[10px] h-5 min-w-5 px-1.5 font-bold border-none"
            style={{
              background: "oklch(0.55 0.22 295 / 0.3)",
              border: "1px solid oklch(0.55 0.22 295 / 0.5)",
              color: "oklch(0.78 0.2 295)",
            }}
          >
            {unreadCount}
          </Badge>
        )}
        {/* Close button */}
        <button
          type="button"
          data-ocid="notifications.close_button"
          onClick={onClose}
          aria-label="Close notifications"
          className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Bar */}
      <div
        className="flex flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.22 0.02 280 / 0.5)" }}
      >
        <button
          type="button"
          data-ocid="notifications.collabs.tab"
          onClick={() => setActiveTab("collabs")}
          className="flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors relative"
          style={{
            color:
              activeTab === "collabs"
                ? "oklch(0.82 0.18 260)"
                : "oklch(0.5 0.04 280)",
            background: "transparent",
          }}
        >
          <Handshake className="w-3.5 h-3.5" />
          Collabs
          {collabNotifs.length > 0 && (
            <span
              className="text-[9px] font-bold px-1 rounded-full"
              style={{
                background: "oklch(0.55 0.22 260 / 0.3)",
                color: "oklch(0.78 0.2 260)",
              }}
            >
              {collabNotifs.length}
            </span>
          )}
          {activeTab === "collabs" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "oklch(0.72 0.2 260)" }}
            />
          )}
        </button>
        <button
          type="button"
          data-ocid="notifications.activity.tab"
          onClick={() => setActiveTab("activity")}
          className="flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors relative"
          style={{
            color:
              activeTab === "activity"
                ? "oklch(0.82 0.18 295)"
                : "oklch(0.5 0.04 280)",
            background: "transparent",
          }}
        >
          <Bell className="w-3.5 h-3.5" />
          Activity
          {regularNotifs.length > 0 && (
            <span
              className="text-[9px] font-bold px-1 rounded-full"
              style={{
                background: "oklch(0.55 0.22 295 / 0.25)",
                color: "oklch(0.78 0.2 295)",
              }}
            >
              {regularNotifs.length}
            </span>
          )}
          {activeTab === "activity" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: "oklch(0.72 0.18 295)" }}
            />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-3 space-y-2">
          {activeTab === "collabs" && (
            <section data-ocid="notifications.collabs.panel">
              {collabNotifs.length > 0 && (
                <div className="flex items-center justify-end mb-2">
                  <button
                    type="button"
                    data-ocid="notifications.collabs.clear_button"
                    onClick={clearCollabNotifications}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Clear
                  </button>
                </div>
              )}
              {collabNotifs.length === 0 ? (
                <div
                  className="text-center py-5 rounded-xl"
                  data-ocid="notifications.collabs.empty_state"
                  style={{
                    background: "oklch(0.11 0.02 260 / 0.4)",
                    border: "1px solid oklch(0.28 0.06 260 / 0.3)",
                  }}
                >
                  <p className="text-2xl mb-1">🤝</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    No collab requests yet
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 opacity-70">
                    AI creators will invite you to collaborate
                  </p>
                </div>
              ) : (
                collabNotifs.map((notif, idx) => (
                  <CollabCard
                    key={notif.id}
                    notif={notif}
                    idx={idx}
                    onAccept={() => handleAccept(notif.collabId as string)}
                    onDecline={() => handleDecline(notif.id)}
                  />
                ))
              )}
            </section>
          )}

          {activeTab === "activity" && (
            <section data-ocid="notifications.regular.panel">
              {regularNotifs.length > 0 && (
                <div className="flex items-center justify-end mb-2">
                  <button
                    type="button"
                    data-ocid="notifications.activity.clear_button"
                    onClick={clearActivityNotifications}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
              )}
              {regularNotifs.length === 0 ? (
                <div
                  className="text-center py-5 rounded-xl"
                  data-ocid="notifications.regular.empty_state"
                  style={{
                    background: "oklch(0.11 0.02 280 / 0.4)",
                    border: "1px solid oklch(0.25 0.04 280 / 0.3)",
                  }}
                >
                  <p className="text-2xl mb-1">🔔</p>
                  <p className="text-xs text-muted-foreground">
                    No activity yet
                  </p>
                </div>
              ) : (
                regularNotifs.map((notif, idx) => (
                  <ActivityRow
                    key={notif.id}
                    notif={notif}
                    idx={idx}
                    onDismiss={dismissNotification}
                  />
                ))
              )}
            </section>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
