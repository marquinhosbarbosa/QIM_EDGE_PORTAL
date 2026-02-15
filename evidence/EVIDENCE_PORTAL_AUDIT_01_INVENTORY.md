# EVIDENCE_PORTAL_AUDIT_01_INVENTORY.md

**Data**: 2026-02-14  
**Status**: ✅ AUDITORIA GATE 1 — INVENTÁRIO COMPLETO  
**Objetivo**: Mapear artefatos, dependências, scripts e riscos do QIM_EDGE_PORTAL

---

## 📋 Checkpoint A — Árvore e Artefatos

### Estrutura Física

```
QIM_EDGE_PORTAL/
├── index.html                    ← Entry HTML + script load
├── package.json                  ← npm config + scripts
├── package-lock.json             ← Lock file (versionado ✅)
├── tsconfig.json                 ← TypeScript config (strict mode)
├── tsconfig.node.json            ← TS config para build
├── vite.config.ts                ← Vite + proxy de API
├── node_modules/                 ← ⚠️ Build artifact (não SSOT)
├── dist/                         ← ⚠️ Build artifact (não SSOT)
├── .gitignore                    ← ✅ Cobertura completa
├── .vscode/                      ← Editor config (OK, ignorado)
├── src/
│   ├── main.tsx                  ← Bootstrap (React 18)
│   ├── App.tsx                   ← Roteamento via react-router-dom
│   ├── index.css                 ← Global styles
│   ├── api/
│   │   └── client.ts             ← ✅ API Client (fetch wrapper, interceptors)
│   ├── auth/
│   │   ├── SessionProvider.tsx   ← ✅ Session context (SSOT de sessão)
│   │   ├── guards.tsx            ← ✅ RequireAuth guard (route protection)
│   │   └── types.ts              ← ✅ Contratos TypeScript
│   ├── pages/
│   │   ├── Login.tsx             ← ✅ Forms e submissão (real)
│   │   └── app/
│   │       ├── AppLayout.tsx     ← ✅ Layout + sidebar RBAC
│   │       ├── Dashboard.tsx     ← Placeholder dashboard
│   │       ├── Config.tsx        ← Users, Roles, Orgs (stub)
│   │       └── Modules.tsx       ← Document, HACCP, NC (stub)
│   └── utils/
│       └── errors.ts             ← ✅ Error handling + logout logic
├── evidence/
│   └── EVIDENCE_PORTAL_CORE_01_LOGIN_HUB.md ← Previous gate
└── docs/                         ← ❌ NÃO EXISTE (será criado Gate 2)
    └── governance/               ← (será criado)
```

### Artefatos Build (Não SSOT)

| Caminho | Tipo | Status | Razão |
|---------|------|--------|-------|
| `node_modules/` | ⚠️ Ignorado | ✅ em .gitignore | Reinstalável via `npm install` |
| `dist/` | ⚠️ Ignorado | ✅ em .gitignore | Gerado por `npm run build` |
| `package-lock.json` | ✅ Versionado | Pré-requisito | Garante reprodutibilidade |

---

## 📦 Checkpoint B — Dependências Principais

