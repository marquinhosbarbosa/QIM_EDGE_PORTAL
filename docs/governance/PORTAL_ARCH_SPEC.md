# PORTAL_ARCH_SPEC.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: ✅ CANÔNICO  
**Domínio**: Arquitetura e Separação de Responsabilidades

---

## 🎯 Objetivo

Definir componentes, responsabilidades claras e limites de Portal vs. módulos consumidores.

---

## 📐 Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (User)                        │
└────────────┬────────────────────────────────────────────┘
             │ HTTP
┌────────────────────────────────────────────────────────┐
│            QIM_EDGE_PORTAL (Orquestrador UI)           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Pages Layer (React Components)                │    │
│  │  ├─ Login.tsx                    (real submit) │    │
│  │  ├─ AppLayout.tsx               (Hub + RBAC)  │    │
│  │  ├─ Config/* (Users, Roles, Orgs) (stubs)     │    │
│  │  └─ Modules/* (Document, HACCP, NC) (stubs)   │    │
│  └────────────┬────────────────────────────────────┘    │
│               │                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Auth Layer (Session Management)              │    │
│  │  ├─ SessionProvider (context)                  │    │
│  │  ├─ guards.tsx (RequireAuth)                   │    │
│  │  └─ types.ts (contracts)                       │    │
│  └────────────┬────────────────────────────────────┘    │
│               │                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  API Layer (HTTP Client)                      │    │
│  │  ├─ Injecta headers (Authorization, Org)      │    │
│  │  ├─ Intercepta 401 (logout forçado)           │    │
│  │  └─ Parseia erros (ErrorResponse)              │    │
│  └────────────┬────────────────────────────────────┘    │
│               │                                          │
└───────────────────────────────────────────────────────────┘
                │ HTTP
┌───────────────────────────────────────────────────────────┐
│        Backend Modules (Consumido pelo Portal)           │
├───────────────────────────────────────────────────────────┤
│  CORE_CONFIG          │ Document      │ HACCP │ NC     │
│  /auth/login          │ /documents/*  │ /...  │ /...  │
│  /auth/me             │ /uploads/*    │       │       │
│  /auth/logout         │               │       │       │
│  /rbac/*              │               │       │       │
└───────────────────────────────────────────────────────────┘
```

---

## 🏗️ Componentes Principais

### 1. Pages Layer

**Responsabilidade**: Renderizar UI e coordenar interações com usuário.

#### Public Pages

- **Login.tsx** — Formulário + submissão POST a `/auth/login`
  - Input: email, password
  - Output: redirect to /app se sucesso
  - Error handling: mostrar mensagem do servidor

#### Protected Pages (dentro de `/app`)

- **AppLayout.tsx** — Hub principal com sidebar RBAC
  - Renderiza sidebar baseado em permissions
  - Links para /app/* (config) e /app/modules/* (documents, haccp, nc)
  - Logout button funcional

- **Dashboard.tsx** — Página inicial (stub)

- **Config/* (Users, Roles, Orgs)** — Stubs para future admin panel

- **Modules/* (Document, HACCP, NC)** — Embeded stubs
  - Futuro: integrar iframes ou module federation

### 2. Auth Layer

**Responsabilidade**: Gerenciar sessão, token, permissions.

#### SessionProvider (Context)

```tsx
SessionContextType = {
  status: 'loading' | 'authenticated' | 'anonymous',
  user: UserInfo | null,
  accessToken: string | null,
  expiresAt: number | null,
  
  // Methods
  login(email, password): Promise<void>,
  logout(): Promise<void>,
  loadMe(): Promise<void>,
  hasPermission(permission: string): boolean,
}
```

**Ciclo de Vida**:
1. Boot: recupera token do sessionStorage
2. Se token → valida com GET /auth/me
3. Se válido → status='authenticated'
4. Se inválido → status='anonymous' + limpa storage

**Armazenamento**:
- Token: `sessionStorage['access_token']` (não localStorage, não cookie em prod)
- Org ID: `sessionStorage['organization_id']` (SSOT)
- Expires: `sessionStorage['expires_at']` (milisegundos)

**Regra**: sessionStorage expira quando guia fecha (mais seguro que localStorage).

#### Guards (RequireAuth, RequirePermission)

```tsx
<RequireAuth>
  <ProtectedComponent />
</RequireAuth>
```

- Redireciona para /login se não autenticado
- Fail-closed: sem status === 'authenticated', nega acesso

**Futuro**: RequirePermission para granular access check.

#### Types (Contratos TypeScript)

- `UserInfo` — user, email, org, roles, permissions
- `SessionState` — estado atual da sessão
- `LoginRequest/Response` — contratos do backend
- `ErrorResponse` — erro padronizado

### 3. API Layer

**Responsabilidade**: HTTP client com interceptors, segurança, normalização.

#### ApiClient (Fetch Wrapper)

```ts
class ApiClient {
  baseURL: string;
  accessToken: string | null;
  organizationId: string | null;
  
  setAccessToken(token): void;
  setOrganizationId(orgId): void;
  
  request<T>(endpoint, options): Promise<T>;
  
  // Methods (abstraem POST /auth/login, etc.)
  login(email, password): Promise<LoginResponse>;
  getMe(): Promise<UserInfo>;
  logout(): Promise<void>;
}
```

**Interceptors**:
- ✅ Authorization: `Bearer <accessToken>` (sempre injectado se token)
- ✅ X-Organization-Id: `<orgId>` (from SessionProvider)
- ✅ 401 → logout forçado (chama `apiClient.onUnauthorized()`)
- ✅ Error parsing: tenta JSON, fallback para erro genérico
- ❌ NUNCA loga token

**BaseURL**: Vem de `process.env.VITE_CORE_CONFIG_BASE_URL` (padrão `/api` via vite proxy).

#### Error Handling (errors.ts)

```ts
shouldForceLogout(errorResponse): boolean;
toUserMessage(error): string;
```

- Força logout se erro code = "INVALID_TOKEN" ou "UNAUTHORIZED"
- Converte erro técnico para mensagem legível

---

## 📐 Separação Portal vs. Módulos

### O Portal NÃO reimplementa:

❌ Lógica de documento (Document module)  
❌ Análise de HACCP (HACCP module)  
❌ Nonconformidades (NC module)  

### O Portal SEMPRE:

✅ Orquestra UI (routing, layout, navigation)  
✅ Gerencia autenticação (SessionProvider)  
✅ Valida permissions (guards, sidebar filtering)  
✅ Chama endpoints do backend via contratos  

### Integração com Módulos (Futuro)

```tsx
// Exemplo: Render rota de Document se user tem permission
<Route 
  path="modules/documents" 
  element={
    <RequirePermission permission="documents.read">
      <DocumentModule baseURL="/api/documents" apiToken={token} />
    </RequirePermission>
  }
/>
```

**Padrão esperado**:
- Cada módulo expõe ComponentUI + props tipados
- Portal passa `baseURL`, `apiToken`, `organizationId`
- Módulo gerencia sua própria UI/UX interna

---

## 🔐 Segurança

### Token Storage

**Permitido**: `sessionStorage['access_token']`  
**Proibido**: `localStorage` (persiste entre abas, risco XSS)  
**Problema conhecido** (D-PORTAL-01.1): `localStorage` é mais conveniente, mas menos seguro.

**Mitigação**: 
- sessionStorage expira quando guia fecha
- Refresh token logic delegado ao backend (CORE_CONFIG)

### Headers Obrigatórios

```
Authorization: Bearer <token>      ← sempre
X-Organization-Id: <org-id>        ← sempre (TENANT_SCOPE)
Content-Type: application/json     ← sempre
```

**NUNCA**:
```
X-Tenant-Id  ← WRONG!
```

---

## 🚀 Roadmap de Funcionalidade

### MVP (Atual — Canonicidade)

✅ Login funcional  
✅ Session management (token + org)  
✅ Hub com navegação RBAC  
✅ Auth guards  
✅ API client pronto para módulos  

### Sprint N+1

- [ ] Integração com Document (iframes ou Fed)
- [ ] Integração com HACCP
- [ ] Integração com NC

### Sprint N+2

- [ ] Design tokens + Branding
- [ ] UI/UX polish

---

## ✅ Status

**APPROVED** — Arquitetura definida, componentes separados, responsabilidades claras.

**Próximo**: PORTAL_AUTH_CANONICAL.md
