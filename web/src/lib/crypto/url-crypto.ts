import { bytesToBase64Url, base64UrlToBytes } from "@/lib/utils";

/**
 * Reversible obfuscation of dynamic route params so URLs show an opaque token
 * instead of raw UUIDs. Deterministic: the IV is derived from the id itself
 * (SHA-256 → first 12 bytes) and prepended to the ciphertext, so the same id
 * always yields the same stable, bookmarkable token.
 *
 * NOTE: this is obfuscation, not a security boundary — the client must be able
 * to reverse it, so NEXT_PUBLIC_URL_SECRET is not a real secret. The backend
 * still authorizes every request by the authenticated user.
 */
let keyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    const secret = process.env.NEXT_PUBLIC_URL_SECRET || "insecure-dev-secret";
    keyPromise = crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(secret))
      .then((hash) =>
        crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
          "encrypt",
          "decrypt",
        ]),
      );
  }
  return keyPromise;
}

async function ivFor(id: string): Promise<Uint8Array<ArrayBuffer>> {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id));
  return new Uint8Array(h).slice(0, 12);
}

export async function encodeId(id: string): Promise<string> {
  const key = await getKey();
  const iv = await ivFor(id);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(id)),
  );
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return bytesToBase64Url(out);
}

export async function decodeId(token: string): Promise<string> {
  const key = await getKey();
  const bytes = base64UrlToBytes(token);
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}
