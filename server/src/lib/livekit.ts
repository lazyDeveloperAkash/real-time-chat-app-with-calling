import { AccessToken, RoomServiceClient, WebhookReceiver } from 'livekit-server-sdk';
import { env } from '@/config/env';
import { ApiError } from '@/utils/api-error';

/** True when the three LiveKit env vars are present. */
export const isLivekitConfigured = (): boolean =>
  Boolean(env.LIVEKIT_URL && env.LIVEKIT_API_KEY && env.LIVEKIT_API_SECRET);

function assertConfigured(): void {
  if (!isLivekitConfigured()) {
    throw new ApiError(503, 'Calling is not configured on this server');
  }
}

/** The wss:// client URL handed to the browser. */
export const livekitUrl = (): string => env.LIVEKIT_URL;

interface TokenOptions {
  identity: string;
  name: string;
  room: string;
  canPublish?: boolean;
}

/** Mint a short-lived LiveKit join token (JWT) for a user + room. */
export async function mintToken({
  identity,
  name,
  room,
  canPublish = true,
}: TokenOptions): Promise<string> {
  assertConfigured();
  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: '2h',
  });
  at.addGrant({ roomJoin: true, room, canPublish, canSubscribe: true });
  return at.toJwt();
}

let roomService: RoomServiceClient | null = null;

/** Server-side room admin client (deleteRoom, removeParticipant, listParticipants). */
export function getRoomService(): RoomServiceClient {
  assertConfigured();
  if (!roomService) {
    const httpUrl = env.LIVEKIT_URL.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
    roomService = new RoomServiceClient(httpUrl, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
  }
  return roomService;
}

/** Verifies incoming LiveKit webhook payloads. */
export function getWebhookReceiver(): WebhookReceiver {
  return new WebhookReceiver(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
}
