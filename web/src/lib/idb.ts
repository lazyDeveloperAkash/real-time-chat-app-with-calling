import { openDB, type IDBPDatabase } from "idb";
import { getIdbKey } from "@/lib/crypto/idb-key";
import { encryptJSON, decryptJSON, type Encrypted } from "@/lib/crypto/aes";
import type { Message } from "@/types/models";

/**
 * Encrypted IndexedDB store for the offline outbox. Each row is
 * `{ id, payload }` where `payload` is the AES-GCM ciphertext of the full item
 * — so inspecting IndexedDB in DevTools reveals only `{ iv, data }`, never the
 * message text. The `id` (a client tempId) is the plaintext primary key.
 */
const DB_NAME = "chatly-data";
const OUTBOX = "outbox";

export interface OutboxItem {
  id: string; // tempId
  conversationId: string; // real conversation/target id used for REST send
  message: Message;
  createdAt: number;
}

interface OutboxRow {
  id: string;
  payload: Encrypted;
}

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(OUTBOX)) {
          d.createObjectStore(OUTBOX, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function outboxPut(item: OutboxItem): Promise<void> {
  const key = await getIdbKey();
  const payload = await encryptJSON(key, item);
  const db = await getDb();
  await db.put(OUTBOX, { id: item.id, payload } satisfies OutboxRow);
}

export async function outboxAll(): Promise<OutboxItem[]> {
  const key = await getIdbKey();
  const db = await getDb();
  const rows = (await db.getAll(OUTBOX)) as OutboxRow[];
  const items = await Promise.all(rows.map((r) => decryptJSON<OutboxItem>(key, r.payload)));
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function outboxDelete(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(OUTBOX, id);
}
