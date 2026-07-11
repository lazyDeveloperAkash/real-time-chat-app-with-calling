export interface AuthUser {
  id: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
}

export type PublicUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeen?: Date;
};
