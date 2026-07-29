import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground text-sm">This page could not be found.</p>
      <Link href="/chat" className={cn(buttonVariants())}>
        Back to chats
      </Link>
    </div>
  );
}
