import { SigninForm } from "@/components/auth/signin-form";

export default function SigninPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Welcome back</h2>
        <p className="text-muted-foreground text-sm">Sign in to continue.</p>
      </div>
      <SigninForm />
    </div>
  );
}
