import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { authRateLimiter } from '@/middlewares/rate-limit.middleware';
import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '@/schemas/auth.schema';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication & session management
 */

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, contact, email, password]
 *             properties:
 *               name: { type: string, minLength: 2, example: "Akash" }
 *               contact: { type: string, example: "9876543210" }
 *               email: { type: string, format: email, example: "akash@example.com" }
 *               password: { type: string, minLength: 6, example: "StrongPass123" }
 *     responses:
 *       201: { description: User created, tokens set as HTTP-only cookies }
 *       409: { description: Email or contact already in use }
 */
router.post('/signup', authRateLimiter, validate(signupSchema), AuthController.signup);

/**
 * @openapi
 * /api/auth/signin:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email/contact + password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailOrContact, password]
 *             properties:
 *               emailOrContact: { type: string, example: "akash@example.com" }
 *               password: { type: string, example: "StrongPass123" }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/signin', authRateLimiter, validate(signinSchema), AuthController.signin);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate tokens using the refresh token cookie
 *     responses:
 *       200: { description: New access & refresh tokens issued }
 *       401: { description: Missing/invalid/revoked refresh token }
 */
router.post('/refresh', authRateLimiter, AuthController.refresh);

/**
 * @openapi
 * /api/auth/signout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear tokens
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/signout', authMiddleware, AuthController.signout);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send a password reset OTP by email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: OTP sent if the email exists }
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);

/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify a password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200: { description: OTP valid }
 *       400: { description: Invalid or expired OTP }
 */
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a valid OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, example: "123456" }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Password reset }
 *       400: { description: Invalid or expired OTP }
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

export default router;
