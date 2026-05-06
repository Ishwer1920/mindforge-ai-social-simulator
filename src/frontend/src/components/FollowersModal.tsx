import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "../context/AppContext";
import { generateUser } from "../utils/simulatedUsers";

interface Props {
  open: boolean;
  onClose: () => void;
  followerCount: number;
  isOwnProfile: boolean;
}

export default function FollowersModal({
  open,
  onClose,
  followerCount,
  isOwnProfile,
}: Props) {
  const { followedUserIds, followUser, unfollowUser, navigate } = useApp();

  // Generate a list of simulated followers
  const count = Math.min(followerCount, 50);
  const followers = Array.from({ length: count }, (_, i) =>
    generateUser(i + 5),
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="followers.modal"
        style={{
          background: "oklch(0.14 0.018 280)",
          border: "1px solid oklch(0.28 0.025 280 / 0.5)",
        }}
        className="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>
            {isOwnProfile ? "Your Followers" : "Followers"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-3 pr-2">
            {followers.map((user, idx) => (
              <div
                key={user.id}
                data-ocid={`followers.item.${idx + 1}`}
                className="flex items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    navigate("user-profile", { userId: user.id });
                    onClose();
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.username}
                    </p>
                  </div>
                </button>
                <Button
                  data-ocid={`followers.follow.button.${idx + 1}`}
                  size="sm"
                  variant={followedUserIds.has(user.id) ? "outline" : "default"}
                  onClick={() =>
                    followedUserIds.has(user.id)
                      ? unfollowUser(user.id)
                      : followUser(user.id)
                  }
                  className={
                    followedUserIds.has(user.id)
                      ? ""
                      : "btn-gradient text-white border-none"
                  }
                  style={
                    followedUserIds.has(user.id)
                      ? { borderColor: "oklch(0.35 0.03 280 / 0.5)" }
                      : {}
                  }
                >
                  {followedUserIds.has(user.id) ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
