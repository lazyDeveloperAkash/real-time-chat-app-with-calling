import { ExtendedError } from 'socket.io';
import { verifyAccessToken } from '@/utils/token';
import type { TypedSocket } from './types';

/** Minimal cookie header parser (avoids an extra dependency). */
function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    out[k] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

/**
 * Socket.IO handshake auth. Accepts a JWT from `handshake.auth.token`
 * (explicit) or the `accessToken` HTTP-only cookie sent with the WS upgrade.
 */
export const socketAuth = (socket: TypedSocket, next: (err?: ExtendedError) => void): void => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token =
      (socket.handshake.auth?.token as string | undefined) || cookies.accessToken;

    if (!token) {
      return next(new Error('Unauthorized: no token provided'));
    }

    const payload = verifyAccessToken(token);
    socket.data.userId = payload.id;
    next();
  } catch {
    next(new Error('Unauthorized: invalid or expired token'));
  }
};
