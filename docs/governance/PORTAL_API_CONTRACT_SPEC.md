# PORTAL_API_CONTRACT_SPEC.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: ✅ CANÔNICO  
**Bridge**: [QIM_EDGE_GOVERNANCE/API_STANDARDS.md](../../QIM_EDGE_GOVERNANCE/docs/governance/API_STANDARDS.md)

---

## 🎯 Objetivo

Contrato único de como o Portal consome APIs do backend (CORE_CONFIG e módulos futuros).

---

## 🔌 Configuração de Conexão

### Base URL

**Fonte**: Variável de ambiente `VITE_CORE_CONFIG_BASE_URL`.

```javascript
// src/api/client.ts
class ApiClient {
  constructor(config: { baseURL: string }) {
    this.baseURL = config.baseURL ?? process.env.VITE_CORE_CONFIG_BASE_URL ?? '/api';
  }
}
```

**Precedência**:
1. Env var `VITE_CORE_CONFIG_BASE_URL` (produção)
2. Fallback `/api` (via vite proxy para dev)

**Exemplo**:
```bash
# .env.production
VITE_CORE_CONFIG_BASE_URL=https://api.qimedge.com/core-config
```

### Proxy de Desenvolvimento

**vite.config.ts**:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8001',  // CORE_CONFIG
      changeOrigin: true
    }
  }
}
```

**Efeito**: `PUT /api/some/endpoint` → `http://127.0.0.1:8001/some/endpoint`

---

## 📨 Headers Obrigatórios

### Success Case (com autenticação)

```http
GET /api/documents HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Organization-Id: org-uuid-12345
Content-Type: application/json
X-Correlation-Id: req-uuid-67890  (opcional, recomendado)
```

**Injeção Automática** (via ApiClient):

```javascript
// src/api/client.ts
private async request<T>(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
    ...(this.organizationId && { 'X-Organization-Id': this.organizationId }),
  };
  
  // ... rest of request
}
```

### Sem Autenticação (Login)

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
```

**Nota**: Authorization **não** é injectado automaticamente para `/auth/login`.

---

## 📤 Request/Response Pattern

### Success Response (2xx)

**Padrão Universal** (List):
```json
{
  "items": [
    { "id": "uuid", "name": "Item 1", ... },
    { "id": "uuid", "name": "Item 2", ... }
  ],
  "total": 2,
  "skip": 0,
  "limit": 10
}
```

**Single Resource**:
```json
{
  "id": "uuid",
  "name": "Item 1",
  "created_at": "2026-02-14T00:00:00Z",
  ...
}
```

### Error Response (4xx/5xx)

**Padrão Universal**:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Documento com ID xyz não encontrado"
  },
  "correlation_id": "req-uuid-67890"
}
```

**Códigos Comuns**:
| Code | HTTP | Ação Portal |
|------|------|-----------|
| INVALID_CREDENTIALS | 401 | Mostra form error, retry login |
| INVALID_TOKEN | 401 | Logout forçado |
| AUTHORIZATION_FAILED | 403 | Redireciona /403 (permissão) |
| RESOURCE_NOT_FOUND | 404 | Mostra "não encontrado" ou redireciona |
| VALIDATION_ERROR | 422 | Mostra field errors em form |
| INTERNAL_ERROR | 500 | Mostra toast "erro servidor, tente mais tarde" |

---

## 🔄 Métodos Canônicos (ApiClient)

### Authentication

```typescript
// POST /auth/login
async login(email: string, password: string): Promise<LoginResponse>

// GET /auth/me
async getMe(): Promise<UserInfo>

// POST /auth/logout
async logout(): Promise<void>
```

### Exemplo de Uso

```typescript
// src/auth/SessionProvider.tsx
async function login(data: LoginRequest) {
  const response = await apiClient.login(data.email, data.password);
  apiClient.setAccessToken(response.access_token);
  
  const user = await apiClient.getMe();
  apiClient.setOrganizationId(user.organization.id);
  
  sessionStorage['access_token'] = response.access_token;
  sessionStorage['organization_id'] = user.organization.id;
  
  setState({ status: 'authenticated', user, accessToken: response.access_token });
}
```

