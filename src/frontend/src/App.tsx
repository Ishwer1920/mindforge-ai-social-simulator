import { Toaster } from "@/components/ui/sonner";
import { Bell } from "lucide-react";
import { useState } from "react";
import DramaModal from "./components/DramaModal";
import MobileNav from "./components/MobileNav";
import NotificationsSidebar from "./components/NotificationsSidebar";
import SaveIndicator from "./components/SaveIndicator";
import Sidebar from "./components/Sidebar";
import { AppProvider, useApp } from "./context/AppContext";
import { useIsMobile } from "./hooks/use-mobile";
import { useAIInfluencers } from "./hooks/useAIInfluencers";
import { useAlgoHackEngine } from "./hooks/useAlgoHackEngine";
import { useCollaborationSimulator } from "./hooks/useCollaborationSimulator";
import { type DramaEvent, useDramaEngine } from "./hooks/useDramaEngine";
import { useEngagementSimulator } from "./hooks/useEngagementSimulator";
import { useViralEngine } from "./hooks/useViralEngine";
import AgencyPage from "./pages/AgencyPage";
import AlgorithmHack from "./pages/AlgorithmHack";
import Analytics from "./pages/Analytics";
import BlackMarket from "./pages/BlackMarket";
import ChallengesBoardPage from "./pages/ChallengesBoardPage";
import ChallengesPage from "./pages/ChallengesPage";
import ContentVault from "./pages/ContentVault";
import CreatorEnergy from "./pages/CreatorEnergy";
import CreatorHouses from "./pages/CreatorHouses";
import CreatorHub from "./pages/CreatorHub";
import CreatorStudio from "./pages/CreatorStudio";
import Explore from "./pages/Explore";
import FanArmyWars from "./pages/FanArmyWars";
import FanMailCenter from "./pages/FanMailCenter";
import HallOfFame from "./pages/HallOfFame";
import HashtagPage from "./pages/HashtagPage";
import HomeFeed from "./pages/HomeFeed";
import InvestmentPage from "./pages/InvestmentPage";
import Leaderboard from "./pages/Leaderboard";
import LiveStream from "./pages/LiveStream";
import MerchStore from "./pages/MerchStore";
import Messages from "./pages/Messages";
import Monetization from "./pages/Monetization";
import MonetizationBooster from "./pages/MonetizationBooster";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import SkillUpgrades from "./pages/SkillUpgrades";
import SponsorBidding from "./pages/SponsorBidding";
import StreaksRewards from "./pages/StreaksRewards";
import TrendBattles from "./pages/TrendBattles";
import TrendRadar from "./pages/TrendRadar";
import Trending from "./pages/Trending";
import ViralRoulette from "./pages/ViralRoulette";

function AppShell() {
  const { currentRoute, navigate, hideMobileNav, isNewUser } = useApp();
  const isMobile = useIsMobile();
  useEngagementSimulator();
  useAIInfluencers();
  useViralEngine();
  useCollaborationSimulator();
  useAlgoHackEngine();

  const [activeDrama, setActiveDrama] = useState<DramaEvent | null>(null);
  useDramaEngine((event) => setActiveDrama(event));
  const [notifOpen, setNotifOpen] = useState(false);

  if (isNewUser) {
    return <Onboarding />;
  }

  const activePage = currentRoute.page;

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomeFeed />;
      case "trending":
        return <Trending />;
      case "explore":
        return <Explore />;
      case "messages":
        return <Messages />;
      case "profile":
        return <Profile />;
      case "analytics":
        return <Analytics />;
      case "monetization":
        return <Monetization />;
      case "merch-store":
        return <MerchStore />;
      case "leaderboard":
        return <Leaderboard />;
      case "houses":
        return <CreatorHouses />;
      case "hub":
        return <CreatorHub />;
      case "creator-studio":
        return <CreatorStudio />;
      case "challenges":
        return <ChallengesPage />;
      case "user-profile":
        return <Profile userId={currentRoute.userId} />;
      case "hashtag":
        return <HashtagPage tag={currentRoute.tag ?? ""} />;
      case "live-stream":
        return <LiveStream />;
      case "viral-roulette":
        return <ViralRoulette />;
      case "hall-of-fame":
        return <HallOfFame />;
      case "black-market":
        return <BlackMarket />;
      case "fan-army-wars":
        return <FanArmyWars />;
      case "creator-energy":
        return <CreatorEnergy />;
      case "trend-battles":
        return <TrendBattles />;
      case "sponsor-bidding":
        return <SponsorBidding />;
      case "algo-hack":
        return <AlgorithmHack />;
      case "skills":
        return <SkillUpgrades />;
      case "agency":
        return <AgencyPage />;
      case "investment":
        return <InvestmentPage />;
      case "streaks":
        return <StreaksRewards />;
      case "content-vault":
        return <ContentVault />;
      case "trend-radar":
        return <TrendRadar />;
      case "fan-mail":
        return <FanMailCenter />;
      case "challenges-board":
        return <ChallengesBoardPage />;
      case "monetization-booster":
        return <MonetizationBooster />;
      default:
        return <HomeFeed />;
    }
  };

  const handleNavigate = (page: string) => navigate(page);

  return (
    <div className="min-h-screen flex">
      {!isMobile && (
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      )}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: isMobile ? 0 : "240px",
          marginRight: isMobile ? 0 : notifOpen ? "288px" : "0px",
          paddingBottom: isMobile && !hideMobileNav ? "80px" : 0,
        }}
      >
        {renderPage()}
      </main>
      {!isMobile && notifOpen && (
        <NotificationsSidebar onClose={() => setNotifOpen(false)} />
      )}
      {/* Bell toggle button (desktop) */}
      {!isMobile && !notifOpen && (
        <button
          type="button"
          aria-label="Open notifications"
          data-ocid="app.notifications.open_button"
          onClick={() => setNotifOpen(true)}
          className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: "oklch(0.18 0.025 280 / 0.9)",
            border: "1px solid oklch(0.35 0.04 280 / 0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Bell
            className="w-4.5 h-4.5"
            style={{ color: "oklch(0.72 0.18 295)" }}
          />
        </button>
      )}
      {isMobile && !hideMobileNav && (
        <MobileNav activePage={activePage} onNavigate={handleNavigate} />
      )}
      <SaveIndicator />
      <DramaModal event={activeDrama} onClose={() => setActiveDrama(null)} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.02 280 / 0.95)",
            border: "1px solid oklch(0.35 0.03 280 / 0.4)",
            color: "oklch(0.97 0.01 260)",
            backdropFilter: "blur(20px)",
          },
        }}
      />
      {/* V16 version badge */}
      <div
        className="fixed bottom-2 right-2 z-50 text-xs font-bold px-2 py-0.5 rounded-full pointer-events-none select-none"
        style={{
          background: "oklch(0.55 0.22 295 / 0.18)",
          border: "1px solid oklch(0.55 0.22 295 / 0.4)",
          color: "oklch(0.72 0.2 295)",
        }}
      >
        V16
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
