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
}

export default function FollowingModal({ open, onClose }: Props) {
  const { followedUserIds, unfollowUser, navigate } = useApp();

  const followedList = Array.from(followedUserIds)
    .map((uid) => {
      const idx = Number.parseInt(uid);
      return Number.isNaN(idx) ? null : generateUser(idx);
    })
    .filter(Boolean) as ReturnType<typeof generateUser>[];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="following.modal"
        style={{
          background: "oklch(0.14 0.018 280)",
          border: "1px solid oklch(0.28 0.025 280 / 0.5)",
        }}
        className="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>Following</DialogTitle>
        </DialogHeader>
        {followedList.length === 0 ? (
          <p
            data-ocid="following.empty_state"
            className="text-center text-muted-foreground text-sm py-6"
          >
            You&apos;re not following anyone yet.
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-3 pr-2">
              {followedList.map((user, idx) => (
                <div
                  key={user.id}
                  data-ocid={`following.item.${idx + 1}`}
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
                      <p className="text-xs text-muted-foreground">
                        {user.followerCount.toLocaleString()} followers
                      </p>
                    </div>
                  </button>
                  <Button
                    data-ocid={`following.unfollow.button.${idx + 1}`}
                    size="sm"
                    variant="outline"
                    style={{ borderColor: "oklch(0.35 0.03 280 / 0.5)" }}
                    onClick={() => unfollowUser(user.id)}
                  >
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
