"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, normalizeError } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import type { User } from "@/types/models";
import type { UpdateProfileInput } from "@/schemas/profile.schema";

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => unwrap<User>(api.patch("/users/me", input)),
    onSuccess: (updated) => {
      const merged = { ...useAuthStore.getState().user, ...updated } as User;
      setUser(merged);
      qc.setQueryData(qk.me, merged);
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: { avatarUrl: string; avatarFileId?: string }) =>
      unwrap<{ id: string; avatarUrl: string }>(api.patch("/users/me/avatar", input)),
    onSuccess: (data) => {
      const current = useAuthStore.getState().user;
      if (current) {
        const merged = { ...current, avatarUrl: data.avatarUrl };
        setUser(merged);
        qc.setQueryData(qk.me, merged);
      }
      toast.success("Photo updated");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
