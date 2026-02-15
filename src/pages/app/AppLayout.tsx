// AppLayout.tsx - CHECKPOINT E
// ✅ Hub com sidebar RBAC-driven (menus por permission)
// ✅ Double enforcement: não mostra item + bloqueia rota
// ✅ Botão logout com revogação real

import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';

interface MenuItem {
  label: string;
  path: string;
  permission?: string; // Opcional: se especificado, só mostra se tiver permission
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Menu baseado em RBAC_CONTRACT.md (core_config permissions)
const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Configurações',
    items: [
      { label: 'Usuários', path: '/app/config/users', permission: 'core_config.users.read' },
      { label: 'Perfis', path: '/app/config/roles', permission: 'core_config.roles.read' },
      { label: 'Organizações', path: '/app/config/orgs', permission: 'core_config.orgs.read' },
    ],
  },
  {
    title: 'Módulos',
    items: [
      { label: 'Documentos', path: '/app/modules/documents' },
      { label: 'HACCP', path: '/app/modules/haccp' },
      { label: 'Não Conformidades', path: '/app/modules/nc' },
    ],
  },
];

export function AppLayout() {
  const { user, logout, hasPermission } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  // Filtra itens de menu por permission
  function filterMenuItems(items: MenuItem[]): MenuItem[] {
    return items.filter((item) => {
      // Se item não tem permission definida, sempre mostra
      if (!item.permission) return true;
      
      // Fail-closed: só mostra se tem permission
      return hasPermission(item.permission);
    });
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.header}>
          <h1 style={styles.logo}>QIM EDGE</h1>
          <p style={styles.orgName}>{user?.organization.name}</p>
        </div>

        <nav style={styles.nav}>
          {MENU_SECTIONS.map((section) => {
            const visibleItems = filterMenuItems(section.items);
            
            // Não renderiza seção vazia
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} style={styles.section}>
                <h3 style={styles.sectionTitle}>{section.title}</h3>
                <ul style={styles.list}>
                  {visibleItems.map((item) => (
                    <li key={item.path} style={styles.listItem}>
                      <Link
                        to={item.path}
                        style={{
                          ...styles.link,
                          ...(location.pathname === item.path ? styles.activeLink : {}),
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div style={styles.footer}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.full_name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
            <div style={styles.userRoles}>
              {user?.roles.map((role) => (
                <span key={role} style={styles.badge}>
                  {role}
                </span>
              ))}
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

// Estilos inline básicos (MVP)
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#1e293b',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '1.5rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  orgName: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.75rem',
    opacity: 0.7,
  },
  nav: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem 0',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    margin: '0 0 0.5rem 0',
    padding: '0 1rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    opacity: 0.6,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  listItem: {
    margin: 0,
  },
  link: {
    display: 'block',
    padding: '0.625rem 1rem',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'background-color 0.15s',
  },
  activeLink: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    color: 'white',
    fontWeight: 500,
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  userInfo: {
    marginBottom: '0.75rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.125rem',
  },
  userEmail: {
    fontSize: '0.75rem',
    opacity: 0.7,
    marginBottom: '0.5rem',
  },
  userRoles: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem',
  },
  badge: {
    fontSize: '0.625rem',
    padding: '0.125rem 0.375rem',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: '4px',
  },
  logoutButton: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  main: {
    flex: 1,
    overflowY: 'auto' as const,
    backgroundColor: '#f8fafc',
  },
};
