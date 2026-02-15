// App.tsx - Roteamento principal
// ✅ CHECKPOINT A: Rotas /login e /app com guards

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './auth/SessionProvider';
import { RequireAuth } from './auth/guards';
import { Login } from './pages/Login';
import { AppLayout } from './pages/app/AppLayout';
import { Dashboard } from './pages/app/Dashboard';
import { ConfigUsers, ConfigRoles, ConfigOrgs } from './pages/app/Config';
import { ModuleDocuments, ModuleHACCP, ModuleNC } from './pages/app/Modules';

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            {/* Dashboard (default) */}
            <Route index element={<Dashboard />} />

            {/* Config section */}
            <Route path="config/users" element={<ConfigUsers />} />
            <Route path="config/roles" element={<ConfigRoles />} />
            <Route path="config/orgs" element={<ConfigOrgs />} />

            {/* Modules section */}
            <Route path="modules/documents" element={<ModuleDocuments />} />
            <Route path="modules/haccp" element={<ModuleHACCP />} />
            <Route path="modules/nc" element={<ModuleNC />} />
          </Route>

          {/* Redirect root to /app */}
          <Route path="/" element={<Navigate to="/app" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<div style={{ padding: '2rem' }}>Página não encontrada</div>} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
