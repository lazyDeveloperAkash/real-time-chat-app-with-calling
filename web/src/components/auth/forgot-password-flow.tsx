"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  forgotEmailSchema,
  otpSchema,
  resetPasswordSchema,
  type ForgotEmailInput,
  type OtpInput,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { useForgotPassword, useVerifyOtp, useResetPassword } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "./field-error";

type Step = "email" | "otp" | "reset";

export function ForgotPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const forgot = useForgotPassword();
  const verify = useVerifyOtp();
  const reset = useResetPassword();

  const emailForm = useForm<ForgotEmailInput>({ resolver: zodResolver(forgotEmailSchema) });
  const otpForm = useForm<OtpInput>({ resolver: zodResolver(otpSchema) });
  const resetForm = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const submitEmail = emailForm.handleSubmit(({ email }) =>
    forgot.mutate(email, {
      onSuccess: () => {
        setEmail(email);
        setStep("otp");
        toast.success("If that email exists, a code is on its way.");
      },
    }),
  );

  const submitOtp = otpForm.handleSubmit(({ otp }) =>
    verify.mutate(
      { email, otp },
      {
        onSuccess: () => {
          setOtp(otp);
          setStep("reset");
        },
      },
    ),
  );

  const submitReset = resetForm.handleSubmit(({ newPassword }) =>
    reset.mutate(
      { email, otp, newPassword },
      {
        onSuccess: () => {
          toast.success("Password reset. Please sign in.");
          router.replace("/signin");
        },
      },
    ),
  );

  if (step === "email") {
    return (
      <form onSubmit={submitEmail} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...emailForm.register("email")}
          />
          <FieldError message={emailForm.formState.errors.email?.message} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={forgot.isPending}>
          {forgot.isPending && <Loader2 className="animate-spin" />}
          Send reset code
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          <Link href="/signin" className="hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={submitOtp} className="space-y-4" noValidate>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code sent to <span className="text-foreground">{email}</span>.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            {...otpForm.register("otp")}
          />
          <FieldError message={otpForm.formState.errors.otp?.message} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={verify.isPending}>
          {verify.isPending && <Loader2 className="animate-spin" />}
          Verify code
        </Button>
        <button
          type="button"
          onClick={() => setStep("email")}
          className="text-muted-foreground hover:text-foreground w-full text-center text-sm"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitReset} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          {...resetForm.register("newPassword")}
        />
        <FieldError message={resetForm.formState.errors.newPassword?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...resetForm.register("confirmPassword")}
        />
        <FieldError message={resetForm.formState.errors.confirmPassword?.message} />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={reset.isPending}>
        {reset.isPending && <Loader2 className="animate-spin" />}
        Reset password
      </Button>
    </form>
  );
}
