"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, normalizeError } from "@/lib/axios";
import { qk } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import { disconnectSocket } from "@/lib/socket";
import type { User } from "@/types/models";
import type { SigninInput, SignupInput } from "@/schemas/auth.schema";

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: () => unwrap<User>(api.get("/users/me")),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSignin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: SigninInput) =>
      unwrap<{ user: User }>(api.post("/auth/signin", input)),
    onSuccess: ({ user }) => {
      setUser(user);
      qc.setQueryData(qk.me, user);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: SignupInput) =>
      unwrap<{ user: User }>(api.post("/auth/signup", input)),
    onSuccess: ({ user }) => {
      setUser(user);
      qc.setQueryData(qk.me, user);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useSignout() {
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () => api.post("/auth/signout"),
    onSuccess: () => {
      disconnectSocket();
      clear();
      qc.clear();
    },
    onSettled: () => {
      if (typeof window !== "undefined") window.location.href = "/signin";
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.post("/auth/forgot-password", { email }),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string }) =>
      api.post("/auth/verify-otp", input),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string; newPassword: string }) =>
      api.post("/auth/reset-password", input),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
