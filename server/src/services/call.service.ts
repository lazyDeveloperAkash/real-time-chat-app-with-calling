import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/api-error';
import { logger } from '@/utils/logger';
import { mintToken, getRoomService, livekitUrl } from '@/lib/livekit';
import { getIO } from '@/socket';
import { userRoom, isUserOnline } from '@/socket/presence';
import { deliverMessage } from '@/socket/delivery';
import { ChatService } from '@/services/chat.service';
import type { CallType } from '@prisma/client';

function roomFor(callId: string) {
  return `call_${callId}`;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Writes a SYSTEM message into the conversation and delivers it in real time. */
async function writeSystemMessage(callerId: string, conversationId: string, content: string) {
  try {
    const result = await ChatService.sendMessage(callerId, conversationId, content, 'SYSTEM');
    await deliverMessage(getIO(), result as never);
  } catch (err) {
    logger.error({ err: (err as Error).message }, 'Failed to write call system message');
  }
}

/** A user is "busy" if they are still joined to another ongoing call. */
async function isUserBusy(userId: string): Promise<boolean> {
  const active = await prisma.callParticipant.findFirst({
    where: { userId, leftAt: null, callLog: { status: 'ONGOING' } },
    select: { id: true },
  });
  return !!active;
}

async function assertParticipant(conversationId: string, userId: string) {
  const p = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!p) throw new ApiError(403, 'You are not a participant of this conversation');
}

