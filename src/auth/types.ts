// AUTH CONTRACT Types - Baseado em AUTH_CONTRACT.md

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Organization {
  id: string;
  name: string;
  is_active: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  organization: Organization;
  roles: string[];
  permissions: string[];
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
  correlation_id?: string;
}

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export interface SessionState {
  status: SessionStatus;
  user: UserInfo | null;
  accessToken: string | null;
  expiresAt: number | null;
}
