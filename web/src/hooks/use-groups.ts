"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, normalizeError } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import type { Group } from "@/types/models";

export function useGroup(id?: string) {
  return useQuery({
    queryKey: qk.group(id ?? ""),
    queryFn: () => unwrap<Group>(api.get(`/groups/${id}`)),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; memberIds: string[] }) =>
      unwrap<Group>(api.post("/groups", input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.conversations }),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useAddMembers(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberIds: string[]) =>
      unwrap<Group>(api.post(`/groups/${groupId}/members`, { memberIds })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.group(groupId) });
      qc.invalidateQueries({ queryKey: qk.conversations });
      toast.success("Members added");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useRemoveMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.delete(`/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.group(groupId) });
      qc.invalidateQueries({ queryKey: qk.conversations });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useDeleteGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/groups/${groupId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.conversations }),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
