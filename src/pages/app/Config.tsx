// Config.tsx - Placeholder para seção de Configurações
// CHECKPOINT E

import { RequirePermission } from '../../auth/guards';

export function ConfigUsers() {
  return (
    <RequirePermission permission="core_config.users.read">
      <div style={styles.container}>
        <h1>Usuários</h1>
        <p>Lista de usuários (placeholder - PORTAL-CORE-01 MVP)</p>
      </div>
    </RequirePermission>
  );
}

export function ConfigRoles() {
  return (
    <RequirePermission permission="core_config.roles.read">
      <div style={styles.container}>
        <h1>Perfis</h1>
        <p>Lista de perfis/roles (placeholder - PORTAL-CORE-01 MVP)</p>
      </div>
    </RequirePermission>
  );
}

export function ConfigOrgs() {
  return (
    <RequirePermission permission="core_config.orgs.read">
      <div style={styles.container}>
        <h1>Organizações</h1>
        <p>Informações da organização (placeholder - PORTAL-CORE-01 MVP)</p>
      </div>
    </RequirePermission>
  );
}

const styles = {
  container: {
    padding: '2rem',
  },
};
