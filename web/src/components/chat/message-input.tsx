"use client";

import { useEffect, useRef } from "react";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket";
import { useSendMessage } from "@/hooks/use-send-message";
import { useChatUiStore } from "@/stores/chat-ui.store";
import { uploadToImageKit } from "@/lib/imagekit";
import { useState } from "react";

export function MessageInput({ conversationId }: { conversationId: string }) {
  const send = useSendMessage(conversationId);
  const draft = useChatUiStore((s) => s.drafts[conversationId] ?? "");
  const setDraft = useChatUiStore((s) => s.setDraft);

  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const emitTyping = (isTyping: boolean) => {
    if (typingRef.current === isTyping) return;
    typingRef.current = isTyping;
    const socket = getSocket();
    if (socket.connected) socket.emit("typing", { conversationId, isTyping });
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const onChange = (value: string) => {
    setDraft(conversationId, value);
    if (value) emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
    requestAnimationFrame(autoGrow);
  };

  const doSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft(conversationId, "");
    emitTyping(false);
    clearTimeout(typingTimeout.current);
    requestAnimationFrame(autoGrow);
    await send(text, "TEXT");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void doSend();
    }
  };

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadToImageKit(file);
      await send(url, "IMAGE");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Stop the typing signal when leaving the conversation.
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      emitTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Attach image"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
      </Button>

      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Message"
        className="border-input bg-background focus-visible:ring-ring/50 max-h-40 flex-1 resize-none rounded-2xl border px-4 py-2 text-sm outline-none focus-visible:ring-2"
      />

      <Button
        size="icon"
        aria-label="Send"
        disabled={!draft.trim()}
        onClick={() => void doSend()}
      >
        <Send />
      </Button>
    </div>
  );
}
