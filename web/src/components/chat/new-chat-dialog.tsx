"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "./user-avatar";
import { useSearchUsers } from "@/hooks/use-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { encodeId } from "@/lib/crypto/url-crypto";
import { useIdCodec } from "@/stores/id-codec.store";
import { api } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import type { MessagesPage } from "@/types/api";

export function NewChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);
  const debounced = useDebouncedValue(q, 300);
  const { data, isFetching } = useSearchUsers(debounced);

  // Resolve (get-or-create) the real conversation so the thread is always
  // keyed by conversationId, then seed its message cache and navigate.
  async function startChat(userId: string) {
    setStartingId(userId);
    try {
      const res = await api.get(`/chats/${userId}/messages`, { params: { limit: 30 } });
      const page = res.data.data as MessagesPage;
      const convId = page.conversationId;
      const token = await encodeId(convId);
      useIdCodec.getState().register(convId, token);
      qc.setQueryData(qk.messages(convId), { pages: [page], pageParams: [undefined] });
      qc.invalidateQueries({ queryKey: qk.conversations });
      onOpenChange(false);
      setQ("");
      router.push(`/chat/${token}`);
    } catch {
      toast.error("Couldn't start chat");
    } finally {
      setStartingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New chat</DialogTitle>
          <DialogDescription>Search people by name, email, or phone.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="pl-9"
          />
        </div>

        <div className="max-h-72 min-h-24 overflow-y-auto">
          {debounced.trim().length < 2 ? (
            <p className="text-muted-foreground p-4 text-center text-sm">
              Type at least 2 characters
            </p>
          ) : isFetching ? (
            <div className="flex justify-center p-4">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : data && data.length > 0 ? (
            data.map((u) => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                disabled={startingId !== null}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left disabled:opacity-60"
              >
                <UserAvatar name={u.name} src={u.avatarUrl} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {u.contact ?? u.email}
                  </p>
                </div>
                {startingId === u.id && (
                  <Loader2 className="text-muted-foreground size-4 animate-spin" />
                )}
              </button>
            ))
          ) : (
            <p className="text-muted-foreground p-4 text-center text-sm">No users found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