---

## ⚠️ Error Handling (shouldForceLogout)

### Regras de Quando Forçar Logout

```typescript
// src/utils/errors.ts
function shouldForceLogout(error: ErrorResponse): boolean {
  const forceLogoutCodes = [
    'INVALID_TOKEN',        // Token expirou ou foi revogado
    'UNAUTHORIZED',         // Sem autorizações necessárias de forma permanente
    'TOKEN_REVOKED',        // Admin revogou token
  ];
  
  return forceLogoutCodes.includes(error.error.code);
}
```

**Trigger** (em ApiClient.request):
```typescript
if (response.status === 401) {
  if (shouldForceLogout(errorData)) {
    this.onUnauthorized?.();  // SessionProvider escuta e faz logout
  }
  throw errorData;
}
```

---

## 🔄 Retry Strategy

**Status Atual**: ❌ **NÃO IMPLEMENTADO**

**Padrão Esperado** (futuro):

```typescript
// src/api/client.ts
private async requestWithRetry<T>(
  endpoint: string,
  options: RequestInit,
  retries: number = 3
): Promise<T> {
  // Retry apenas para:
  // - 5xx (server error)
  // - Network timeout
  
  // NÃO retry para:
  // - 4xx (client error, não faz sentido retry)
  // - 401 (invalid token)
}
```

**Tech Debt** (postergado): D-PORTAL-API-RETRY-01

---

## 📊 Paginação (Padrão)

### Request

```http
GET /api/documents?skip=0&limit=10 HTTP/1.1
```

**Query Params**:
- `skip` — Offset (0-based)
- `limit` — Número de itens por página (padrão 10, máx 100)

### Response

```json
{
  "items": [ ... ],
  "total": 2500,      // Total de itens na coleção
  "skip": 0,          // Offset usado
  "limit": 10         // Limit usado
}
```

**Frontend Logic**:
```typescript
// src/pages/app/Config/Users.tsx
const [skip, setSkip] = useState(0);
const [limit, setLimit] = useState(10);

async function loadUsers() {
  const response = await apiClient.request(
    `/users?skip=${skip}&limit=${limit}`
  );
  
  setUsers(response.items);
  setTotal(response.total);
}

function goToPage(page: number) {
  setSkip(page * limit);
  loadUsers();
}
```

---

## 🔍 Filtering e Busca

**Padrão** (proposto, validar com backend):

```http
GET /api/documents?search=invoice&type=pdf&skip=0&limit=10
```

**Query Params**:
- `search` — Busca full-text em name/description
- `type` — Filtro por tipo (ex: 'pdf', 'image')
- `status` — Filtro por status (ex: 'draft', 'approved')

**Response**: Mesmo padrão de paginação acima.

---

## 🚫 Restrições e Regras

### ✅ Permitido

- Consumir `/api/auth/*` do CORE_CONFIG
- Consumir `/api/documents/*` (futuro)
- Consumir `/api/haccp/*` (futuro)
- Consumir `/api/nc/*` (futuro)
- Injetar X-Organization-Id em TODAS as requests
- Retry em 5xx (futuro)

### ❌ Proibido

- Invocar endpoints fora de contracts
- Assumir formato de resposta sem validar
- Logar token no console
- Usar `X-Tenant-Id` (usar `X-Organization-Id`)
- Fallback para SQLite (sempre PostgreSQL async)

---

## 📝 Tipos TypeScript (Contratos)

### Types Definidos

```typescript
// src/auth/types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  organization: Organization;
  roles: string[];
  permissions: string[];
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
  correlation_id?: string;
}

// Futuro: types para Document, HACCP, NC
```

### Validação de Tipos

**TypeScript**: Build step `tsc` valida types.

```bash
npm run build  # Roda tsc antes de vite build
```

**Se houver erro de tipo**, build falha. ✅ Fail-closed.

---

## ✅ Status

**APPROVED** — Contrato de API definido, headers claros, resposta padronizada.

**Próximo**: INSTANCE_1_DEV_CANONICAL.md
