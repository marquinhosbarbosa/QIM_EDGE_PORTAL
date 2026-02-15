// SessionProvider - CHECKPOINT C
// 📌 SSOT do Frontend para Sessão (user, org, roles, permissions, token)
// ✅ org_id vem do /auth/me e vira SSOT do header X-Organization-Id
// ✅ permissions SSOT para navegação RBAC
// ❌ Nunca loga token no console

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { SessionState, LoginRequest } from './types';
import { toUserMessage } from '../utils/errors';

interface SessionContextType extends SessionState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  error: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider - Gerencia sessão autenticada
 * 
 * Estados:
 * - 'loading': carregando sessão inicial
 * - 'authenticated': usuário autenticado com token válido
 * - 'anonymous': sem autenticação
 * 
 * Fluxo:
 * 1. Boot: tenta recuperar token do sessionStorage
 * 2. Se token existe → chama /auth/me
 * 3. Se sucesso → status='authenticated'
 * 4. Se falha → limpa storage e status='anonymous'
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [state, setState] = useState<SessionState>({
    status: 'loading',
    user: null,
    accessToken: null,
    expiresAt: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Boot: tenta recuperar sessão do storage
  useEffect(() => {
    bootSession();
  }, []);

  // Configura callback de 401 no apiClient
  useEffect(() => {
    apiClient.onUnauthorized = () => {
      clearSession();
    };
  }, []);

  /**
   * Boot: recupera token do storage e valida com /auth/me
   */
  async function bootSession() {
    const storedToken = sessionStorage.getItem('access_token');
    const storedOrgId = sessionStorage.getItem('organization_id');
    const storedExpiresAt = sessionStorage.getItem('expires_at');

    if (!storedToken) {
      setState({ status: 'anonymous', user: null, accessToken: null, expiresAt: null });
      return;
    }

    // Verifica expiração
    if (storedExpiresAt) {
      const expiresAt = parseInt(storedExpiresAt, 10);
      if (Date.now() >= expiresAt) {
        clearSession();
        return;
      }
    }

    // Token existe, tenta validar com /auth/me
    apiClient.setAccessToken(storedToken);
    if (storedOrgId) {
      apiClient.setOrganizationId(storedOrgId);
    }

    try {
      const user = await apiClient.getMe();
      
      // Se org_id mudou, atualiza SSOT
      if (user.organization.id !== storedOrgId) {
        sessionStorage.setItem('organization_id', user.organization.id);
        apiClient.setOrganizationId(user.organization.id);
      }

      setState({
        status: 'authenticated',
        user,
        accessToken: storedToken,
        expiresAt: storedExpiresAt ? parseInt(storedExpiresAt, 10) : null,
      });
    } catch (err) {
      // Token inválido/expirado
      clearSession();
    }
  }

  /**
   * Login: autentica usuário e carrega /auth/me
   */
  async function login(data: LoginRequest) {
    setError(null);
    
    try {
      // 1. POST /auth/login
      const response = await apiClient.login(data);
      
      // 2. Armazena token (preferir sessionStorage por segurança)
      sessionStorage.setItem('access_token', response.access_token);
      
      // Calcula expiração (expires_in em segundos)
      const expiresAt = Date.now() + response.expires_in * 1000;
      sessionStorage.setItem('expires_at', expiresAt.toString());
      
      apiClient.setAccessToken(response.access_token);
      
      // 3. Chama /auth/me para obter user + org + permissions
      const user = await apiClient.getMe();
      
      // 4. Define organization_id como SSOT (TENANT_SCOPE_CANONICAL)
      sessionStorage.setItem('organization_id', user.organization.id);
      apiClient.setOrganizationId(user.organization.id);
      
      setState({
        status: 'authenticated',
        user,
        accessToken: response.access_token,
        expiresAt,
      });
    } catch (err) {
      const message = toUserMessage(err);
      setError(message);
      throw err;
    }
  }

  /**
   * Logout: revoga token e limpa sessão
   */
  async function logout() {
    setError(null);
    
    try {
      // Chama backend para revogar token (AUTH_CORE_03)
      await apiClient.logout();
    } catch (err) {
      // Mesmo se falhar, limpa sessão local (fail-safe)
      console.error('Logout failed, clearing session anyway:', err);
    } finally {
      clearSession();
    }
  }

  /**
   * LoadMe: recarrega /auth/me (útil para atualizar permissões)
   */
  async function loadMe() {
    if (!state.accessToken) {
      throw new Error('No token available');
    }

    try {
      const user = await apiClient.getMe();
      
      setState(prev => ({
        ...prev,
        user,
      }));
    } catch (err) {
      clearSession();
      throw err;
    }
  }

  /**
   * Verifica se usuário tem permissão (RBAC_CONTRACT)
   * Fail-closed: se não autenticado ou sem permission → false
   */
  function hasPermission(permission: string): boolean {
    if (state.status !== 'authenticated' || !state.user) {
      return false;
    }
    return state.user.permissions.includes(permission);
  }

  /**
   * Limpa sessão e storage
   */
  function clearSession() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('organization_id');
    sessionStorage.removeItem('expires_at');
    
    apiClient.setAccessToken(null);
    apiClient.setOrganizationId(null);
    
    setState({
      status: 'anonymous',
      user: null,
      accessToken: null,
      expiresAt: null,
    });
  }

  return (
    <SessionContext.Provider
      value={{
        ...state,
        login,
        logout,
        loadMe,
        hasPermission,
        error,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook para consumir SessionContext
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
