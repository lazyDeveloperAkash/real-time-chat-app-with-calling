import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { sendMail } from '@/lib/mailer';
import { ApiError } from '@/utils/api-error';
import { logger } from '@/utils/logger';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/token';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const otpKey = (email: string) => `otp:reset:${email.toLowerCase()}`;

export class AuthService {
  static async signup(data: any) {
    const { name, email, contact, password } = data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { contact }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(409, 'Email already in use');
      }
      throw new ApiError(409, 'Contact number already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, contact, password: hashedPassword },
    });

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { user: this.sanitize(user), accessToken, refreshToken };
  }

  static async signin(data: any) {
    const { emailOrContact, password } = data;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrContact }, { contact: emailOrContact }] },
    });

    if (!user) throw new ApiError(401, 'Invalid credentials');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new ApiError(401, 'Invalid credentials');

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, isOnline: true, lastSeen: new Date() },
    });

    return { user: this.sanitize(user), accessToken, refreshToken };
  }

  static async signout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, isOnline: false, lastSeen: new Date() },
    });
  }

  /**
   * Rotates tokens: validates the incoming refresh token against the value
   * stored on the user record, then issues a fresh access + refresh pair.
   */
  static async refresh(incomingRefreshToken: string | undefined) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token missing');
    }

    let payload: { id: string };
    try {
      payload = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token has been revoked');
    }

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { user: this.sanitize(user), accessToken, refreshToken };
  }

  /**
   * Generates a 6-digit OTP, stores it in Redis (10 min TTL) and emails it.
   * Always resolves successfully to avoid leaking which emails are registered.
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.info({ email }, 'Password reset requested for unknown email');
      return;
    }

    const otp = randomInt(100000, 1000000).toString(); // always 6 digits
    await redis.set(otpKey(email), otp, 'EX', OTP_TTL_SECONDS);

    await sendMail({
      to: email,
      subject: 'Your password reset code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Password reset</h2>
          <p>Hi ${user.name}, use the code below to reset your password. It expires in 10 minutes.</p>
          <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold;">${otp}</p>
          <p style="color: #888;">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
      text: `Your password reset code is ${otp} (expires in 10 minutes).`,
    });
  }

  /** Verifies an OTP without consuming it (UX pre-check before showing the form). */
  static async verifyOtp(email: string, otp: string) {
    const stored = await redis.get(otpKey(email));
    if (!stored || stored !== otp) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }
    return { valid: true };
  }

  /** Verifies the OTP, sets the new password, and revokes existing sessions. */
  static async resetPassword(email: string, otp: string, newPassword: string) {
    const stored = await redis.get(otpKey(email));
    if (!stored || stored !== otp) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(404, 'User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, refreshToken: null },
    });

    await redis.del(otpKey(email));
  }

  private static sanitize<T extends { password?: string; refreshToken?: string | null }>(
    user: T,
  ) {
    const { password: _p, refreshToken: _r, ...rest } = user;
    return rest;
  }
}
