# PORTAL_INDEX_SPEC.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: ✅ CANÔNICO  
**Domínio**: QIM_EDGE_PORTAL (Frontend Orquestrador)

---

## 🎯 Objetivo

Mapa único de verdade para o Portal. Define:
- ✅ SSOTs do módulo Frontend
- ✅ Precedência em conflitos
- ✅ Linkagem com canônicos transversais (AUTH, RBAC, TENANT_SCOPE)
- ✅ Roadmap de canonicidade

---

## 📚 Hierarquia de Documentos (Ordem de Leitura)

### Instância 1 — Nível Estrutural (Deve ser lido PRIMEIRO)

| Documento | Escopo | Autoridade | Quando Ler |
|-----------|--------|-----------|-----------|
| **PORTAL_INDEX_SPEC.md** | Este arquivo | 1ª (você está aqui) | Sempre começar por aqui |
| **PORTAL_ARCH_SPEC.md** | Componentes, responsabilidades, separação | 1ª | Para entender arquitetura |
| **PORTAL_AUTH_SPEC.md** | SessionProvider, token, logout | 1ª | Para trabalhar com autenticação |
| **PORTAL_API_CONTRACT_SPEC.md** | Cliente HTTP, baseURL, interceptors | 1ª | Para consumir endpoints |

### Instância 2 — Nível Operacional (Deploy, Dev)

| Documento | Escopo | Autoridade | Quando Ler |
|-----------|--------|-----------|-----------|
| **INSTANCE_1_DEV_LOCAL_POLICY.md** | Setup local, npm run dev | 1ª | Para rodar em máquina |
| **INSTANCE_2_CI_LOCAL_POLICY.md** | Build checks, lint, deploy | 1ª | Para CI/CD e produção |

### Instância 3 — UI/UX (Futuro)

| Documento | Status | Roadmap |
|-----------|--------|---------|
| **PORTAL_UI_UX_SPEC.md** | 👷 Em escopo | Sprint N+2 |
| **PORTAL_ROUTING_SPEC.md** | 👷 Em escopo | Sprint N+1 |

---

## 🔗 Governança Transversal (Bridges)

O Portal consome governança centralizada de `QIM_EDGE_GOVERNANCE`:

### Leitura Obrigatória (Antes de qualquer feature de Auth/RBAC/Branding)

1. **[QIM_EDGE_GOVERNANCE/docs/governance/CANONICAL_INDEX.md](../../QIM_EDGE_GOVERNANCE/docs/governance/CANONICAL_INDEX.md)** — Hierarquia máxima transversal
2. **[QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md](../../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md)** — Endpoints `/auth/login`, `/auth/me`, `/auth/logout`
3. **[QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md](../../QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md)** — Permissões, roles, guards
4. **[QIM_EDGE_GOVERNANCE/docs/governance/TENANT_SCOPE_CANONICAL.md](../../QIM_EDGE_GOVERNANCE/docs/governance/TENANT_SCOPE_CANONICAL.md)** — `X-Organization-Id` header (não `X-Tenant-Id`)
5. **[QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md](../../QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md)** — Design tokens (futuro)

---

## 🎯 Precedência em Conflitos

**Escopo Transversal** (Auth, RBAC, Tenant, Branding):
1. `QIM_EDGE_GOVERNANCE/docs/governance/` — **Precedência máxima**
2. SSOT físico apontado pelo bridge
3. `docs/governance/PORTAL_*` (somente se não conflitar com transversal)

**Escopo Portal** (Roteamento, componentes, UI):
1. `docs/governance/PORTAL_ARCH_SPEC.md`
2. Governança transversal (se aplicável)

---

## 📋 Checklist de Leitura (Obrigatório)

Antes de trabalhar no Portal:

- [ ] Li este arquivo (PORTAL_INDEX_SPEC.md)
- [ ] Li QIM_EDGE_GOVERNANCE/CANONICAL_INDEX.md (transversal)
- [ ] Li PORTAL_ARCH_SPEC.md (arquitetura local)
- [ ] (Se autenticação) Li PORTAL_AUTH_SPEC.md
- [ ] (Se chamar API) Li PORTAL_API_CONTRACT_SPEC.md
- [ ] (Se rodar local) Li INSTANCE_1_DEV_LOCAL_POLICY.md
- [ ] (Se fazer build/deploy) Li INSTANCE_2_CI_LOCAL_POLICY.md

---

## 🛡️ Guardrails (Proibições)

❌ **NUNCA**:
- Logar token no console (facilita roubo via XSS)
- Usar `X-Tenant-Id` header (usar `X-Organization-Id`)
- Renderizar menu/rota sem checar permission (fail-closed)
- Criar token refresh logic (esperar do backend CORE_CONFIG)
- Inventar novos endpoints fora de contracts

✅ **SEMPRE**:
- Usar SessionProvider para todas as sessões
- Injetar Authorization + X-Organization-Id via API client
- Falhar fechar em 401 (logout forçado)
- Respeitar contratos de CORE_CONFIG e módulos

---

## 🚀 Roadmap de Canonicidade

### Sprint N (Atual — 2026-02-14) ✅

- [x] Gate 1 — Inventário completo
- [x] Gate 2 — Canônicos Instância 1/2
- [ ] Gate 3 — Higiene de repo (.env.example, .gitignore)
- [ ] Gate 4 — API client validação
- [ ] Gate 5 — Auth guard validação
- [ ] Gate 6 — Evidence final + dívidas

### Sprint N+1

- [ ] D-PORTAL-ROUTING-01: Mapa de rotas canônico
- [ ] Integração com primeiro módulo (Document?)
- [ ] Tests unitários mínimos

### Sprint N+2

- [ ] D-PORTAL-TOKENS-01: Design tokens + Branding
- [ ] PORTAL_UI_UX_SPEC.md

---

## ✅ Status

**APPROVED** — Índice canônico estabelecido. Pronto para Gates 3-6.

**Próximo**: Gate 3 — Higiene de Repositório.
