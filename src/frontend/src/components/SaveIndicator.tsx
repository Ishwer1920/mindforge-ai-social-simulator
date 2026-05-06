import { Check, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SaveIndicator() {
  const { isSaving, lastSaved } = useApp();

  return (
    <div
      className="fixed bottom-20 right-3 z-50 flex flex-col items-end gap-0.5 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          background: "oklch(0.15 0.02 280 / 0.9)",
          border: "1px solid oklch(0.3 0.03 280 / 0.4)",
          backdropFilter: "blur(8px)",
          color: isSaving ? "oklch(0.7 0.1 260)" : "oklch(0.65 0.15 145)",
        }}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-3 h-3" />
            Saved ✔
          </>
        )}
      </div>
      {lastSaved && !isSaving && (
        <span className="text-[10px] text-muted-foreground pr-1">
          Last played: {timeAgo(lastSaved)}
        </span>
      )}
    </div>
  );
}
