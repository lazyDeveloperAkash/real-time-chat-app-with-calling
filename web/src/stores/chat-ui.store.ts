import { create } from "zustand";

interface ChatUiState {
  /** conversationId -> (userId -> isTyping) */
  typing: Record<string, Record<string, boolean>>;
  /** userId -> isOnline */
  online: Record<string, boolean>;
  /** conversationId -> draft text */
  drafts: Record<string, string>;
  socketConnected: boolean;
  /** The conversation currently open in the thread pane (real conversationId). */
  activeConversationId: string | null;

  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setOnline: (userId: string, isOnline: boolean) => void;
  setDraft: (conversationId: string, text: string) => void;
  setSocketConnected: (connected: boolean) => void;
  setActiveConversation: (conversationId: string | null) => void;
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  typing: {},
  online: {},
  drafts: {},
  socketConnected: false,
  activeConversationId: null,

  setTyping: (conversationId, userId, isTyping) =>
    set((s) => {
      const conv = { ...(s.typing[conversationId] ?? {}) };
      if (isTyping) conv[userId] = true;
      else delete conv[userId];
      return { typing: { ...s.typing, [conversationId]: conv } };
    }),

  setOnline: (userId, isOnline) =>
    set((s) => ({ online: { ...s.online, [userId]: isOnline } })),

  setDraft: (conversationId, text) =>
    set((s) => ({ drafts: { ...s.drafts, [conversationId]: text } })),

  setSocketConnected: (socketConnected) => set({ socketConnected }),

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
}));
