import { create } from "zustand";
import type { CallType } from "@/types/socket";

export type CallStatus = "idle" | "outgoing" | "incoming" | "connecting" | "active";

export interface CallPeer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CallState {
  status: CallStatus;
  callId: string | null;
  roomName: string | null;
  token: string | null; // LiveKit join token (once we have one)
  url: string | null; // LiveKit wss url
  callType: CallType;
  isGroup: boolean;
  conversationId: string | null;
  /** For incoming: the caller. For outgoing 1:1: the callee. */
  peer: CallPeer | null;
  groupName?: string;

  patch: (partial: Partial<CallState>) => void;
  reset: () => void;
}

const initial = {
  status: "idle" as CallStatus,
  callId: null,
  roomName: null,
  token: null,
  url: null,
  callType: "AUDIO" as CallType,
  isGroup: false,
  conversationId: null,
  peer: null,
  groupName: undefined,
};

export const useCallStore = create<CallState>((set) => ({
  ...initial,
  patch: (partial) => set(partial),
  reset: () => set(initial),
}));
