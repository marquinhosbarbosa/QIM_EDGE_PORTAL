// Utilitário para conversão de códigos de erro canônicos em mensagens amigáveis
// Baseado em AUTH_CONTRACT.md, RBAC_CONTRACT.md, TENANT_SCOPE_CANONICAL.md

import { ErrorResponse } from '../auth/types';

/**
 * Converte códigos de erro canônicos em mensagens amigáveis (UX)
 * ❌ Nunca vaza detalhes internos
 * ✅ Fail-closed: erro desconhecido → mensagem genérica
 */
export function toUserMessage(error: ErrorResponse | unknown): string {
  // Se não for ErrorResponse conhecido, retorna mensagem genérica
  if (!error || typeof error !== 'object') {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const errorResponse = error as ErrorResponse;
  const code = errorResponse.error?.code;

  // Mapeamento canônico (AUTH_CONTRACT + TENANT_SCOPE + RBAC)
  const errorMessages: Record<string, string> = {
    // AUTH_CONTRACT.md
    AUTH_INVALID_FORMAT: 'Email ou senha em formato inválido.',
    AUTH_INVALID: 'Credenciais inválidas. Verifique email e senha.',
    AUTH_REQUIRED: 'Autenticação necessária. Faça login novamente.',
    AUTH_FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
    AUTH_RATE_LIMIT_EXCEEDED: 'Muitas tentativas. Aguarde alguns minutos.',
    
    // TENANT_SCOPE_CANONICAL.md
    ORG_REQUIRED: 'Organização não identificada. Faça login novamente.',
    ORG_INVALID_FORMAT: 'Identificador de organização inválido.',
    ORG_NOT_FOUND: 'Organização não encontrada.',
    ORG_DEPRECATED_HEADER: 'Cabeçalho inválido. Entre em contato com o suporte.',
    
    // RBAC_CONTRACT.md (implicitamente AUTH_FORBIDDEN)
    PERMISSION_DENIED: 'Você não possui permissão para esta operação.',
    
    // Genéricos
    INTERNAL_ERROR: 'Erro no servidor. Tente novamente ou contate o suporte.',
  };

  return errorMessages[code] || 'Ocorreu um erro. Tente novamente.';
}

/**
 * Determina se o erro requer logout forçado
 */
export function shouldForceLogout(error: ErrorResponse | unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const errorResponse = error as ErrorResponse;
  const code = errorResponse.error?.code;

  // Códigos que invalidam a sessão
  return [
    'AUTH_INVALID',
    'AUTH_REQUIRED',
    'ORG_REQUIRED',
    'ORG_INVALID_FORMAT',
    'ORG_NOT_FOUND',
  ].includes(code);
}