### Runtime (production)

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.0"
}
```

**Análise**:
- ✅ React 18 — Moderna, suporta concurrent rendering
- ✅ react-router-dom 6 — SPA modern routing (layout routes)
- ❌ **Ausente**: axios ou fetch wrapper — Portal usa fetch nativo (OK para MVP)
- ❌ **Ausente**: UI library (Material-UI, Radix) — CSS puro (OK para MVP)
- ❌ **Ausente**: State management (Redux, Zustand) — Context API (OK para portal light)

### Build & Development

```json
{
  "typescript": "^5.3.3",               // Type checking
  "vite": "^5.0.11",                   // ESM bundler
  "@vitejs/plugin-react": "^4.2.1",    // JSX transform
  "eslint": "^8.56.0",                 // Linting
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "@typescript-eslint/parser": "^6.19.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.5"
}
```

**Análise**:
- ✅ TypeScript 5.3 — Strict mode habilitado (verificar tsconfig.json)
- ✅ Vite 5 — Fast build + HMR dev
- ✅ ESLint + React rules — Linting ativo
- ❌ **Ausente**: Vitest/Jest — Sem testes unitários (tech debt)

---

## 🔧 Checkpoint C — Scripts npm

### Definidos em package.json

| Script | Comando | Propósito | Status |
|--------|---------|-----------|--------|
| `dev` | `vite` | Inicia dev server (HMR) | ✅ Funcional |
| `build` | `tsc && vite build` | Type check + bundle | ✅ Funcional |
| `preview` | `vite preview` | Preview da build | ✅ Funcional |
| `lint` | `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0` | Lint obrigatório | ✅ Funcional |

**Análise**:
- ✅ Build pipeline limpa (TypeScript → Vite)
- ✅ Lint com zero warnings (strict)
- ❌ **Ausente**: `typecheck` script separado (faz parte de `build`)
- ❌ **Ausente**: `test` script (sem testes)

---

## 🔐 Checkpoint D — Configuração de Ambiente

### .gitignore Atual

```
# Cobertura
node_modules/        ✅
dist/                ✅
.env                 ✅
.env.local           ✅
.env.*.local         ✅
dist-ssr/            ✅
*.local              ✅
.vscode/*            ✅ (com exceção de extensions.json)
.idea/               ✅
.DS_Store/           ✅
```

**Status**: ✅ **COMPLETO** — Nenhum artefato sensível versionado

### Variáveis de Ambiente Esperadas

#### ❌ Ausente: .env.example

Deve ser criado com:
```bash
# API Backend
VITE_CORE_CONFIG_BASE_URL=http://127.0.0.1:8001
VITE_API_TIMEOUT_MS=30000

# (Futuro) Branding / Feature flags
VITE_APP_NAME=QIM EDGE Portal
VITE_ENABLE_MODULES_DOCUMENT=true
VITE_ENABLE_MODULES_HACCP=true
VITE_ENABLE_MODULES_NC=true
```

**Risco**: Desenvolvedores novos não sabem quais variáveis configurar.

---

## 🏗️ Checkpoint E — Arquitetura Renderizada

### Responsabilidades (Separated Concerns)

```
Portal (QIM_EDGE_PORTAL)
  ├── Auth Layer
  │   ├── SessionProvider      ← State manager de sessão
  │   ├── guards.tsx           ← Route protection
  │   └── types.ts             ← Contratos TypeScript
  │
  ├── API Layer (Client)       ← Fetch wrapper
  │   ├── Interval headers      (Authorization, X-Organization-Id)
  │   ├── Error handling        (401 → logout)
  │   └── Response parsing      (envelope {items, total}, etc.)
  │
  ├── Pages Layer              ← UI Components
  │   ├── Login.tsx            ← Real submit (htpp POST /auth/login)
  │   ├── AppLayout.tsx        ← Hub + sidebar
  │   ├── Config               ← Stubs para User/Role/Org management
  │   └── Modules              ← Stubs para Document/HACCP/NC
  │
  └── Router                   ← react-router-dom v6
      ├── Public: /login
      └── Protected: /app/*
```

### Dependência com Módulos

```
Portal → CORE_CONFIG
  └── /auth/login        (email/password → token)
  └── /auth/me           (token → user info + org)
  └── /auth/logout       (token → invalidate)
  └── (Futuro) /rbac/*   (permissions management)

Portal → (Futuro) Document/HACCP/NC
  └── Embeds módulos em /app/modules/*
  └── Verifica permissions antes de renderizar
```

---

## 🔴 Checkpoint F — Riscos Identificados

### 1. **Sem .env.example** — Bloqueante para onboarding

**Impacto**: Desenvolvedores novos rodam app com config padrão (pode quebrar).  
**Fix**: Criar .env.example (Gate 3).

### 2. **Falta de tipos para componentes Page**

**Impacto**: Config.tsx, Modules.tsx são stubs sem props/state tipados.  
**Fix**: Documentar contratos esperados em PORTAL_ARCH_CANONICAL.md (Gate 2).

### 3. **SQLite não é suportado no Portal**

**Impacto**: API backend DEVE ser PostgreSQL async (conforme CORE_CONFIG canonicidade).  
**Fix**: Já garantido por CORE_CONFIG (nada a fazer).

### 4. **Sem testes unitários**

**Impacto**: Mudanças arriscadas em Session, guards podem quebrar silent.  
**Fix**: Tech debt D-PORTAL-TESTS-01 (postergado).

### 5. **Branding/Design tokens não canônicos**

**Impacto**: Cada página pode ter estilos diferentes.  
**Fix**: Tech debt D-PORTAL-TOKENS-01 (será registrado Gate 6).

### 6. **Rotas hardcoded em páginas**

**Impacto**: Mudanças de rota exigem edição em múltiplos arquivos.  
**Fix**: Documentar mapa de rotas em PORTAL_ROUTING_CANONICAL.md (futuro).

---

## ✅ Checkpoint G — DoD de Gate 1

| Item | Status | Evidência |
|------|--------|-----------|
| Árvore de arquivos mapeada | ✅ | Checkpoint A |
| Dependências analisadas | ✅ | Checkpoint B |
| Scripts npm documentados | ✅ | Checkpoint C |
| .gitignore validado | ✅ | Checkpoint D |
| Artefatos build excluídos de SSOT | ✅ | Checkpoint D |
| Arquitetura renderizada | ✅ | Checkpoint E |
| Riscos identificados | ✅ | Checkpoint F (6 riscos) |

---

## 📌 Status Gate 1

✅ **APROVADO** — Inventário completo, riscos mapeados, pronto para Gates 2-6.

**Próximo**: Gate 2 — Canonicidade (docs/governance).
