# ROADMAP_PORTAL_POST_CANONICALIZATION.md

**Data**: 2026-02-14  
**Status**: 📋 PLANEJAMENTO  
**Escopo**: Próximas fases do Portal (N+1, N+2, N+3)

---

## 🎯 Objetivo

Mapear próximas evoluções do Portal após canonicização base (Instância 1/2).

---

## 🚀 Sprint N+1 (Integração de Módulos)

**Objetivo**: Tornar Portal funcional como orquestrador de módulos (Document, HACCP, NC).

### Tasks

#### 1. Integração Document

- [ ] Definir estratégia: iframes vs Module Federation vs simples links
- [ ] Criar rota `/app/modules/documents` 
- [ ] PassProps: `baseURL`, `apiToken`, `organizationId`
- [ ] RequirePermission com `documents.read`
- [ ] Evidence de integração

**Dependência**: Document module ter export React pronta

**Estimado**: 3-5 dias

#### 2. Integração HACCP

- [ ] Criar rota `/app/modules/haccp`
- [ ] PassProps conforme Document
- [ ] RequirePermission com `haccp.read`

**Dependência**: HACCP module frontend pronta

**Estimado**: 2-3 dias

#### 3. Integração NC

- [ ] Criar rota `/app/modules/nc`
- [ ] PassProps conforme Document
- [ ] RequirePermission com `nc.read`

**Dependência**: NC module frontend pronta

**Estimado**: 2-3 dias

#### 4. Testes Unitários Mínimos

**Escopo**:
- SessionProvider estado machine (loading → auth/anon)
- Login/logout flow
- Guards (RequireAuth, RequirePermission)
- API client error handling

**Framework**: Vitest + React Testing Library

**Estimado**: 5-7 dias

#### 5. Mapa de Rotas Canônico

**Entregável**: `docs/governance/PORTAL_ROUTING_CANONICAL.md`

```
/                          → /app (redirect)
/login                     → Login page (public)
/app                       → Hub/Dashboard (protected)
/app/config/users          → User management (protected, admin only)
/app/config/roles          → Role management (protected, admin only)
/app/config/orgs           → Org management (protected, super-admin)
/app/modules/documents/*   → Document module (protected, documents.read)
/app/modules/haccp/*       → HACCP module (protected, haccp.read)
/app/modules/nc/*          → NC module (protected, nc.read)
/403                       → Access denied page
/404                       → Not found page
```

**Estimado**: 1-2 dias

### Resultado Esperado (Sprint N+1)

- ✅ Portal integrado com 3 módulos
- ✅ Testes unit baseline (>60% coverage)
- ✅ Documentação de rotas atualizada
- ✅ Pronto para testar E2E

---

## 🎨 Sprint N+2 (Branding & UX Polish)

**Objetivo**: Padronizar design tokens com QIM branding, melhorar UX visual.

### Tasks

#### 1. Design Token Integration (D-PORTAL-TOKENS-01)

**Lê de**: [QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md](../../QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md)

**Entregável**:
```
src/theme/
├── colors.ts         (paleta QIM)
├── typography.ts     (fontes, sizes)
├── spacing.ts        (grid, padding, margin)
├── shadows.ts        (elevation)
└── transitions.ts    (animações)
```

**Conteúdo Esperado**:
- Primary: `#0066CC` (ou cor canônica QIM)
- Secondary: `#6B8E23` (ou cor canônica QIM)
- Neutral: Grays para backgrounds, borders
- Font: "Inter" ou tipografia QIM
- Spacing: 4px base (4, 8, 12, 16, 20, 24, 32...)

**Estimado**: 3-5 dias

#### 2. Componentes Base (CSS + TypeScript)

**Entregável**:
```
src/components/
├── Button.tsx        (primary, secondary, danger)
├── Input.tsx         (text, email, password, error states)
├── Form.tsx          (form wrapper, validation display)
├── Modal.tsx         (dialogs, confirmations)
├── Toast.tsx         (notifications)
├── Sidebar.tsx       (navegação RBAC)
└── Header.tsx        (top bar, user menu)
```

**Requisitos**:
- Usar design tokens (colors, typography, spacing)
- TypeScript types completos
- Accessibility (ARIA labels, focus management)
- Mobile responsive (se aplicável)

**Estimado**: 7-10 dias

#### 3. PORTAL_UI_UX_CANONICAL.md (Final)

**Substitui o placeholder atual** com:
- Design token definitions (com valores)
- Componente showcase (Storybook ou manual)
- Padrões de layout (sidebar, modal, form, list)
- Regras de consistência

**Estimado**: 2-3 dias

#### 4. Refactor de Páginas Existentes

- [ ] Login.tsx → usar Button, Input, Form components
- [ ] AppLayout.tsx → usar Header, Sidebar, theme tokens
- [ ] Config pages → usar Table, Form, Modal
- [ ] Module stubs → dar aparência consistente

**Estimado**: 5-7 dias

#### 5. E2E Tests (Cypress ou Playwright)

**Escopo**:
- Login → hub → navigate modules → logout
- Permission checks (sem permission → 403)
- Form submission + validation

**Framework**: Cypress (mais simples) ou Playwright

**Estimado**: 5-7 dias

### Resultado Esperado (Sprint N+2)

- ✅ Design tokens QIM operacionais
- ✅ Componentes base reutilizáveis
- ✅ Portal visualmente polido e consistente
- ✅ E2E tests passando
- ✅ Pronto para produção visual

---

## 🔒 Sprint N+3 (Hardening & Optimization)

**Objetivo**: Segurança, performance, containerização.

