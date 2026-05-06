import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Plus, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const NICHE_OPTIONS = [
  { value: "Fitness", emoji: "💪" },
  { value: "Tech", emoji: "💻" },
  { value: "Comedy", emoji: "😂" },
  { value: "Fashion", emoji: "👗" },
  { value: "Gaming", emoji: "🎮" },
  { value: "Food", emoji: "🍕" },
  { value: "Travel", emoji: "✈️" },
  { value: "Education", emoji: "📚" },
  { value: "Music", emoji: "🎵" },
  { value: "Photography", emoji: "📸" },
];

function msToTimer(ms: number): string {
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

export default function CreatorHouses() {
  const {
    houses,
    userHouseId,
    competitions,
    joinHouse,
    createHouse,
    joinCompetition,
  } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [houseName, setHouseName] = useState("");
  const [houseNiche, setHouseNiche] = useState("Tech");
  const [joinConfirmId, setJoinConfirmId] = useState<string | null>(null);

  const myHouse = userHouseId ? houses.find((h) => h.id === userHouseId) : null;

  const handleCreate = () => {
    if (!houseName.trim()) {
      toast.error("Please enter a house name");
      return;
    }
    const nicheObj =
      NICHE_OPTIONS.find((n) => n.value === houseNiche) ?? NICHE_OPTIONS[0];
    createHouse(houseName.trim(), nicheObj.emoji, houseNiche);
    toast.success(`🏠 ${houseName} is live!`);
    setCreateOpen(false);
    setHouseName("");
  };

  const handleJoin = (houseId: string) => {
    if (userHouseId) {
      toast.error("You can only be in one house at a time.");
      return;
    }
    joinHouse(houseId);
    setJoinConfirmId(null);
    const h = houses.find((hh) => hh.id === houseId);
    toast.success(`🏠 Joined ${h?.name ?? "the house"}!`);
  };

  const handleJoinCompetition = (compId: string) => {
    joinCompetition(compId);
    const comp = competitions.find((c) => c.id === compId);
    toast.success(`🏆 Entered ${comp?.name ?? "the competition"}!`);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            <Home
              className="w-6 h-6"
              style={{ color: "oklch(0.72 0.2 295)" }}
            />
            Creator Houses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join a crew, compete together, and dominate the leaderboard
          </p>
        </div>
        {!userHouseId && (
          <Button
            data-ocid="houses.create.open_modal_button"
            className="gap-2 btn-gradient text-white border-none"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create House
          </Button>
        )}
      </div>

      <Tabs defaultValue={myHouse ? "my-house" : "browse"}>
        <TabsList
          className="w-full"
          style={{ background: "oklch(0.16 0.018 280)" }}
        >
          <TabsTrigger
            value="browse"
            data-ocid="houses.browse.tab"
            className="flex-1"
          >
            🌐 Browse Houses
          </TabsTrigger>
          <TabsTrigger
            value="my-house"
            data-ocid="houses.my_house.tab"
            className="flex-1"
          >
            🏠 My House
          </TabsTrigger>
          <TabsTrigger
            value="competitions"
            data-ocid="houses.competitions.tab"
            className="flex-1"
          >
            🏆 Competitions
          </TabsTrigger>
        </TabsList>

        {/* BROWSE TAB */}
        <TabsContent value="browse" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {houses.map((house, i) => (
              <div
                key={house.id}
                data-ocid={`houses.house.card.${i + 1}`}
                className="glass-card p-4 space-y-3 hover:scale-[1.02] transition-transform cursor-pointer"
                style={{
                  border:
                    userHouseId === house.id
                      ? "1px solid oklch(0.65 0.22 295 / 0.6)"
                      : undefined,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{house.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{house.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {house.niche}
                      </p>
                    </div>
                  </div>
                  <Badge
                    style={{
                      background: "oklch(0.55 0.25 295 / 0.2)",
                      color: "oklch(0.75 0.22 295)",
                      border: "1px solid oklch(0.55 0.25 295 / 0.3)",
                    }}
                  >
                    #{house.rank}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {house.members.length} members
                  </span>
                  <span>
                    {(house.totalFollowers / 1000).toFixed(0)}K total followers
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {house.members.slice(0, 5).map((m) => (
                    <Avatar
                      key={m.id}
                      className="w-7 h-7 border-2 border-background"
                    >
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {house.members.length > 5 && (
                    <div
                      className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold"
                      style={{ background: "oklch(0.22 0.02 280)" }}
                    >
                      +{house.members.length - 5}
                    </div>
                  )}
                </div>
                {userHouseId === house.id ? (
                  <Badge
                    className="w-full justify-center py-1"
                    style={{
                      background: "oklch(0.55 0.25 295 / 0.2)",
                      color: "oklch(0.75 0.22 295)",
                    }}
                  >
                    ✓ Your House
                  </Badge>
                ) : (
                  <Button
                    data-ocid={`houses.join.button.${i + 1}`}
                    size="sm"
                    className="w-full"
                    style={{
                      background: "oklch(0.22 0.02 280)",
                      border: "1px solid oklch(0.35 0.03 280 / 0.5)",
                    }}
                    disabled={!!userHouseId}
                    onClick={() => setJoinConfirmId(house.id)}
                  >
                    Join House
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* MY HOUSE TAB */}
        <TabsContent value="my-house" className="mt-4">
          {myHouse ? (
            <div className="space-y-4">
              <div
                className="glass-card p-6"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.03 295 / 0.5), oklch(0.16 0.02 240 / 0.5))",
                  border: "1px solid oklch(0.4 0.12 295 / 0.3)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{myHouse.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold">{myHouse.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {myHouse.niche} • Rank #{myHouse.rank}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-3 text-center">
                    <p
                      className="text-xl font-bold"
                      style={{ color: "oklch(0.72 0.2 295)" }}
                    >
                      {myHouse.members.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <p
                      className="text-xl font-bold"
                      style={{ color: "oklch(0.72 0.2 295)" }}
                    >
                      {(myHouse.totalFollowers / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Combined Followers
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Members
                </h3>
                <div className="space-y-2">
                  {myHouse.members.map((member, i) => (
                    <div
                      key={member.id}
                      data-ocid={`houses.member.row.${i + 1}`}
                      className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                    >
                      <span className="text-sm text-muted-foreground w-5 text-center">
                        {i + 1}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.username}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(member.followers / 1000).toFixed(0)}K
                      </span>
                      {member.id === "user" && (
                        <Badge
                          style={{
                            background: "oklch(0.55 0.25 295 / 0.2)",
                            color: "oklch(0.75 0.22 295)",
                          }}
                        >
                          You
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              data-ocid="houses.my_house.empty_state"
              className="glass-card p-10 text-center space-y-4"
            >
              <div className="text-5xl">🏠</div>
              <div>
                <p className="font-semibold text-lg">No house yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Join an existing house or create your own to collaborate and
                  compete
                </p>
              </div>
              <Button
                data-ocid="houses.empty.create.button"
                className="gap-2 btn-gradient text-white border-none"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-4 h-4" /> Create Your House
              </Button>
            </div>
          )}
        </TabsContent>

        {/* COMPETITIONS TAB */}
        <TabsContent value="competitions" className="mt-4 space-y-4">
          {competitions.map((comp, ci) => (
            <div
              key={comp.id}
              data-ocid={`houses.competition.card.${ci + 1}`}
              className="glass-card p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="text-xl">{comp.emoji}</span>
                    {comp.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ranked by {comp.type} • Resets in{" "}
                    <span style={{ color: "oklch(0.72 0.2 295)" }}>
                      {msToTimer(comp.weekEndsAt - Date.now())}
                    </span>
                  </p>
                </div>
                {comp.joined ? (
                  <Badge
                    style={{
                      background: "oklch(0.55 0.2 145 / 0.2)",
                      color: "oklch(0.75 0.18 145)",
                      border: "1px solid oklch(0.55 0.2 145 / 0.3)",
                    }}
                  >
                    ✓ Entered
                  </Badge>
                ) : (
                  <Button
                    data-ocid={`houses.competition.join.button.${ci + 1}`}
                    size="sm"
                    className="btn-gradient text-white border-none"
                    onClick={() => handleJoinCompetition(comp.id)}
                  >
                    Join Contest
                  </Button>
                )}
              </div>

              {/* Leaderboard */}
              <div className="space-y-2">
                {comp.leaderboard.slice(0, 6).map((entry, rank) => (
                  <div
                    key={entry.userId}
                    data-ocid={`houses.competition.row.${rank + 1}`}
                    className="flex items-center gap-3 py-1.5 rounded-lg px-2"
                    style={{
                      background:
                        entry.userId === "user"
                          ? "oklch(0.55 0.25 295 / 0.1)"
                          : rank < 3
                            ? "oklch(0.18 0.02 60 / 0.3)"
                            : "transparent",
                    }}
                  >
                    <span
                      className="text-sm font-bold w-5 text-center"
                      style={{
                        color:
                          rank === 0
                            ? "oklch(0.82 0.18 65)"
                            : rank === 1
                              ? "oklch(0.78 0.05 270)"
                              : rank === 2
                                ? "oklch(0.72 0.14 40)"
                                : "oklch(0.55 0.02 270)",
                      }}
                    >
                      {rank === 0
                        ? "🥇"
                        : rank === 1
                          ? "🥈"
                          : rank === 2
                            ? "🥉"
                            : rank + 1}
                    </span>
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {entry.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {entry.name}
                        {entry.userId === "user" && (
                          <span style={{ color: "oklch(0.72 0.2 295)" }}>
                            {" "}
                            (you)
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.72 0.2 295)" }}
                    >
                      {(entry.score / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>

              {/* Rewards */}
              <div
                className="rounded-xl p-3 flex items-center gap-2 text-xs"
                style={{
                  background: "oklch(0.18 0.02 60 / 0.2)",
                  border: "1px solid oklch(0.45 0.12 60 / 0.3)",
                }}
              >
                <Trophy
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "oklch(0.82 0.18 65)" }}
                />
                <span className="text-muted-foreground">
                  Top 3 reward:{" "}
                  <span className="text-foreground font-medium">
                    {comp.reward}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Create House Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          data-ocid="houses.create.dialog"
          style={{
            background: "oklch(0.15 0.018 280)",
            border: "1px solid oklch(0.3 0.025 280 / 0.5)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🏠 Create Your House
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="house-name">House Name</Label>
              <Input
                id="house-name"
                data-ocid="houses.create.input"
                placeholder="e.g. ViralVault, ContentKings..."
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                style={{
                  background: "oklch(0.18 0.02 280 / 0.5)",
                  border: "1px solid oklch(0.3 0.025 280 / 0.5)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Niche</Label>
              <Select value={houseNiche} onValueChange={setHouseNiche}>
                <SelectTrigger
                  data-ocid="houses.create.select"
                  style={{
                    background: "oklch(0.18 0.02 280 / 0.5)",
                    border: "1px solid oklch(0.3 0.025 280 / 0.5)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.16 0.018 280)",
                    border: "1px solid oklch(0.3 0.025 280 / 0.5)",
                  }}
                >
                  {NICHE_OPTIONS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.emoji} {n.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="houses.create.cancel_button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="houses.create.submit_button"
              className="btn-gradient text-white border-none"
              onClick={handleCreate}
            >
              Create House
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Confirm Dialog */}
      <Dialog
        open={!!joinConfirmId}
        onOpenChange={() => setJoinConfirmId(null)}
      >
        <DialogContent
          data-ocid="houses.join.dialog"
          style={{
            background: "oklch(0.15 0.018 280)",
            border: "1px solid oklch(0.3 0.025 280 / 0.5)",
          }}
        >
          <DialogHeader>
            <DialogTitle>
              Join{" "}
              {joinConfirmId
                ? (houses.find((h) => h.id === joinConfirmId)?.name ?? "House")
                : "House"}
              ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You can only be a member of one house at a time. Joining this house
            will give you access to collaborative posts and competitions.
          </p>
          <DialogFooter>
            <Button
              data-ocid="houses.join.cancel_button"
              variant="ghost"
              onClick={() => setJoinConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="houses.join.confirm_button"
              className="btn-gradient text-white border-none"
              onClick={() => joinConfirmId && handleJoin(joinConfirmId)}
            >
              Join House
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Competition user score display when joined */}
      {competitions.some((c) => c.joined) && (
        <div
          className="glass-card p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.03 295 / 0.3), oklch(0.16 0.02 240 / 0.3))",
          }}
        >
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Trophy
              className="w-4 h-4"
              style={{ color: "oklch(0.82 0.18 65)" }}
            />
            Your Competition Stats
          </h3>
          <div className="space-y-2">
            {competitions
              .filter((c) => c.joined)
              .map((comp) => {
                const userEntry = comp.leaderboard.find(
                  (e) => e.userId === "user",
                );
                const rank =
                  comp.leaderboard.findIndex((e) => e.userId === "user") + 1;
                const pct =
                  comp.leaderboard.length > 0 && userEntry
                    ? Math.min(
                        100,
                        (userEntry.score / (comp.leaderboard[0]?.score || 1)) *
                          100,
                      )
                    : 0;
                return (
                  <div key={comp.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>
                        {comp.emoji} {comp.name}
                      </span>
                      <span style={{ color: "oklch(0.72 0.2 295)" }}>
                        Rank #{rank} —{" "}
                        {userEntry ? (userEntry.score / 1000).toFixed(0) : 0}K
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
