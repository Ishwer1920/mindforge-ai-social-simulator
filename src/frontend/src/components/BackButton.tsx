import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

interface Props {
  to?: string;
  label?: string;
}

export default function BackButton({ to = "home", label = "Back" }: Props) {
  const { navigate } = useApp();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
      data-ocid="nav.back.button"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