### Tasks

#### 1. Refresh Token Implementation (D-PORTAL-AUTH-REFRESH-01)

**Bloqueado por**: CORE_CONFIG implementar `/auth/refresh` endpoint

**Quando CORE_CONFIG implementar**:

```
1. Backend expõe POST /auth/refresh
   Request: { refresh_token: "..." }
   Response: { access_token: "...", refresh_token: "..." }

2. Frontend (ApiClient):
   - Intercepta 401
   - Se refresh_token disponível → POST /auth/refresh
   - Se sucesso → retry original request com novo token
   - Se falha → força logout

3. SessionProvider:
   - Armazena tanto access_token quanto refresh_token
   - Presume backend valida refresh_token (preferencialmente HttpOnly cookie)
```

**Estimado**: 3-5 dias (backend dependency)

#### 2. Segurança: HttpOnly Cookie + CSRF

**Dependência**: Backend implementar HttpOnly cookie para refresh token

**Mudanças Frontend**:
- Remover refresh_token de sessionStorage (vira HttpOnly cookie)
- Adicionar CSRF token em POST/PUT/DELETE requests
- Validar SameSite cookie policy

**Estimado**: 2-3 dias (backend dependency)

#### 3. Docker + nginx

**Entregável**: 
```
Dockerfile (multi-stage)
nginx.conf (static serving com caching)
docker-compose.yml (local dev com CORE_CONFIG)
```

**Recursos**:
- Image base: `nginx:alpine`
- Build stage: Node 20 (tsc + vite build)
- Runtime stage: nginx + dist folder
- Expose: port 80/443

**Estimado**: 2-3 dias

#### 4. CI/CD Hardening

**Tasks**:
- [ ] GitHub Actions: lint + build + test
- [ ] Artifact upload (dist folder) para deploy
- [ ] Secrets: VITE_* env vars seguros
- [ ] Staging deploy check
- [ ] Production deploy gate (manual approval)

**Estimado**: 3-5 dias

#### 5. Performance Optimization

**Targets**:
- Bundle size < 60 kB (gzipped)
- Lighthouse Performance > 85
- FCP < 2s, CLS < 0.1

**Tasks**:
- [ ] Code splitting (lazy load modules)
- [ ] Image optimization (se houver)
- [ ] Font optimization
- [ ] Caching strategy (nginx cache headers)
- [ ] CDN integration (Cloudflare, Akamai, etc.)

**Estimado**: 5-7 dias

#### 6. Monitoring & Observability

**Tasks**:
- [ ] Error tracking (Sentry ou similar)
- [ ] User session tracking (Mixpanel, Amplitude)
- [ ] Performance monitoring (Web Vitals)
- [ ] Logs (stdout/stderr estruturado)

**Estimado**: 3-5 dias

### Resultado Esperado (Sprint N+3)

- ✅ Refresh token operacional (se backend implementar)
- ✅ Containerizado com Docker
- ✅ CI/CD automática via GitHub Actions
- ✅ Performance otimizada (Lighthouse > 85)
- ✅ Observability implementada
- ✅ Production-ready

---

## 📊 Timeline Estimada

| Sprint | Foco | Semanas | Status |
|--------|------|---------|--------|
| N (Atual) | Canonicização base | ✅ 0.5 | COMPLETO |
| N+1 | Módulos + Testes | 2-3 | 📋 Próximo |
| N+2 | Branding + UX | 2-3 | 📋 Futuro |
| N+3 | Hardening + Deploy | 2-3 | 📋 Futuro |

**Total**: ~6-8 semanas após Sprint N

---

## 🎯 Dependências Externas

| Dependência | Status | Impacto |
|-------------|--------|--------|
| CORE_CONFIG pronta | ✅ Pronta (main branch) | Critical |
| Document module pronta | ⏳ Em progresso | Sprint N+1 |
| HACCP module pronta | ⏳ Em progresso | Sprint N+1 |
| NC module pronta | ⏳ Em progresso | Sprint N+1 |
| /auth/refresh endpoint | ⏳ Roadmap CORE_CONFIG | Sprint N+3 |
| QIM Branding specs | ⏳ Roadmap Gov | Sprint N+2 |

---

## 🚨 Riscos Conhecidos (Mitigação)

| Risco | Impacto | Mitigação |
|-------|--------|-----------|
| Module load failures | Sprint N+1 bloqueado | Test integration early |
| Design token misalignment | Need rework | Align com QIM branding early |
| Refresh token complexity | Sprint N+3 complexity | Start design doc early |
| Bundle size creep | Performance issue | Add bundlesize check in CI |

---

## ✅ Definition of Success (Final)

- ✅ Portal = Orquestrador funcional de 3+ módulos
- ✅ Tests: Unit > 60%, E2E smoke tests
- ✅ Performance: Lighthouse > 85
- ✅ Security: Auth + RBAC + CSRF + refresh tokens
- ✅ Deployment: Docker + CI/CD + staging/prod gates
- ✅ Observability: Monitoring + error tracking
- ✅ Documentation: Canônicos completos, roadmaps claros

---

## 📞 How to Execute

1. **Sprint N+1 owner**: Pegar lista de tasks, comitar em repo
2. **Sprint N+2 owner**: Esperar Sprint N+1 completo, depois começar branding
3. **Sprint N+3 owner**: Esperar N+2, depois hardening

Cada sprint cria sua própria evidence em `evidence/EVIDENCE_PORTAL_SPRINTNx_*.md`

---

**Versão**: 1.0.0  
**Mantenedor**: QIM EDGE Core Team  
**Última atualização**: 2026-02-14
