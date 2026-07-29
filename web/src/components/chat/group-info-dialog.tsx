"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Trash2, UserMinus, UserPlus, X, Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "./user-avatar";
import {
  useGroup,
  useAddMembers,
  useRemoveMember,
  useDeleteGroup,
} from "@/hooks/use-groups";
import { useSearchUsers } from "@/hooks/use-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

export function GroupInfoDialog({
  groupId,
  open,
  onOpenChange,
}: {
  groupId?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const meId = useAuthStore((s) => s.user?.id);
  const { data: group, isLoading } = useGroup(open ? groupId : undefined);
  const addMembers = useAddMembers(groupId ?? "");
  const removeMember = useRemoveMember(groupId ?? "");
  const deleteGroup = useDeleteGroup(groupId ?? "");

  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const debounced = useDebouncedValue(q, 300);
  const { data: results, isFetching } = useSearchUsers(adding ? debounced : "");

  const myRole = group?.members.find((m) => m.user.id === meId)?.role;
  const isAdmin = myRole === "ADMIN";
  const isCreator = group?.creatorId === meId;
  const memberIds = new Set(group?.members.map((m) => m.user.id));

  const leaveGroup = () => {
    if (!meId) return;
    removeMember.mutate(meId, {
      onSuccess: () => {
        onOpenChange(false);
        router.push("/chat");
      },
    });
  };

  const doDelete = () =>
    deleteGroup.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false);
        router.push("/chat");
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group?.name ?? "Group"}</DialogTitle>
          <DialogDescription>
            {group ? `${group.members.length} members` : "Group info"}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !group ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdding((v) => !v)}
                className="w-full justify-start"
              >
                {adding ? <X /> : <UserPlus />}
                {adding ? "Cancel" : "Add members"}
              </Button>
            )}

            {adding && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search people…"
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {isFetching ? (
                    <div className="flex justify-center p-3">
                      <Loader2 className="text-muted-foreground size-4 animate-spin" />
                    </div>
                  ) : (
                    results
                      ?.filter((u) => !memberIds.has(u.id))
                      .map((u) => (
                        <button
                          key={u.id}
                          onClick={() => addMembers.mutate([u.id])}
                          className="hover:bg-muted flex w-full items-center gap-2 rounded-lg p-2 text-left"
                        >
                          <UserAvatar name={u.name} src={u.avatarUrl} className="size-8" />
                          <span className="flex-1 truncate text-sm">{u.name}</span>
                          <Check className="text-muted-foreground size-4" />
                        </button>
                      ))
                  )}
                </div>
                <Separator />
              </div>
            )}

            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {group.members.map((m) => {
                const isMe = m.user.id === meId;
                const canRemove =
                  isAdmin && !isMe && m.user.id !== group.creatorId;
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg p-2">
                    <UserAvatar
                      name={m.user.name}
                      src={m.user.avatarUrl}
                      userId={m.user.id}
                      className="size-9"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {m.user.name} {isMe && <span className="text-muted-foreground">(You)</span>}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {m.user.contact ?? m.user.email}
                      </p>
                    </div>
                    {m.role === "ADMIN" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Admin
                      </Badge>
                    )}
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${m.user.name}`}
                        onClick={() => removeMember.mutate(m.user.id)}
                      >
                        <UserMinus className="text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <Separator />

            {isCreator ? (
              <Button variant="destructive" onClick={doDelete} disabled={deleteGroup.isPending}>
                {deleteGroup.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Delete group
              </Button>
            ) : (
              <Button variant="destructive" onClick={leaveGroup} disabled={removeMember.isPending}>
                {removeMember.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
                Leave group
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
