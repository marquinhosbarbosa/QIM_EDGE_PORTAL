// API Client Canônico - CHECKPOINT B
// ✅ Injecta Authorization + X-Organization-Id automaticamente
// ✅ Intercepta 401 → logout forçado
// ❌ Nunca loga token no console

import { LoginRequest, LoginResponse, UserInfo, ErrorResponse } from '../auth/types';
import { shouldForceLogout } from '../utils/errors';

interface ApiClientConfig {
  baseURL: string;
  onUnauthorized?: () => void;
}

class ApiClient {
  private baseURL: string;
  public onUnauthorized?: () => void;
  private accessToken: string | null = null;
  private organizationId: string | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.onUnauthorized = config.onUnauthorized;
  }

  /**
   * Define o token de acesso (chamado pelo SessionProvider)
   * ❌ NUNCA LOGA O TOKEN
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  /**
   * Define o organization_id (SSOT vem do /auth/me)
   * Usado em todas as chamadas autenticadas
   */
  setOrganizationId(orgId: string | null) {
    this.organizationId = orgId;
  }

  /**
   * Requisição genérica com interceptors
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Injeta Authorization se token presente
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Injeta X-Organization-Id se presente (TENANT_SCOPE_CANONICAL)
    if (this.organizationId) {
      headers['X-Organization-Id'] = this.organizationId;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Se 401 → logout forçado
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('AUTH_REQUIRED');
      }

      // Se erro (4xx/5xx), tenta parsear ErrorResponse
      if (!response.ok) {
        let errorData: ErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          // Se não conseguir parsear, cria erro genérico
          errorData = {
            error: {
              code: 'INTERNAL_ERROR',
              message: `HTTP ${response.status}`,
            },
          };
        }

        // Se erro requer logout, força
        if (shouldForceLogout(errorData)) {
          this.handleUnauthorized();
        }

        throw errorData;
      }

      // Sucesso: retorna JSON
      return await response.json();
    } catch (error) {
      // Re-throw se já for ErrorResponse
      if (error && typeof error === 'object' && 'error' in error) {
        throw error;
      }

      // Erro genérico (rede, etc.)
      throw {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Falha na comunicação com o servidor.',
        },
      } as ErrorResponse;
    }
  }

  private handleUnauthorized() {
    // Limpa credenciais
    this.accessToken = null;
    this.organizationId = null;

    // Callback para SessionProvider redirecionar /login
    if (this.onUnauthorized) {
      this.onUnauthorized();
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * POST /api/v1/auth/login
   * AUTH_CONTRACT.md
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * GET /api/v1/auth/me
   * AUTH_CONTRACT.md + RBAC_CONTRACT.md
   * ✅ Requer: Authorization + X-Organization-Id
   */
  async getMe(): Promise<UserInfo> {
    return this.request<UserInfo>('/api/v1/auth/me', {
      method: 'GET',
    });
  }

  /**
   * POST /api/v1/auth/logout
   * AUTH_CORE_03 (Token Revocation)
   */
  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }
}

// Singleton global
export const apiClient = new ApiClient({
  baseURL: '',  // Vite proxy intercepta /api
  // onUnauthorized será definido pelo SessionProvider
});
