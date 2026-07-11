import { userRoom } from '../presence';
import type { TypedServer, TypedSocket } from '../types';

/**
 * PLACEHOLDER WebRTC signaling relay. No media is handled server-side — the
 * server only forwards SDP offers/answers and ICE candidates between peers.
 * The chat UI ships with dummy call buttons for now; these handlers make the
 * backend ready for native WebRTC without further schema/API changes.
 */
export function registerCallHandlers(io: TypedServer, socket: TypedSocket): void {
  const from = socket.data.userId;

  socket.on('call:offer', ({ targetUserId, sdp, callType }) => {
    io.to(userRoom(targetUserId)).emit('call:incoming', { from, sdp, callType });
  });

  socket.on('call:answer', ({ callerUserId, sdp }) => {
    io.to(userRoom(callerUserId)).emit('call:answered', { from, sdp });
  });

  socket.on('call:ice', ({ targetUserId, candidate }) => {
    io.to(userRoom(targetUserId)).emit('call:ice', { from, candidate });
  });

  socket.on('call:reject', ({ callerUserId }) => {
    io.to(userRoom(callerUserId)).emit('call:rejected', { from });
  });

  socket.on('call:end', ({ targetUserId }) => {
    io.to(userRoom(targetUserId)).emit('call:ended', { from });
  });
}
