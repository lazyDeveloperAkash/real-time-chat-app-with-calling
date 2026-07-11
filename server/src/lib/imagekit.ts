import ImageKit from 'imagekit';
import { env } from '@/config/env';

export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Returns short-lived authentication params the client uses to upload
 * directly to ImageKit (token, expire, signature) — keeps the private key
 * on the server only.
 */
export const getImageKitAuthParams = () => imagekit.getAuthenticationParameters();
