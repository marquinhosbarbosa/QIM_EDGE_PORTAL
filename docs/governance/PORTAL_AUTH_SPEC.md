# PORTAL_AUTH_SPEC.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: ✅ CANÔNICO  
**Bridge**: [QIM_EDGE_GOVERNANCE/AUTH_CONTRACT.md](../../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md)

---

## 🎯 Objetivo

Definir como o Portal gerencia autenticação, token, sessão, refresh, logout.

**Regra de Ouro**: Frontend é **CLIENTE CONFIÁVEL** de CORE_CONFIG. Não reimplementa lógica de autenticação.

---

## 📍 Endpoints Consumidos (Do CORE_CONFIG)

### 1. POST /auth/login

**Request**:
```json
{
  "email": "user@org.com",
  "password": "SecurePass123!"
}
```

**Response (200)**:
```json
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Response (4xx)**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha incorretos"
  },
  "correlation_id": "uuid-xyz"
}
```

**Portal Logic**:
1. Submeter form Login.tsx
2. Chamar `apiClient.login(email, password)`
3. Armazenar token em `sessionStorage['access_token']`
4. Chamar `loadMe()` para obter user info
5. Redirect to /app se sucesso

---

### 2. GET /auth/me

**Headers**:
```
Authorization: Bearer eyJhbG...
X-Organization-Id: org-uuid
```

**Response (200)**:
```json
{
  "id": "user-uuid",
  "email": "user@org.com",
  "full_name": "João Silva",
  "is_active": true,
  "organization": {
    "id": "org-uuid",
    "name": "Acme Corp",
    "is_active": true
  },
  "roles": ["admin", "auditor"],
  "permissions": [
    "users.read",
    "users.write",
    "documents.read",
    "haccp.read",
    "nc.read"
  ]
}
```

**Portal Logic**:
1. Boot SessionProvider: recupera token do storage
2. Chamar GET /auth/me com token
3. Se sucesso → armazenar user + org_id (SSOT de permissões)
4. Se 401 → limpar storage, redirect to /login (logout forçado)

---

### 3. POST /auth/logout

**Headers**:
```
Authorization: Bearer eyJhbG...
X-Organization-Id: org-uuid
```

**Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

**Portal Logic**:
1. Chamar POST /auth/logout (revoga token no backend)
2. Limpar sessionStorage (access_token, organization_id, expires_at)
3. Limpar SessionProvider state
4. Redirect to /login

---

## 🔒 SessionProvider (State Machine)

### Estados

```
        ┌─────────────┐
        │   LOADING   │  (boot inicial)
        └──────┬──────┘
               │ (backend responde)
       ┌───────┴────────┐
       │                │
    ✅ │                │ ❌
       ↓                ↓
┌──────────────┐  ┌──────────────┐
│AUTHENTICATED │  │   ANONYMOUS  │
└──────────────┘  └──────────────┘
```

### Transições

| De | Para | Trigger | Ação |
|-------|------|---------|------|
| LOADING | AUTHENTICATED | Boot encontra token válido em storage | Chama /auth/me, armazena user |
| LOADING | ANONYMOUS | Boot não encontra token | Seta status='anonymous' |
| AUTHENTICATED | ANONYMOUS | 401 em qualquer endpoint | Limpa storage, força logout |
| AUTHENTICATED | AUTHENTICATED | User atualiza dados | Chama /auth/me, refresh user |
| ANONYMOUS | AUTHENTICATED | Login sucesso | Armazena token + user |

### Persistência (sessionStorage SSOT)

```javascript
sessionStorage['access_token'] = "eyJhbG..."     // ✅ Token Bearer
sessionStorage['organization_id'] = "org-uuid"   // ✅ Org ID
sessionStorage['expires_at'] = 1707907200000     // ✅ Timestamp (ms)
```

**Segurança**:
- ✅ sessionStorage expira quando guia/aba fecha
- ❌ localStorage persistiria (risco D-PORTAL-01.1)
- ❌ Nunca armazenar em cookie sem HttpOnly (risco XSS via JavaScript)

---

## 🚪 Guards (Route Protection)

### RequireAuth (Componente)

