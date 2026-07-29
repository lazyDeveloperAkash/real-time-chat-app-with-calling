import { MessagesSquare } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-2xl">
            <MessagesSquare className="size-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Chatly</h1>
        </div>
        <div className="bg-card rounded-2xl border p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
