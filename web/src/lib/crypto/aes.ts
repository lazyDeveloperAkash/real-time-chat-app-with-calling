import { bytesToBase64Url, base64UrlToBytes } from "@/lib/utils";

/** AES-GCM ciphertext bundle, both fields base64url-encoded. */
export interface Encrypted {
  iv: string;
  data: string;
}

/** Encrypt any JSON-serializable value with a random 96-bit IV. */
export async function encryptJSON(key: CryptoKey, value: unknown): Promise<Encrypted> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(new Uint8Array(ct)),
  };
}

/** Decrypt a bundle produced by {@link encryptJSON}. */
export async function decryptJSON<T>(key: CryptoKey, enc: Encrypted): Promise<T> {
  const iv = base64UrlToBytes(enc.iv);
  const ct = base64UrlToBytes(enc.data);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(pt)) as T;
}