```tsx
import { RequireAuth } from '@/auth/guards';

<Route
  path="/app"
  element={
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  }
/>
```

**Lógica**: 
- Se `status !== 'authenticated'` → Redireciona para /login
- Se em transição (status='loading') → Mostra loader
- Se autenticado → Renderiza children

**Fail-Closed**: Sem autenticação explícita, nega acesso.

### RequirePermission (Futuro)

```tsx
// Exemplo planejado para Sprint N+1
<RequirePermission permission="documents.read">
  <DocumentsPage />
</RequirePermission>
```

**Lógica**:
- Checa `sessionProvider.hasPermission('documents.read')`
- Se false → Redireciona para /403 ou mostra error
- Fail-Closed: sem permission, nega

---

## 🔄 Refresh Token Flow

**Status Atual**: ❌ **NÃO IMPLEMENTADO** — Frontend espera que backend gerencie vencimento.

**Padrão Esperado** (quando backend CORE_CONFIG implementar):

```
┌────────────────────────────────────────────┐
│ GET /some/endpoint + Authorization header  │
└─────────┬──────────────────────────────────┘
          │ 401 TOKEN_EXPIRED
          ↓
┌────────────────────────────────────────────┐
│ POST /auth/refresh + refresh_token cookie  │
└─────────┬──────────────────────────────────┘
          │ 200 + new access_token
          ↓
┌────────────────────────────────────────────┐
│ Retry original endpoint com novo token     │
└────────────────────────────────────────────┘
```

**Implementação Futura**:
- API client intercepta 401
- Se refresh_token disponível → POST /auth/refresh
- Se sucesso → armazena novo token e retenta endpoint original
- Se falha → força logout

**Tech Debt** (postergado): D-PORTAL-AUTH-REFRESH-01

---

## 🚪 Logout Flow

### Trigger Points

1. **User clica "Logout" button** (explicit)
2. **401 em qualquer endpoint** (implicit)
3. **Token expirado** (implicit, futuro)

### Sequência

```javascript
// src/auth/SessionProvider.tsx
async function logout() {
  try {
    // 1. Informa backend que revoga token
    await apiClient.logout();
  } finally {
    // 2. Limpa storage (mesmo se POST /auth/logout falhar)
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('organization_id');
    sessionStorage.removeItem('expires_at');
    
    // 3. Limpa SessionProvider state
    setState({ status: 'anonymous', user: null, ... });
    
    // 4. Redireciona para /login
    navigate('/login');
  }
}
```

**Regra**: Logout é **fail-safe**. Mesmo se backend não responder, frontend limpa storage.

---

## 🔐 Security Checklist

### ✅ Habilitado

- [x] sessionStorage para token (expira com guia)
- [x] Authorization header sempre injectado
- [x] 401 força logout (fail-closed)
- [x] Logout: limpa storage + revoga backend
- [x] X-Organization-Id obrigatório em calls autenticadas

### ❌ Pendente

- [ ] Refresh token rotation (backend dependency)
- [ ] HttpOnly cookie + CSRF (backend dependency, mais seguro)
- [ ] Token vencimento frontend-side validation
- [ ] Rate limit de login attempts

### 🟡 Dívida Técnica

**D-PORTAL-01.1**: Migrar para `localStorage` com refresh token?  
- Pro: Persiste sessão entre abas
- Con: Risco XSS (token vira acessível via console)
- Decision: Esperar conversa com CORE_CONFIG sobre refresh token strategy

---

## 🎯 Regras Obrigatórias

### ✅ Fazer

- Login via POST /auth/login (real call)
- Armazenar token em sessionStorage
- Injeta X-Organization-Id em TODAS as requests autenticadas
- Força logout em 401
- Limpa storage no logout
- Usa SessionProvider como SSOT de sessão

### ❌ Nunca Fazer

- Logar token no console (XSS risk)
- Usar localStorage para token (persistent XSS risk)
- Inventar token refresh logic (espera backend)
- Armazenar password em nenhum lugar
- Confiar em timestamp do cliente para refresh

---

## ✅ Status

**APPROVED** — Auth flow canônico, SessionProvider SSOT, security checklist definido.

**Próximo**: PORTAL_API_CONTRACT_CANONICAL.md
