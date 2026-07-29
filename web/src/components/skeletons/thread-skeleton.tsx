import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ThreadSkeleton() {
  const rows = [
    { mine: false, w: "w-40" },
    { mine: true, w: "w-52" },
    { mine: false, w: "w-32" },
    { mine: true, w: "w-44" },
    { mine: false, w: "w-56" },
    { mine: true, w: "w-36" },
  ];
  return (
    <div className="flex flex-1 flex-col justify-end gap-3 p-4">
      {rows.map((r, i) => (
        <div key={i} className={cn("flex", r.mine ? "justify-end" : "justify-start")}>
          <Skeleton className={cn("h-10 rounded-2xl", r.w)} />
        </div>
      ))}
    </div>
  );
}
