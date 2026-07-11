import { Server, Socket } from 'socket.io';
import type { DefaultEventsMap } from 'socket.io';

/** Events the server emits to clients. */
export interface ServerToClientEvents {
  'new-message': (p: { message: unknown }) => void;
  'message-delivered': (p: { messageId: string }) => void;
  'message-read': (p: { conversationId: string; readBy: string }) => void;
  'user-typing': (p: { userId: string; conversationId: string; isTyping: boolean }) => void;
  'user-online': (p: { userId: string; isOnline: boolean }) => void;

  // ── Future (Calling) — signaling relay only ──
  'call:incoming': (p: { from: string; sdp: unknown; callType: string }) => void;
  'call:answered': (p: { from: string; sdp: unknown }) => void;
  'call:ice': (p: { from: string; candidate: unknown }) => void;
  'call:rejected': (p: { from: string }) => void;
  'call:ended': (p: { from: string }) => void;
}

export type MessageAck = { success: true; message: unknown } | { success: false; error: string };

/** Events clients emit to the server. */
export interface ClientToServerEvents {
  'send-message': (
    p: { receiverId: string; content: string; type?: string },
    ack?: (res: MessageAck) => void,
  ) => void;
  'message-read': (p: { conversationId: string }) => void;
  typing: (p: { conversationId: string; isTyping: boolean }) => void;
  'join-rooms': (p: { roomIds: string[] }) => void;

  // ── Future (Calling) ──
  'call:offer': (p: { targetUserId: string; sdp: unknown; callType: string }) => void;
  'call:answer': (p: { callerUserId: string; sdp: unknown }) => void;
  'call:ice': (p: { targetUserId: string; candidate: unknown }) => void;
  'call:reject': (p: { callerUserId: string }) => void;
  'call:end': (p: { targetUserId: string }) => void;
}

export interface SocketData {
  userId: string;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;
