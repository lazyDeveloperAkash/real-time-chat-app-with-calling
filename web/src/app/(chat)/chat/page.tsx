import { MessagesSquare } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-2xl">
        <MessagesSquare className="size-8" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Your messages</h2>
        <p className="text-muted-foreground max-w-xs text-sm">
          Select a conversation from the list, or start a new chat.
        </p>
      </div>
    </div>
  );
}
