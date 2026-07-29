import type { Message } from "./models";

/** Standard backend response envelope. */
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/** Standard backend error body. */
export interface ApiErrorBody {
  statusCode: number;
  success: false;
  message: string;
  errors?: Array<{ field?: string; message?: string }>;
  requestId?: string;
}

/** Normalized error thrown by the axios layer. */
export interface NormalizedError {
  status: number;
  message: string;
  requestId?: string;
  fieldErrors?: Array<{ field?: string; message?: string }>;
}

/** One page of cursor-paginated message history (oldest→newest). */
export interface MessagesPage {
  messages: Message[];
  nextCursor?: string;
  conversationId: string;
}

/** ImageKit client-upload credentials from GET /upload/auth. */
export interface UploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}
