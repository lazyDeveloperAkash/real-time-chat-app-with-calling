import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/utils/api-response';
import { setTokenCookies, clearTokenCookies } from '@/utils/cookie';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.signup(req.body);
      setTokenCookies(res, accessToken, refreshToken);
      res.status(201).json(new ApiResponse(201, { user }, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.signin(req.body);
      setTokenCookies(res, accessToken, refreshToken);
      res.status(200).json(new ApiResponse(200, { user }, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  static async signout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (userId) {
        await AuthService.signout(userId);
      }
      clearTokenCookies(res);
      res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
      const { user, accessToken, refreshToken } = await AuthService.refresh(incoming);
      setTokenCookies(res, accessToken, refreshToken);
      res.status(200).json(new ApiResponse(200, { user }, 'Token refreshed'));
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res
        .status(200)
        .json(new ApiResponse(200, null, 'If the email exists, a reset code has been sent'));
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.verifyOtp(req.body.email, req.body.otp);
      res.status(200).json(new ApiResponse(200, result, 'OTP verified'));
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      await AuthService.resetPassword(email, otp, newPassword);
      res.status(200).json(new ApiResponse(200, null, 'Password reset successfully'));
    } catch (error) {
      next(error);
    }
  }
}
