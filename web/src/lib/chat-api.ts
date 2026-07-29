import { api, unwrap } from "@/lib/axios";
import type { Message, MessageType } from "@/types/models";

/** REST send — used as the offline/socket-down fallback path. */
export function sendMessageRest(
  conversationId: string,
  content: string,
  type: MessageType = "TEXT",
): Promise<Message> {
  return unwrap<Message>(api.post(`/chats/${conversationId}/messages`, { content, type }));
}