export class CallService {
  /** Caller starts a call: creates the CallLog, mints their token, rings callees. */
  static async start(callerId: string, conversationId: string, type: CallType) {
    await assertParticipant(conversationId, callerId);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { select: { userId: true } },
        group: { select: { name: true } },
      },
    });
    if (!conversation) throw new ApiError(404, 'Conversation not found');

    const caller = await prisma.user.findUnique({
      where: { id: callerId },
      select: { id: true, name: true, avatarUrl: true },
    });
    if (!caller) throw new ApiError(404, 'Caller not found');

    const calleeIds = conversation.participants
      .map((p) => p.userId)
      .filter((id) => id !== callerId);

    const call = await prisma.callLog.create({
      data: {
        conversationId,
        callerId,
        roomName: 'pending',
        type,
        status: 'RINGING',
        participants: { create: { userId: callerId, joinedAt: new Date() } },
      },
    });
    const roomName = roomFor(call.id);
    await prisma.callLog.update({ where: { id: call.id }, data: { roomName } });

    const token = await mintToken({ identity: callerId, name: caller.name, room: roomName });

    // Ring online, non-busy callees.
    const io = getIO();
    let ringing = 0;
    for (const calleeId of calleeIds) {
      const online = await isUserOnline(calleeId);
      if (!online) continue;
      if (await isUserBusy(calleeId)) {
        io.to(userRoom(callerId)).emit('call:busy', { callId: call.id, userId: calleeId });
        continue;
      }
      ringing += 1;
      io.to(userRoom(calleeId)).emit('call:incoming', {
        callId: call.id,
        roomName,
        callType: type,
        conversationId,
        isGroup: conversation.isGroup,
        from: caller,
        groupName: conversation.group?.name,
      });
    }

    if (ringing === 0) {
      await prisma.callLog.update({ where: { id: call.id }, data: { status: 'MISSED' } });
      io.to(userRoom(callerId)).emit('call:unavailable', { callId: call.id, userId: calleeIds[0] ?? '' });
      await writeSystemMessage(callerId, conversationId, `Missed ${type.toLowerCase()} call`);
    }

    return { callId: call.id, roomName, token, url: livekitUrl(), callType: type, ringing: ringing > 0 };
  }

  /** Callee accepts: mints their token, joins them, flips call to ONGOING. */
  static async accept(userId: string, callId: string) {
    const call = await prisma.callLog.findUnique({ where: { id: callId } });
    if (!call) throw new ApiError(404, 'Call not found');
    if (call.status === 'ENDED' || call.status === 'CANCELED') {
      throw new ApiError(409, 'Call is no longer active');
    }
    await assertParticipant(call.conversationId, userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    await prisma.callParticipant.upsert({
      where: { callLogId_userId: { callLogId: callId, userId } },
      update: { joinedAt: new Date(), leftAt: null },
      create: { callLogId: callId, userId, joinedAt: new Date() },
    });

    if (call.status === 'RINGING') {
      await prisma.callLog.update({
        where: { id: callId },
        data: { status: 'ONGOING', startedAt: new Date() },
      });
    }

    const token = await mintToken({
      identity: userId,
      name: user?.name ?? 'User',
      room: call.roomName,
    });

    getIO().to(userRoom(call.callerId)).emit('call:accepted', { callId, userId });

    return { token, url: livekitUrl(), roomName: call.roomName, callType: call.type };
  }

  static async reject(userId: string, callId: string) {
    const call = await prisma.callLog.findUnique({ where: { id: callId } });
    if (!call) throw new ApiError(404, 'Call not found');

    getIO().to(userRoom(call.callerId)).emit('call:rejected', { callId, userId });

    // If nobody (other than caller) has joined, the call is declined.
    const joinedOthers = await prisma.callParticipant.count({
      where: { callLogId: callId, userId: { not: call.callerId }, joinedAt: { not: null } },
    });
    if (call.status === 'RINGING' && joinedOthers === 0) {
      await prisma.callLog.update({ where: { id: callId }, data: { status: 'REJECTED' } });
    }
  }

  /** Caller cancels before it was answered. */
  static async cancel(callerId: string, callId: string) {
    const call = await prisma.callLog.findUnique({ where: { id: callId } });
    if (!call) throw new ApiError(404, 'Call not found');
    if (call.callerId !== callerId) throw new ApiError(403, 'Only the caller can cancel');

    if (call.status === 'RINGING') {
      await prisma.callLog.update({ where: { id: callId }, data: { status: 'CANCELED' } });
      await writeSystemMessage(callerId, call.conversationId, `Missed ${call.type.toLowerCase()} call`);
    }

    const io = getIO();
    const others = await prisma.conversationParticipant.findMany({
      where: { conversationId: call.conversationId, userId: { not: callerId } },
      select: { userId: true },
    });
    for (const o of others) io.to(userRoom(o.userId)).emit('call:canceled', { callId });

    await getRoomService().deleteRoom(call.roomName).catch(() => undefined);
  }

  /** A participant leaves; finalize the call when the room empties. */
  static async leave(userId: string, callId: string) {
    const call = await prisma.callLog.findUnique({ where: { id: callId } });
    if (!call) return;

    await prisma.callParticipant.updateMany({
      where: { callLogId: callId, userId, leftAt: null },
      data: { leftAt: new Date() },
    });

    const stillIn = await prisma.callParticipant.count({
      where: { callLogId: callId, joinedAt: { not: null }, leftAt: null },
    });

    if (stillIn <= 1 && call.status === 'ONGOING') {
      await this.finalize(callId);
    }
  }

  /** Marks a call ENDED, computes duration, writes the "Call ended" message. */
  static async finalize(callId: string) {
    const call = await prisma.callLog.findUnique({ where: { id: callId } });
    if (!call || call.status === 'ENDED') return;

    const endedAt = new Date();
    const durationSec = call.startedAt
      ? Math.max(0, Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000))
      : 0;

    await prisma.callLog.update({
      where: { id: callId },
      data: { status: call.startedAt ? 'ENDED' : 'MISSED', endedAt, durationSec },
    });
    await prisma.callParticipant.updateMany({
      where: { callLogId: callId, leftAt: null },
      data: { leftAt: endedAt },
    });

    const io = getIO();
    const parts = await prisma.conversationParticipant.findMany({
      where: { conversationId: call.conversationId },
      select: { userId: true },
    });
    for (const p of parts) io.to(userRoom(p.userId)).emit('call:ended', { callId });

    const content = call.startedAt
      ? `${call.type === 'VIDEO' ? 'Video' : 'Voice'} call · ${formatDuration(durationSec)}`
      : `Missed ${call.type.toLowerCase()} call`;
    await writeSystemMessage(call.callerId, call.conversationId, content);

    await getRoomService().deleteRoom(call.roomName).catch(() => undefined);
  }

  /** Robust finalization driven by verified LiveKit webhooks. */
  static async handleWebhookEvent(evt: {
    event: string;
    room?: { name?: string };
    participant?: { identity?: string };
  }) {
    const roomName = evt.room?.name;
    if (!roomName) return;
    const call = await prisma.callLog.findUnique({ where: { roomName } });
    if (!call) return;

    if (evt.event === 'participant_left' && evt.participant?.identity) {
      await this.leave(evt.participant.identity, call.id);
    } else if (evt.event === 'room_finished') {
      await this.finalize(call.id);
    }
  }

  static async history(userId: string, cursor: string | undefined, limit: number) {
    const calls = await prisma.callLog.findMany({
      where: { OR: [{ callerId: userId }, { participants: { some: { userId } } }] },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        caller: { select: { id: true, name: true, avatarUrl: true } },
        conversation: { include: { group: { select: { name: true } } } },
      },
    });

    let nextCursor: string | undefined;
    if (calls.length > limit) nextCursor = calls.pop()?.id;
    return { calls, nextCursor };
  }
}
