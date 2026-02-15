# AGENTS — Atalhos e Regras Operacionais (QIM_EDGE_PORTAL)

**Versão**: 1.0.0  
**Data**: 2026-02-14  
**Status**: CANÔNICO

**Versão**: 1.0.0  
**Data**: 2026-02-13  
**Status**: CANÔNICO

---

## ⚠️ REGRAS DE OURO (NÃO NEGOCIÁVEIS)

### 1️⃣ Este Repo é um Módulo de Frontend

✅ Consome APIs do CORE_CONFIG (auth, rbac)  
✅ Seguinte contratos canônicos (AUTH_CONTRACT, RBAC_CONTRACT, TENANT_SCOPE)  
✅ Fail-closed obrigatório (sem permission → acesso negado)

❌ **PROIBIDO**:
- Inventar endpoints fora dos contratos
- Usar `X-Tenant-Id` (usar `X-Organization-Id`)
- Renderizar menus sem checar permissions
- Logar token no console
- Armazenar senha ou token no código

### 2️⃣ Precedência em Contratos

Ao desenvolver no Portal:

1. **Transversal** (AUTH, RBAC, TENANT_SCOPE) → `QIM_EDGE_GOVERNANCE/docs/governance/`
2. **Backend** (CORE_CONFIG) → endpoints implementados
3. **Frontend** (Portal) → este repo

Em caso de conflito entre frontend e backend: **backend vence** (backend é SSOT).

### 3️⃣ Leitura Obrigatória — Ordem Exata (ATUALIZADO)

Antes de qualquer tarefa:

**Instância 1 — Estrutura Local**:
1. [docs/governance/CANONICAL_INDEX_PORTAL.md](docs/governance/CANONICAL_INDEX_PORTAL.md) — Mapa de SSOT
2. [docs/governance/PORTAL_ARCH_CANONICAL.md](docs/governance/PORTAL_ARCH_CANONICAL.md) — Arquitetura
3. [docs/governance/PORTAL_AUTH_CANONICAL.md](docs/governance/PORTAL_AUTH_CANONICAL.md) — Autenticação (se mexer em auth)
4. [docs/governance/PORTAL_API_CONTRACT_CANONICAL.md](docs/governance/PORTAL_API_CONTRACT_CANONICAL.md) — API Client (se mexer em API)
5. [docs/governance/INSTANCE_1_DEV_CANONICAL.md](docs/governance/INSTANCE_1_DEV_CANONICAL.md) — Setup local

**Instância 2 — Build/Deploy**:
- [docs/governance/INSTANCE_2_CI_CANONICAL.md](docs/governance/INSTANCE_2_CI_CANONICAL.md) — CI/CD checks

**Transversal (Lido de QIM_EDGE_GOVERNANCE)**:
1. `../QIM_EDGE_GOVERNANCE/docs/governance/CANONICAL_INDEX.md`
2. `../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md` (se mexer em autenticação)
3. `../QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md` (se mexer em permissões)
4. `../QIM_EDGE_GOVERNANCE/docs/governance/TENANT_SCOPE_CANONICAL.md` (sempre que usar headers)

Se qualquer arquivo estiver ausente: **PARE e avise**.

---

## 🎯 Atalhos Reconhecidos

### @portal-auth
Lê contratos de autenticação + SessionProvider + guards.

### @portal-rbac
Lê RBAC_CONTRACT + guards + menu filtering.

### @portal-api
Lê API client + interceptors.

---

## 📋 Checklist de Tarefa (Obrigatório)

Ao finalizar qualquer tarefa:

- [ ] Li AUTH_CONTRACT.md antes de mexer em auth
- [ ] Usei X-Organization-Id (não X-Tenant-Id)
- [ ] Fail-closed: sem permission → acesso negado
- [ ] Não loguei token no console
- [ ] Segui precedência (backend vence)
- [ ] Criei evidência se aplicável

---

## 🚫 Violações Comuns (Evitar)

❌ "Vou criar endpoint de login no frontend"  
→ **Violação SSOT**. Consumir `/api/v1/auth/login` do CORE_CONFIG.

❌ "Vou mostrar o menu mesmo sem permission porque é bonito"  
→ **Violação fail-closed**. Ocultar menu se não tem permission.

❌ "Vou logar o token no console para debug"  
→ **Violação de segurança**. Nunca logar token (facilita roubo via XSS).

❌ "Vou usar localStorage porque quero que token persista"  
→ **Risco XSS**. Preferir sessionStorage (segue dívida D-PORTAL-01.1).

---

## 🔗 Integração com Módulos (Futuro)

Quando integrar HACCP, Document, NC:

✅ Cada módulo deve ter suas rotas em `/app/modules/<modulo>`  
✅ Cada módulo verifica permissões específicas (ex: `documents.read`)  
✅ RBAC-driven: só mostra item se tem permission

❌ Não copiar módulos para dentro do Portal (repos separados)  
❌ Não inventar permissões não documentadas no RBAC_CONTRACT  

---

## 🏗️ Gates de Canonicização (Sprint N — 2026-02-14)

Todos os gates abaixo foram **COMPLETOS**:

| Gate | Status | Evidência |
|------|--------|-----------|
| 1 — Inventário | ✅ | [EVIDENCE_PORTAL_AUDIT_01_INVENTORY.md](evidence/EVIDENCE_PORTAL_AUDIT_01_INVENTORY.md) |
| 2 — Docs Canônicas | ✅ | 7 arquivos em `docs/governance/` |
| 3 — Higiene de Repo | ✅ | `.env.example` + `.gitignore` validado |
| 4 — API Client | ✅ | Validação em GATE 4 |
| 5 — Auth Guard | ✅ | Validação em GATE 5 |
| 6 — Evidence Final | ✅ | [EVIDENCE_PORTAL_CANONICALIZATION_01.md](evidence/EVIDENCE_PORTAL_CANONICALIZATION_01.md) |

**Resultado**: Portal "UI/UX Ready" estruturalmente (sem bloqueadores).

---

## 📝 Checklist de Tarefa (ATUALIZADO — 2026-02-14)

Ao finalizar **qualquer** tarefa no Portal:

- [ ] Li [CANONICAL_INDEX_PORTAL.md](docs/governance/CANONICAL_INDEX_PORTAL.md)
- [ ] Li documento relevante (ARCH, AUTH, API, etc.) conforme tarefa
- [ ] Build passa: `npm run build` (TypeScript + Vite)
- [ ] Lint passa: `npm run lint` (zero warnings)
- [ ] Auth: Usei SessionProvider + guards + nunca loguei token
- [ ] API: Injectei Authorization + X-Organization-Id headers automaticamente
- [ ] Fail-closed: Sem permission → acesso negado (não mostrar)
- [ ] Tests: Rodar testes se aplicável (futuro: Vitest)
- [ ] Evidence: Criar `evidence/EVIDENCE_PORTAL_*.md` se for feature significante

---

## 📊 Sprint Roadmap

- **Sprint N (ATUAL)**: Canonicização base ✅ COMPLETO
- **Sprint N+1**: Integração (Document/HACCP/NC) + Tests [Ver ROADMAP_PORTAL_POST_CANONICALIZATION.md](ROADMAP_PORTAL_POST_CANONICALIZATION.md)
- **Sprint N+2**: Branding + UX polish
- **Sprint N+3**: Hardening + deploy  

---

**Versão**: 1.0.0  
**Última atualização**: 2026-02-13  
**Mantenedor**: QIM EDGE Core Team
