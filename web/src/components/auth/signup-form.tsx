"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signupSchema, type SignupInput } from "@/schemas/auth.schema";
import { useSignup } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "./field-error";

export function SignupForm() {
  const router = useRouter();
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit((data) =>
    signup.mutate(data, { onSuccess: () => router.replace("/chat") }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" autoComplete="name" placeholder="Akash" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact">Phone</Label>
        <Input
          id="contact"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="9876543210"
          {...register("contact")}
        />
        <FieldError message={errors.contact?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={signup.isPending}>
        {signup.isPending && <Loader2 className="animate-spin" />}
        Create account
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/signin" className="text-foreground font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
