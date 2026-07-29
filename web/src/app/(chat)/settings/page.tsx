"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/chat/user-avatar";
import { FieldError } from "@/components/auth/field-error";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProfile, useUpdateAvatar } from "@/hooks/use-profile";
import { useSignout } from "@/hooks/use-auth";
import { uploadToImageKit } from "@/lib/imagekit";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/profile.schema";

export default function SettingsPage() {
  const me = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const signout = useSignout();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({ resolver: zodResolver(updateProfileSchema) });

  useEffect(() => {
    if (me) reset({ name: me.name, email: me.email, contact: me.contact });
  }, [me, reset]);

  const onAvatar = async (file: File) => {
    setUploading(true);
    try {
      const { url, fileId } = await uploadToImageKit(file);
      updateAvatar.mutate({ avatarUrl: url, avatarFileId: fileId });
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col">
      <header className="flex items-center gap-2 border-b p-3">
        <Link href="/chat" aria-label="Back">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-sm font-semibold">Settings</h1>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <UserAvatar name={me?.name} src={me?.avatarUrl} className="size-24" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full ring-2 disabled:opacity-60"
              aria-label="Change photo"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onAvatar(f);
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Profile form */}
        <form
          onSubmit={handleSubmit((data) => updateProfile.mutate(data))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Phone</Label>
            <Input id="contact" inputMode="numeric" {...register("contact")} />
            <FieldError message={errors.contact?.message} />
          </div>
          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            {updateProfile.isPending && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </form>

        <Separator />

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => signout.mutate()}
          disabled={signout.isPending}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
