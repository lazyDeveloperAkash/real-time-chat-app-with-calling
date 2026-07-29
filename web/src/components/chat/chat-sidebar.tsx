"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SquarePen,
  Users,
  MoreVertical,
  Settings,
  LogOut,
  AlertCircle,
  MessageSquarePlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "./user-avatar";
import { ConversationItem } from "./conversation-item";
import { NewChatDialog } from "./new-chat-dialog";
import { CreateGroupDialog } from "./create-group-dialog";
import { ThemeToggle } from "./theme-toggle";
import { SidebarSkeleton } from "@/components/skeletons/sidebar-skeleton";
import { useConversations } from "@/hooks/use-conversations";
import { useSignout } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";
import { primeIds } from "@/stores/id-codec.store";

export function ChatSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeToken = pathname.startsWith("/chat/")
    ? decodeURIComponent(pathname.slice("/chat/".length))
    : undefined;

  const me = useAuthStore((s) => s.user);
  const signout = useSignout();
  const { data: conversations, isLoading, isError, refetch } = useConversations();

  const [filter, setFilter] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  // Pre-encode conversation ids so links render synchronously.
  useEffect(() => {
    if (conversations) primeIds(conversations.map((c) => c.id));
  }, [conversations]);

  const filtered = useMemo(() => {
    if (!conversations) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.chatEntity?.name ?? "").toLowerCase().includes(q),
    );
  }, [conversations, filter]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-2 border-b p-3">
        <UserAvatar
          name={me?.name}
          src={me?.avatarUrl}
          className="size-9"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{me?.name ?? "…"}</p>
          <p className="text-muted-foreground truncate text-xs">{me?.email}</p>
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Menu">
                <MoreVertical />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => signout.mutate()}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Actions */}
      <div className="flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search chats"
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="New group"
          onClick={() => setNewGroupOpen(true)}
        >
          <Users />
        </Button>
        <Button size="icon" aria-label="New chat" onClick={() => setNewChatOpen(true)}>
          <SquarePen />
        </Button>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <SidebarSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">Couldn&apos;t load your chats.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <MessageSquarePlus className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">
              {filter ? "No matching chats." : "No conversations yet."}
            </p>
            {!filter && (
              <Button size="sm" onClick={() => setNewChatOpen(true)}>
                Start a chat
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                activeToken={activeToken}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
      <CreateGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
    </div>
  );
}
