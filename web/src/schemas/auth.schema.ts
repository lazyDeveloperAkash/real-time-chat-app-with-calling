import { z } from "zod";

export const signinSchema = z.object({
  emailOrContact: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});
export type SigninInput = z.infer<typeof signinSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  contact: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotEmailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotEmailInput = z.infer<typeof forgotEmailSchema>;

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
