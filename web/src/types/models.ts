export type MessageType = "TEXT" | "IMAGE" | "FILE" | "AUDIO_MSG" | "VIDEO_MSG" | "SYSTEM";

// PENDING is a client-only status for optimistic/queued messages.
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ";

export interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email?: string;
  contact?: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface MessageSender {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt?: string;
  sender?: MessageSender;
  // client-only fields (optimistic / offline)
  tempId?: string;
  pending?: boolean;
  failed?: boolean;
}

/** The "other side" of a conversation — a user (DM) or a group. */
export interface ChatEntity {
  id: string;
  name: string;
  avatarUrl: string | null;
  isOnline?: boolean;
}

export interface LastMessage {
  content: string;
  type: MessageType;
  createdAt: string;
  status: MessageStatus;
  senderId: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage: LastMessage | null;
  chatEntity: ChatEntity | null;
}

export type GroupRole = "ADMIN" | "MEMBER";

export interface GroupMember {
  id: string;
  role: GroupRole;
  user: PublicUser;
}

export interface Group {
  id: string;
  name: string;
  avatarUrl: string | null;
  creatorId: string;
  conversationId: string;
  members: GroupMember[];
}
