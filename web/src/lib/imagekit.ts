import { api, unwrap } from "@/lib/axios";
import type { UploadAuth } from "@/types/api";

const UPLOAD_ENDPOINT = "https://upload.imagekit.io/api/v1/files/upload";

export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

/** Client-side direct upload to ImageKit using short-lived server auth params. */
export async function uploadToImageKit(file: File): Promise<UploadResult> {
  const auth = await unwrap<UploadAuth>(api.get("/upload/auth"));

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", auth.publicKey);
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);

  const res = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");

  const data = (await res.json()) as { url: string; fileId: string; name: string };
  return { url: data.url, fileId: data.fileId, name: data.name };
}
