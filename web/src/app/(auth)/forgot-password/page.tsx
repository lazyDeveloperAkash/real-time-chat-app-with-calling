import { ForgotPasswordFlow } from "@/components/auth/forgot-password-flow";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Reset password</h2>
        <p className="text-muted-foreground text-sm">
          We&apos;ll email you a verification code.
        </p>
      </div>
      <ForgotPasswordFlow />
    </div>
  );
}
