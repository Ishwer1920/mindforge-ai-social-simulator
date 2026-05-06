import { Compass, Home, MessageCircle, Plus, User } from "lucide-react";
import { useApp } from "../context/AppContext";

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function MobileNav({ activePage, onNavigate }: Props) {
  const { unreadDMs } = useApp();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{
        background: "oklch(0.11 0.016 280 / 0.97)",
        borderTop: "1px solid oklch(0.22 0.025 280 / 0.5)",
        backdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-end h-16">
        {/* Home */}
        <NavBtn
          id="home"
          active={activePage === "home"}
          onClick={() => onNavigate("home")}
          ocid="nav.home.link"
        >
          <Home
            className={`w-5 h-5 ${activePage === "home" ? "text-purple-400" : "text-muted-foreground"}`}
          />
        </NavBtn>

        {/* Explore */}
        <NavBtn
          id="explore"
          active={activePage === "explore"}
          onClick={() => onNavigate("explore")}
          ocid="nav.explore.link"
        >
          <Compass
            className={`w-5 h-5 ${activePage === "explore" ? "text-purple-400" : "text-muted-foreground"}`}
          />
        </NavBtn>

        {/* Create FAB - center */}
        <div className="flex-1 flex items-end justify-center pb-2">
          <button
            type="button"
            onClick={() => onNavigate("create")}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.22 330))",
              boxShadow: "0 4px 20px oklch(0.5 0.25 295 / 0.5)",
              marginBottom: "4px",
            }}
            data-ocid="nav.create.button"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Messages */}
        <NavBtn
          id="messages"
          active={activePage === "messages"}
          onClick={() => onNavigate("messages")}
          ocid="nav.messages.link"
        >
          <div className="relative">
            <MessageCircle
              className={`w-5 h-5 ${activePage === "messages" ? "text-purple-400" : "text-muted-foreground"}`}
            />
            {unreadDMs > 0 && (
              <span
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-white text-[8px] flex items-center justify-center font-bold"
                style={{ background: "oklch(0.55 0.25 295)" }}
              >
                {unreadDMs > 9 ? "9" : unreadDMs}
              </span>
            )}
          </div>
        </NavBtn>

        {/* Profile */}
        <NavBtn
          id="profile"
          active={activePage === "profile"}
          onClick={() => onNavigate("profile")}
          ocid="nav.profile.link"
        >
          <User
            className={`w-5 h-5 ${activePage === "profile" ? "text-purple-400" : "text-muted-foreground"}`}
          />
        </NavBtn>
      </div>
    </nav>
  );
}

function NavBtn({
  children,
  active,
  onClick,
  ocid,
}: {
  id: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className="flex-1 flex flex-col items-center justify-end pb-2 gap-1 h-full"
    >
      {children}
      {active && (
        <div
          className="w-1 h-1 rounded-full"
          style={{ background: "oklch(0.6 0.22 295)" }}
        />
      )}
    </button>
  );
}
