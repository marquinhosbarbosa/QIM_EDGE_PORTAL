// Dashboard Home - Página inicial do /app
// CHECKPOINT E

import { useSession } from '../../auth/SessionProvider';

export function Dashboard() {
  const { user } = useSession();

  return (
    <div style={styles.container}>
      <h1>Bem-vindo ao QIM EDGE Portal</h1>
      <p>Olá, {user?.full_name}!</p>

      <div style={styles.infoCard}>
        <h2>Informações da Sessão</h2>
        <dl style={styles.list}>
          <dt>Organização:</dt>
          <dd>{user?.organization.name}</dd>

          <dt>Email:</dt>
          <dd>{user?.email}</dd>

          <dt>Perfis:</dt>
          <dd>{user?.roles.join(', ')}</dd>

          <dt>Permissões:</dt>
          <dd>
            <details>
              <summary>{user?.permissions.length} permissões</summary>
              <ul style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {user?.permissions.map((perm) => (
                  <li key={perm}>{perm}</li>
                ))}
              </ul>
            </details>
          </dd>
        </dl>
      </div>

      <div style={styles.infoCard}>
        <h3>Status do Portal</h3>
        <p>✅ PORTAL-CORE-01 - Login + Hub + RBAC Navigation</p>
        <p>✅ AUTH-CORE-03 - Token Revocation + Session Management</p>
        <p>✅ Navegação por permissões (fail-closed)</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
  },
  infoCard: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
};
