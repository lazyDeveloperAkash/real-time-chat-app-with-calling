import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Create your account</h2>
        <p className="text-muted-foreground text-sm">Start chatting in seconds.</p>
      </div>
      <SignupForm />
    </div>
  );
}
