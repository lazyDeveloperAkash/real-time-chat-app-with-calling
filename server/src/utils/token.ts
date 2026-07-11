import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';

export interface TokenPayload {
  id: string;
}

type ExpiresIn = SignOptions['expiresIn'];

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRE as ExpiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRE as ExpiresIn,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
};
