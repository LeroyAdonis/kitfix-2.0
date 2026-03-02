import { Scissors } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Scissors className="size-[18px]" aria-hidden="true" />
        <span className="text-[15px] font-semibold tracking-tight">
          KitFix
        </span>
      </div>

      {/* Spinner */}
      <div
        className="size-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
