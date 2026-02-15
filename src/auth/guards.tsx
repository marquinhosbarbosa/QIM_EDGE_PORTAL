// Guards - CHECKPOINT A (finalizando)
// ✅ RequireAuth: redireciona /login se não autenticado
// ✅ RequirePermission: bloqueia rota se não tem permission (fail-closed)

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './SessionProvider';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * RequireAuth: Guard para rotas que exigem autenticação
 * Fail-closed: se não autenticado → redirect /login
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useSession();
  const location = useLocation();

  if (status === 'loading') {
    return <div>Carregando...</div>;
  }

  if (status === 'anonymous') {
    // Redireciona para login, salvando rota original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RequirePermission: Guard RBAC para rotas que exigem permissão específica
 * Fail-closed: se não tem permission → mostra "Acesso negado"
 * 
 * Baseado em RBAC_CONTRACT.md
 */
export function RequirePermission({
  permission,
  children,
  fallback,
}: RequirePermissionProps) {
  const { hasPermission } = useSession();

  if (!hasPermission(permission)) {
    return (
      <>
        {fallback || (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Acesso Negado</h2>
            <p>Você não possui permissão para acessar este recurso.</p>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              Permissão necessária: <code>{permission}</code>
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
