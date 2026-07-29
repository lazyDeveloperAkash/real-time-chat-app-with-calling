"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { api } from "@/lib/axios";
import { useCallStore } from "@/stores/call.store";
import { startRing, stopRing } from "@/lib/ringtone";
import { IncomingCallModal } from "@/components/call/incoming-call-modal";
import { CallWindow } from "@/components/call/call-window";
import type { CallType } from "@/types/socket";

interface IncomingPayload {
  callId: string;
  roomName: string;
  callType: CallType;
  conversationId: string;
  isGroup: boolean;
  from: { id: string; name: string; avatarUrl: string | null };
  groupName?: string;
}

const NO_ANSWER_MS = 45_000;

export function CallProvider({ children }: { children: React.ReactNode }) {
  // Wire socket call:* events to the call store (once).
  useEffect(() => {
    const socket = getSocket();
    const store = useCallStore;

    const onIncoming = (p: IncomingPayload) => {
      if (store.getState().status !== "idle") {
        // Already busy → auto-decline (server treats as reject).
        api.post(`/calls/${p.callId}/reject`).catch(() => undefined);
        return;
      }
      store.getState().patch({
        status: "incoming",
        callId: p.callId,
        roomName: p.roomName,
        callType: p.callType,
        conversationId: p.conversationId,
        isGroup: p.isGroup,
        groupName: p.groupName,
        peer: p.from,
      });
    };

    const onAccepted = () => {
      const st = store.getState();
      if (st.status === "outgoing") st.patch({ status: "active" });
    };
    const onRejected = () => {
      const st = store.getState();
      if (st.status === "outgoing" && !st.isGroup) {
        toast("Call declined");
        st.reset();
      }
    };
    const onCanceled = () => {
      const st = store.getState();
      if (st.status === "incoming" || st.status === "outgoing") st.reset();
    };
    const onEnded = () => store.getState().reset();
    const onBusy = () => {
      const st = store.getState();
      if (st.status === "outgoing") {
        toast("User is busy");
        st.reset();
      }
    };
    const onUnavailable = () => {
      const st = store.getState();
      if (st.status === "outgoing") {
        toast("User is unavailable");
        st.reset();
      }
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:accepted", onAccepted);
    socket.on("call:rejected", onRejected);
    socket.on("call:canceled", onCanceled);
    socket.on("call:ended", onEnded);
    socket.on("call:busy", onBusy);
    socket.on("call:unavailable", onUnavailable);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:accepted", onAccepted);
      socket.off("call:rejected", onRejected);
      socket.off("call:canceled", onCanceled);
      socket.off("call:ended", onEnded);
      socket.off("call:busy", onBusy);
      socket.off("call:unavailable", onUnavailable);
    };
  }, []);

  const status = useCallStore((s) => s.status);
  const callId = useCallStore((s) => s.callId);

  // Ringtone / ringback follows call status.
  useEffect(() => {
    if (status === "incoming") startRing("incoming");
    else if (status === "outgoing") startRing("outgoing");
    else stopRing();
    return () => stopRing();
  }, [status]);

  // Caller no-answer timeout → cancel.
  useEffect(() => {
    if (status !== "outgoing" || !callId) return;
    const t = setTimeout(() => {
      api.post(`/calls/${callId}/cancel`).catch(() => undefined);
      useCallStore.getState().reset();
      toast("No answer");
    }, NO_ANSWER_MS);
    return () => clearTimeout(t);
  }, [status, callId]);

  return (
    <>
      {children}
      <IncomingCallModal />
      <CallWindow />
    </>
  );
}
