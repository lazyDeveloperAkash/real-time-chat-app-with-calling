import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-svh items-center justify-center", className)}>
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  );
}
