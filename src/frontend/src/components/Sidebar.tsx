import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Home,
  LayoutGrid,
  MessageCircle,
  User,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import WeeklyChallenges from "./WeeklyChallenges";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home", ocid: "nav.home.link" },
  { id: "explore", icon: Compass, label: "Explore", ocid: "nav.explore.link" },
  {
    id: "messages",
    icon: MessageCircle,
    label: "Messages",
    ocid: "nav.messages.link",
  },
  { id: "profile", icon: User, label: "Profile", ocid: "nav.profile.link" },
];

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: Props) {
  const { unreadDMs } = useApp();

  const isHubActive = [
    "analytics",
    "monetization",
    "leaderboard",
    "houses",
    "creator-studio",
    "merch-store",
    "trending",
    "hub",
  ].includes(activePage);

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col py-6 px-4 z-20 overflow-y-auto"
      style={{
        background: "oklch(0.11 0.016 280 / 0.97)",
        borderRight: "1px solid oklch(0.22 0.025 280 / 0.5)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center btn-gradient">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            background:
              "linear-gradient(135deg, oklch(0.75 0.22 295), oklch(0.75 0.18 210))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          MindForge
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label, ocid }) => {
          const isActive = activePage === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={ocid}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.25 295 / 0.3), oklch(0.55 0.2 240 / 0.2))",
                      border: "1px solid oklch(0.6 0.22 295 / 0.3)",
                    }
                  : {}
              }
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`}
              />
              {label}
              {id === "messages" && unreadDMs > 0 && (
                <Badge
                  className="ml-auto text-xs px-1.5 py-0"
                  style={{ background: "oklch(0.55 0.25 295)", color: "white" }}
                >
                  {unreadDMs}
                </Badge>
              )}
            </button>
          );
        })}

        {/* Creator Hub link */}
        <button
          type="button"
          data-ocid="nav.hub.link"
          onClick={() => onNavigate("hub")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2 ${
            isHubActive
              ? "text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
          style={
            isHubActive
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.25 295 / 0.3), oklch(0.55 0.2 240 / 0.2))",
                  border: "1px solid oklch(0.6 0.22 295 / 0.3)",
                }
              : {}
          }
        >
          <LayoutGrid
            className={`w-5 h-5 ${isHubActive ? "text-purple-400" : ""}`}
          />
          Creator Hub
        </button>
      </nav>

      <WeeklyChallenges />

      <div className="px-2 pt-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()}.
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {" "}
          Built with ❤ using caffeine.ai
        </a>
      </div>
    </aside>
  );
}
