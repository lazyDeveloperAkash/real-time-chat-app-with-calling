"use client";

import { useEffect, useState } from "react";
import { useIdCodec } from "@/stores/id-codec.store";
import { encodeId, decodeId } from "@/lib/crypto/url-crypto";

/** Returns the opaque URL token for a real id, encoding lazily if needed. */
export function useEncodedId(realId?: string): string | undefined {
  const token = useIdCodec((s) => (realId ? s.toToken[realId] : undefined));

  useEffect(() => {
    if (realId && !token) {
      encodeId(realId).then((t) => useIdCodec.getState().register(realId, t));
    }
  }, [realId, token]);

  return token;
}

/** Resolves a URL token back to a real id (async on cold load). */
export function useDecodedId(token?: string): { id?: string; loading: boolean } {
  const cached = useIdCodec((s) => (token ? s.toId[token] : undefined));
  const [id, setId] = useState<string | undefined>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let active = true;
    if (!token) {
      setId(undefined);
      setLoading(false);
      return;
    }
    if (cached) {
      setId(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    decodeId(token)
      .then((real) => {
        if (!active) return;
        useIdCodec.getState().register(real, token);
        setId(real);
      })
      .catch(() => active && setId(undefined))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, cached]);

  return { id, loading };
}
