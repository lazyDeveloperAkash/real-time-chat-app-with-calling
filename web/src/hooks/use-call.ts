"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { api, unwrap, normalizeError } from "@/lib/axios";
import { useCallStore, type CallPeer } from "@/stores/call.store";
import type { CallType } from "@/types/socket";

interface StartResp {
  callId: string;
  roomName: string;
  token: string;
  url: string;
  callType: CallType;
  ringing: boolean;
}
interface AcceptResp {
  token: string;
  url: string;
  roomName: string;
  callType: CallType;
}

export function useCall() {
  const patch = useCallStore((s) => s.patch);
  const reset = useCallStore((s) => s.reset);

  const startCall = useCallback(
    async (opts: {
      conversationId: string;
      type: CallType;
      peer: CallPeer | null;
      isGroup: boolean;
      groupName?: string;
    }) => {
      if (useCallStore.getState().status !== "idle") return;
      patch({
        status: "outgoing",
        callType: opts.type,
        conversationId: opts.conversationId,
        peer: opts.peer,
        isGroup: opts.isGroup,
        groupName: opts.groupName,
      });
      try {
        const data = await unwrap<StartResp>(
          api.post("/calls", { conversationId: opts.conversationId, type: opts.type }),
        );
        patch({
          callId: data.callId,
          roomName: data.roomName,
          token: data.token,
          url: data.url,
        });
      } catch (err) {
        const e = normalizeError(err);
        toast.error(e.status === 503 ? "Calling isn't configured on the server." : e.message);
        reset();
      }
    },
    [patch, reset],
  );

  const accept = useCallback(async () => {
    const { callId } = useCallStore.getState();
    if (!callId) return;
    patch({ status: "connecting" });
    try {
      const data = await unwrap<AcceptResp>(api.post(`/calls/${callId}/accept`));
      patch({ token: data.token, url: data.url, roomName: data.roomName, status: "active" });
    } catch (err) {
      toast.error(normalizeError(err).message);
      reset();
    }
  }, [patch, reset]);

  const reject = useCallback(() => {
    const { callId } = useCallStore.getState();
    reset();
    if (callId) api.post(`/calls/${callId}/reject`).catch(() => undefined);
  }, [reset]);

  const cancel = useCallback(() => {
    const { callId } = useCallStore.getState();
    reset();
    if (callId) api.post(`/calls/${callId}/cancel`).catch(() => undefined);
  }, [reset]);

  const end = useCallback(() => {
    const { callId } = useCallStore.getState();
    reset();
    if (callId) api.post(`/calls/${callId}/end`).catch(() => undefined);
  }, [reset]);

  return { startCall, accept, reject, cancel, end };
}
