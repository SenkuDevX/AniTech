export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: Role;
  isGuest: boolean;
}

export const GUEST_USERNAME_PREFIX = 'guest_';
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
