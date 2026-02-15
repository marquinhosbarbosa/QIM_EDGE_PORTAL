# INSTANCE_2_CI_CANONICAL.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: ✅ CANÔNICO  
**Escopo**: Build checks, linting, deploy, CI/CD

---

## 🎯 Objetivo

Garantir Portal está pronto para produção: type-safe, lint-clean, compilável, deployável.

---

## ✅ Checklist de Build (Obrigatório)

### 1. Type Check

```bash
npm run build  # Roda `tsc && vite build`
```

**saída esperada**:
```
✓ 123 modules transformed.
dist/index.html                   10.5 kB │ gzip:   3.5 kB
dist/assets/main-xxxxx.js         45.2 kB │ gzip:  15.3 kB
```

**Se falhar em TypeScript**:
```
src/pages/Login.tsx:123: error TS2345
Argument of type '{ foo: string }' is not assignable to parameter of type '{ bar: string }'
```

**Fix**: Corrigir type errors antes de deploy.

### 2. Lint Check

```bash
npm run lint
```

**Saída esperada**:
```
✔ No files match the pattern.
```

Se houver warnings (não erros, porque lint.max-warnings = 0):

```
src/pages/Login.tsx
  123:5  error  'unusedVar' is defined but never used  @typescript-eslint/no-unused-vars
```

**Fix**: Remover código unused ou adicionar `// eslint-disable-line`.

---

## 🏗️ Build Pipeline

### Executar Localmente (antes de push)

```bash
# Em sequence:
npm install              # Atualizar deps (se necessário)
npm run lint            # ESLint check
npm run build           # TypeScript + Vite
npm run preview         # Testar build staticamente
```

Se tudo passar, seguro fazer commit + push.

### Exemplo CI/CD (GitHub Actions proposto)

```yaml
# .github/workflows/build.yml
name: Build & Deploy

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

## 🚀 Deployment Targets

### Development → QA

```bash
npm run build
# Output: dist/ (static files)

# Deploy para: test.qimedge.com/portal
# Env vars: VITE_CORE_CONFIG_BASE_URL=https://api-test.qimedge.com
```

### QA → Produção

```bash
npm run build
# Output: dist/ (static files)

# Deploy para: app.qimedge.com
# Env vars: VITE_CORE_CONFIG_BASE_URL=https://api.qimedge.com
```

### Artifact

Build produz arquivo estático: `dist/index.html` + assets.

```
dist/
├── index.html              (10.5 kB)
├── assets/
│   ├── main-xxxxx.js       (45.2 kB)
│   └── style-yyyyy.css     (2.1 kB)
└── favicon.ico
```

**Deployment**: Upload `dist/` para CDN ou web server com gzip + caching.

---

## 🔐 Checklist de Segurança (Build)

- [ ] Sem token hardcoded em código
- [ ] Sem password hardcoded em código
- [ ] Sem `console.log(token)` ou similar
- [ ] `.env.local` e `.env` em `.gitignore`
- [ ] Build step `tsc` valida types (sem `any` generalizado)
- [ ] ESLint passa sem warnings

**Verificar antes de deploy**:

```bash
# Buscar por token/password em fonte
grep -r "token.*=" src/
grep -r "password.*=" src/

# Deve retornar vazio ou apenas config-safe patterns
```

---

## 📊 Performance Checks (Optional)

### Bundle Size

```bash
npm run build
# Verificar output
```

**Esperado**: ~50-60 kB (gzipped). Se > 100 kB, investigar.

```bash
# Analisar com rollup-plugin-visualizer (futuro)
# npm install --save-dev rollup-plugin-visualizer
```

### Lighthouse (DevTools)

1. Abrir `npm run preview` (http://localhost:4173)
2. DevTools → Lighthouse → Generate report
3. Esperado: Performance > 80, Accessibility > 80

**Tech Debt**: D-PORTAL-PERF-01 (otimização futura)

---

## 🐳 Docker (Opcional, Futuro)

### Dockerfile Proposto

```dockerfile
# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Status**: ❌ Não implementado (postergado para Sprint N+2)  
**Tech Debt**: D-PORTAL-DOCKER-01

---

## 🔄 CI/CD Checks (Summary)

| Check | Comando | Obrigatório? | On Failure |
|-------|---------|---|---|
| Lint | `npm run lint` | ✅ | Bloqueia merge |
| TypeScript | `npm run build` (tsc) | ✅ | Bloqueia merge |
| Build | `npm run build` (vite) | ✅ | Bloqueia merge |
| Preview | `npm run preview` | ⚠️ | Só aviso |
| Bundle size | Manual check | ⚠️ | Só aviso |
| Performance | Lighthouse (manual) | ⚠️ | Só aviso |

---

## 🚨 Incident Response

### Build Falha (CI)

1. Verificar erro em CI logs
2. Reproduzir localmente: `npm run build`
3. Fixar type/lint errors
4. Push fix
5. CI roda novamente (automático)

### Deploy Falha

1. Verificar que build passou em CI
2. Verificar que env vars estão corretos no deployment system
3. Verificar CORE_CONFIG está acessível
4. Roll back para versão anterior se necessário

### Portal Down em Produção

1. Verificar status de CORE_CONFIG backup
2. Verificar logs de erro em DevTools (browser)
3. Se critical: roll back deploy
4. Comunicar urgência ao time

---

## 📝 Pre-Deploy Checklist

Antes de fazer deploy:

```
Instância 2 (CI/CD Ready):
- [ ] npm run lint passou (zero warnings)
- [ ] npm run build passou (sem type errors)
- [ ] npm run preview funciona (http://localhost:4173)
- [ ] Login funciona em preview
- [ ] Logout funciona
- [ ] Breadcrumbs e navegação funcionam
- [ ] Nenhum console.error no DevTools
- [ ] .env vars estão configuradas para target (dev/qa/prod)
- [ ] CORE_CONFIG está healthy em target
- [ ] Backup de versão anterior existe
```

---

## ✅ Status

**APPROVED** — Build pipeline canônico, CI/CD checks definidos, deployment ready.

**Próximo**: Gate 3 — Higiene de Repositório.
