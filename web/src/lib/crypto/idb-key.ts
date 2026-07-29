import { openDB } from "idb";

/**
 * Get-or-create the AES-256-GCM key used to encrypt everything we persist to
 * IndexedDB. The key is generated as **non-extractable** and the CryptoKey
 * object itself is stored in IndexedDB (browsers can structured-clone it).
 * Result: the key can be used to encrypt/decrypt but its raw bytes can never be
 * exported or read — even by someone inspecting IndexedDB in DevTools.
 */
const DB_NAME = "chatly-secure";
const STORE = "keys";
const KEY_ID = "idb-aes-key";

let cached: Promise<CryptoKey> | null = null;

export function getIdbKey(): Promise<CryptoKey> {
  if (!cached) cached = init();
  return cached;
}

async function init(): Promise<CryptoKey> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    },
  });

  const existing = (await db.get(STORE, KEY_ID)) as CryptoKey | undefined;
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"],
  );
  await db.put(STORE, key, KEY_ID);
  return key;
}
