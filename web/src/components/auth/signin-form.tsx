"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signinSchema, type SigninInput } from "@/schemas/auth.schema";
import { useSignin } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "./field-error";

export function SigninForm() {
  const router = useRouter();
  const signin = useSignin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninInput>({ resolver: zodResolver(signinSchema) });

  const onSubmit = handleSubmit((data) =>
    signin.mutate(data, { onSuccess: () => router.replace("/chat") }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="emailOrContact">Email or phone</Label>
        <Input
          id="emailOrContact"
          autoComplete="username"
          placeholder="you@example.com"
          {...register("emailOrContact")}
        />
        <FieldError message={errors.emailOrContact?.message} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Forgot?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={signin.isPending}>
        {signin.isPending && <Loader2 className="animate-spin" />}
        Sign in
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        No account?{" "}
        <Link href="/signup" className="text-foreground font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
