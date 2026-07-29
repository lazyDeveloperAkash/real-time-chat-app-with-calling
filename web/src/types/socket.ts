import type { Message } from "./models";

/** Ack returned by the server for a send-message emit. */
export type MessageAck =
  | { success: true; message: Message }
  | { success: false; error: string };

/** Events the server pushes to this client. */
export interface ServerToClientEvents {
  "new-message": (p: { message: Message }) => void;
  "message-delivered": (p: { messageId: string }) => void;
  "message-read": (p: { conversationId: string; readBy: string }) => void;
  "user-typing": (p: { userId: string; conversationId: string; isTyping: boolean }) => void;
  "user-online": (p: { userId: string; isOnline: boolean }) => void;

  // ── Calling (ring/invitation channel; media handled by LiveKit) ──
  "call:incoming": (p: {
    callId: string;
    roomName: string;
    callType: CallType;
    conversationId: string;
    isGroup: boolean;
    from: { id: string; name: string; avatarUrl: string | null };
    groupName?: string;
  }) => void;
  "call:accepted": (p: { callId: string; userId: string }) => void;
  "call:rejected": (p: { callId: string; userId: string }) => void;
  "call:canceled": (p: { callId: string }) => void;
  "call:ended": (p: { callId: string }) => void;
  "call:busy": (p: { callId: string; userId: string }) => void;
  "call:unavailable": (p: { callId: string; userId: string }) => void;
}

export type CallType = "AUDIO" | "VIDEO";

/** Events this client emits to the server. */
export interface ClientToServerEvents {
  "send-message": (
    p: { receiverId: string; content: string; type?: string },
    ack?: (res: MessageAck) => void,
  ) => void;
  "message-read": (p: { conversationId: string }) => void;
  typing: (p: { conversationId: string; isTyping: boolean }) => void;
  "join-rooms": (p: { roomIds: string[] }) => void;
  // Call lifecycle is driven over REST (/api/calls/*); the server pushes call:*
  // events on the ServerToClientEvents channel.
}
