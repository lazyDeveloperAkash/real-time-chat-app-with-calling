import type { LastMessage, MessageType } from "@/types/models";

const ICONS: Partial<Record<MessageType, string>> = {
  IMAGE: "📷 Photo",
  FILE: "📎 File",
  AUDIO_MSG: "🎤 Voice message",
  VIDEO_MSG: "🎥 Video",
};

/** One-line preview for the conversation list. */
export function messagePreview(m?: LastMessage | null, meId?: string): string {
  if (!m) return "No messages yet";
  const prefix = meId && m.senderId === meId ? "You: " : "";
  return prefix + (ICONS[m.type] ?? m.content);
}
