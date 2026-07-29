import { create } from "zustand";
import { encodeId } from "@/lib/crypto/url-crypto";

interface IdCodecState {
  toToken: Record<string, string>; // realId -> token
  toId: Record<string, string>; // token -> realId
  register: (realId: string, token: string) => void;
}

export const useIdCodec = create<IdCodecState>((set) => ({
  toToken: {},
  toId: {},
  register: (realId, token) =>
    set((s) =>
      s.toToken[realId] === token
        ? s
        : {
            toToken: { ...s.toToken, [realId]: token },
            toId: { ...s.toId, [token]: realId },
          },
    ),
}));

/** Encode a batch of ids and populate the store (call when a list loads). */
export async function primeIds(ids: string[]): Promise<void> {
  const { register, toToken } = useIdCodec.getState();
  await Promise.all(
    ids
      .filter((id) => id && !toToken[id])
      .map(async (id) => register(id, await encodeId(id))),
  );
}
