import type { QueryClient } from "@tanstack/react-query";
import { outboxAll, outboxDelete } from "@/lib/idb";
import { sendMessageRest } from "@/lib/chat-api";
import { reconcileTemp, bumpConversation } from "@/lib/message-cache";

let flushing = false;

/**
 * Drains the encrypted IndexedDB outbox via the REST fallback (used when the
 * sender was offline). Reconciles each optimistic temp message with the
 * server-confirmed one. Kept single-flight to avoid double sends.
 */
export async function flushOutbox(qc: QueryClient, meId?: string): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const items = await outboxAll();
    for (const item of items) {
      try {
        const real = await sendMessageRest(
          item.conversationId,
          item.message.content,
          item.message.type,
        );
        reconcileTemp(qc, item.conversationId, item.id, real);
        bumpConversation(qc, real, meId, null);
        await outboxDelete(item.id);
      } catch {
        // Leave in the queue; will retry on next flush.
      }
    }
  } finally {
    flushing = false;
  }
}
