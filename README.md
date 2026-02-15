# QIM_EDGE_PORTAL

**Sprint**: PORTAL-CANONICALIZATION-01  
**Data**: 2026-02-14  
**Status**: ✅ UI/UX READY (estruturalmente canônico, Instância 1/2 definidas)  

---

## 🎯 Objetivo

Portal unificado do QIM EDGE para login, Hub navegável e integração com módulos (Document, HACCP, NC).

**Escopo**:
- Login UI funcional (real)
- Session Management (token storage + refresh strategy)
- Hub com navegação RBAC-driven
- Integração com `/auth/me` e `/auth/logout` do CORE_CONFIG
- Fail-closed: menus e rotas por permission

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Backend

O Portal espera que o CORE_CONFIG esteja rodando em `http://127.0.0.1:8001`.

Ajustar proxy no `vite.config.ts` se necessário.

### 3. Rodar Dev Server

```bash
npm run dev
```

Acessa: `http://localhost:3000`

### 4. Credenciais de Teste

Usar um usuário criado no CORE_CONFIG. Exemplo:

```
Email: admin@empresa.com
Password: AdminPass123!
```

---

## 📁 Estrutura

```
QIM_EDGE_PORTAL/
├── src/
│   ├── api/
│   │   └── client.ts (CHECKPOINT B - API Client com interceptors)
│   ├── auth/
│   │   ├── SessionProvider.tsx (CHECKPOINT C - SSOT do frontend)
│   │   ├── guards.tsx (RequireAuth, RequirePermission)
│   │   └── types.ts (contratos AUTH + RBAC)
│   ├── pages/
│   │   ├── Login.tsx (CHECKPOINT D)
│   │   └── app/
│   │       ├── AppLayout.tsx (Hub com sidebar RBAC)
│   │       ├── Dashboard.tsx
│   │       ├── Config.tsx (Usuários, Perfis, Orgs)
│   │       └── Modules.tsx (Document, HACCP, NC placeholders)
│   ├── utils/
│   │   └── errors.ts (toUserMessage, shouldForceLogout)
│   ├── App.tsx (Roteamento)
│   ├── main.tsx (Bootstrap)
│   └── index.css (Global styles)
├── evidence/
│   └── EVIDENCE_PORTAL_CORE_01_LOGIN_HUB.md
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔐 Segurança

### Token Storage

✅ **sessionStorage** (recomendado para MVP):
- Token não persiste entre sessões do navegador
- Menor risco de XSS se usuário abre vários sites

⚠️ **localStorage** (alternativa):
- Persiste após fechar navegador
- Maior risco XSS (mas mitigado por HTTPS + CSP)

**Implementação atual**: sessionStorage (linha com a dívida D-PORTAL-01.1 documentada)

### Headers Obrigatórios

Todas as chamadas autenticadas enviam:

```
Authorization: Bearer <token>
X-Organization-Id: <org_uuid>  # SSOT do /auth/me
```

### Fail-Closed

- Se não autenticado → redirect `/login`
- Se sem permission → mostra "Acesso negado"
- Token revogado → 401 → logout automático

---

## 📋 Endpoints Consumidos

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/auth/login` | POST | Autentica usuário (AUTH_CONTRACT.md) |
| `/api/v1/auth/me` | GET | Retorna user + org + permissions |
| `/api/v1/auth/logout` | POST | Revoga token (AUTH-CORE-03) |

---

## 🧪 Testes

Testes frontend podem ser adicionados posteriormente com Vitest + React Testing Library.

Por enquanto, seguir checklist manual em evidência:

- [ ] Login com credenciais válidas → redirect /app
- [ ] Login com credenciais inválidas → erro amigável
- [ ] Hub renderiza menus por permission
- [ ] Rota sem permission → "Acesso negado"
- [ ] Logout → chama backend e limpa sessão
- [ ] Token revogado → 401 → redirect login

---

## � Governança Canônica

### Canônicos Locais (Portal)

**LEIA NESTA ORDEM**:
1. [docs/governance/CANONICAL_INDEX_PORTAL.md](docs/governance/CANONICAL_INDEX_PORTAL.md) — Mapa de SSOT
2. [docs/governance/PORTAL_ARCH_CANONICAL.md](docs/governance/PORTAL_ARCH_CANONICAL.md) — Arquitetura e separação
3. [docs/governance/PORTAL_AUTH_CANONICAL.md](docs/governance/PORTAL_AUTH_CANONICAL.md) — Autenticação
4. [docs/governance/PORTAL_API_CONTRACT_CANONICAL.md](docs/governance/PORTAL_API_CONTRACT_CANONICAL.md) — Contrato API
5. [docs/governance/INSTANCE_1_DEV_CANONICAL.md](docs/governance/INSTANCE_1_DEV_CANONICAL.md) — Setup local
6. [docs/governance/INSTANCE_2_CI_CANONICAL.md](docs/governance/INSTANCE_2_CI_CANONICAL.md) — Build e deploy

### Canônicos Transversais (Lidos de QIM_EDGE_GOVERNANCE)

| Documento | Localização | Escopo |
|-----------|-------------|--------|
| CANONICAL_INDEX.md | ../QIM_EDGE_GOVERNANCE/docs/governance/CANONICAL_INDEX.md | Hierarquia transversal |
| AUTH_CONTRACT.md | ../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md | Endpoints de auth |
| RBAC_CONTRACT.md | ../QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md | Permissões e roles |
| TENANT_SCOPE_CANONICAL.md | ../QIM_EDGE_GOVERNANCE/docs/governance/TENANT_SCOPE_CANONICAL.md | X-Organization-Id header |
| BRANDING_CANONICAL.md | ../QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md | Design tokens (futuro) |

### Evidence Relacionada

| Evidence | Localização | Objetivo |
|----------|-------------|----------|
| EVIDENCE_PORTAL_AUDIT_01_INVENTORY.md | evidence/ | Audit de artefatos e riscos |
| EVIDENCE_PORTAL_CANONICALIZATION_01.md | evidence/ | Gates 1-6 completos |

---

## 🚧 Próximas Fases

### PORTAL-CORE-02 (Futuro)
- Refresh token no frontend (quando `AUTH_ENABLE_REFRESH=true`)
- Branding canônico (QIM_BRANDING_v1)
- Testes E2E com Playwright

### Integração Módulos (Fases N+1)
- Rotas reais de Document/HACCP/NC
- Lazy loading de módulos
- State management (Zustand/Redux se necessário)

---

**Versão**: 1.0.0  
**Mantenedor**: QIM EDGE Core Team
