"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./user-avatar";
import { useSearchUsers } from "@/hooks/use-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCreateGroup } from "@/hooks/use-groups";
import { encodeId } from "@/lib/crypto/url-crypto";
import { useIdCodec } from "@/stores/id-codec.store";
import type { PublicUser } from "@/types/models";
import { cn } from "@/lib/utils";

export function CreateGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<PublicUser[]>([]);
  const debounced = useDebouncedValue(q, 300);
  const { data, isFetching } = useSearchUsers(debounced);
  const createGroup = useCreateGroup();

  const selectedIds = new Set(selected.map((u) => u.id));
  const toggle = (u: PublicUser) =>
    setSelected((prev) =>
      prev.some((x) => x.id === u.id) ? prev.filter((x) => x.id !== u.id) : [...prev, u],
    );

  function reset() {
    setName("");
    setQ("");
    setSelected([]);
  }

  const canCreate = name.trim().length >= 2 && selected.length >= 1;

  function submit() {
    createGroup.mutate(
      { name: name.trim(), memberIds: selected.map((u) => u.id) },
      {
        onSuccess: async (group) => {
          const token = await encodeId(group.conversationId);
          useIdCodec.getState().register(group.conversationId, token);
          onOpenChange(false);
          reset();
          router.push(`/chat/${token}`);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>Name your group and add members.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="group-name">Group name</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Weekend plans"
          />
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((u) => (
              <span
                key={u.id}
                className="bg-muted flex items-center gap-1 rounded-full py-1 pr-1 pl-2 text-xs"
              >
                {u.name}
                <button
                  onClick={() => toggle(u)}
                  className="hover:bg-background rounded-full p-0.5"
                  aria-label={`Remove ${u.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people to add…"
            className="pl-9"
          />
        </div>

        <div className="max-h-56 min-h-20 overflow-y-auto">
          {debounced.trim().length < 2 ? (
            <p className="text-muted-foreground p-4 text-center text-sm">
              Type at least 2 characters
            </p>
          ) : isFetching ? (
            <div className="flex justify-center p-4">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : (
            data?.map((u) => {
              const isSel = selectedIds.has(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggle(u)}
                  className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
                >
                  <UserAvatar name={u.name} src={u.avatarUrl} className="size-9" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{u.name}</span>
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border",
                      isSel && "bg-primary border-primary text-primary-foreground",
                    )}
                  >
                    {isSel && <Check className="size-3.5" />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!canCreate || createGroup.isPending}>
            {createGroup.isPending && <Loader2 className="animate-spin" />}
            Create group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
