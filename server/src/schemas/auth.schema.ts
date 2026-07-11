import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    contact: z.string().length(10, "Contact must be exactly 10 digits").regex(/^\d+$/, "Contact must contain only digits"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    emailOrContact: z.string().min(1, "Email or contact is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/),
    newPassword: z.string().min(6, "Password must be at least 6 characters").max(128),
  }),
});
