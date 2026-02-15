# INSTANCE_1_DEV_CANONICAL.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: ✅ CANÔNICO  
**Escopo**: Setup local, desenvolvimento, troubleshooting

---

## 🎯 Objetivo

Guia mínimo obrigatório para rodar Portal localmente com CORE_CONFIG.

---

## 🚀 Quick Start (5 minutos)

### 1. Instalar Dependências

```bash
cd c:\DEV\QIM_EDGE_PORTAL
npm install
```

**Saída esperada**: `added X packages in Y seconds`

### 2. Verificar Backend Rodando

O Portal espera CORE_CONFIG em `http://127.0.0.1:8001`.

**Verificar**:
```bash
curl http://127.0.0.1:8001/auth/me  # Deve retornar 401 (sem token)
```

Se retornar conexão recusada (`curl: (7) Failed to connect`), start CORE_CONFIG primeiro:

```bash
cd c:\DEV\QIM_EDGE_CORE_CONFIG
python .venv/Scripts/python.exe -m uvicorn qim_platform.main:app --reload \
  --host 127.0.0.1 --port 8001
```

### 3. Rodar Dev Server

```bash
npm run dev
```

**Saída esperada**:
```
  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### 4. Abrir Browser

```
http://localhost:3000
```

Deve redirecionar para `/login`.

---

## ⚙️ Configuração de Variáveis de Ambiente

### .env.example Mínima

```bash
# API Backend
VITE_CORE_CONFIG_BASE_URL=http://127.0.0.1:8001

# Request Timeout (ms)
VITE_API_TIMEOUT_MS=30000

# Branding (futuro)
VITE_APP_NAME=QIM EDGE Portal
VITE_ENABLE_MODULES_DOCUMENT=true
VITE_ENABLE_MODULES_HACCP=true
VITE_ENABLE_MODULES_NC=true
```

### Usar em Desenvolvimento

```bash
# Copiar template
copy .env.example .env.local

# (Opcional) Editar se CORE_CONFIG está em outro lugar
# VITE_CORE_CONFIG_BASE_URL=http://seu-host:8001
```

**Vite carrega automático**: `VITE_*` vars aparecem em `import.meta.env.VITE_*`.

Exemplo:
```typescript
const baseURL = import.meta.env.VITE_CORE_CONFIG_BASE_URL || '/api';
```

---

## 🔍 Verificação de Setup

### Health Check Script

```bash
# Verificar dependências instaladas
npm list  # Mostra árvore de pacotes

# Verificar TypeScript
npm exec tsc -- --version

# Verificar Vite
npm exec vite -- --version

# Verificar ESLint
npm exec eslint -- --version
```

### Test Build Localmente

```bash
npm run build  # Compila TypeScript + bundla com Vite
```

**Saída esperada**:
```
✓ 123 modules transformed
dist/index.html  10.5 kB │ gzip: 3.5 kB
dist/assets/main-xxxxx.js  45.2 kB │ gzip: 15.3 kB
```

Se falhar em `tsc`, corrigir type errors antes de prosseguir.

---

## 🐛 Modo Debug

### Logs no Console

```javascript
// src/api/client.ts
private async request<T>(endpoint: string, options: RequestInit = {}) {
  console.log(`[API] → ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, { ...options, headers });
    console.log(`[API] ← ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`[API] Error:`, errorData);
      throw errorData;
    }
    
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(`[API] Exception:`, e);
    throw e;
  }
}
```

**Usar em Dev**: Abrir DevTools (F12) → Console.

**Cuidado**: Não logar token! Risco XSS.

### Inspecionar SessionStorage

```javascript
// No console do browser
sessionStorage.getItem('access_token')  // Mostra token (⚠️ cuidado)
sessionStorage.getItem('organization_id')
sessionStorage.getItem('expires_at')

// Limpar sessão
sessionStorage.clear()
```

---

## 📋 Pré-requisitos de Desenvolvimento

### Ferramentas

- **Node.js** >= 18 (recomendado 20.x)
  - Verificar: `node --version`
- **npm** >= 9
  - Verificar: `npm --version`
- **Git**
- **Editor** (VS Code recomendado)

### Extensões VS Code (Opcional)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "sonarsource.sonarlint-vscode"
  ]
}
```

### Backend (Obrigatório)

- CORE_CONFIG rodando em `http://127.0.0.1:8001`
- PostgreSQL rodando (CORE_CONFIG dependency)
- User de teste criado em CORE_CONFIG

---

## 🧪 Credenciais de Teste (Example)

Supondo que você criou usuário em CORE_CONFIG:

```
Email: test@empresa.com
Password: TestPass123!
Org: Acme Corp
Role: admin
```

**Logar no Portal**:
1. Ir para `http://localhost:3000`
2. Inputar email: `test@empresa.com`
3. Inputar senha: `TestPass123!`
4. Click "Entrar"
5. Esperado: Redireciona para `/app` (Hub com usuário autenticado)

---

## 🚨 Troubleshooting

### "Cannot find module '@vitejs/plugin-react'"

```bash
npm install
npm run dev
```

### "Port 3000 is already in use"

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Ou mudar porta em vite.config.ts (não recomendado)
server: {
  port: 3001,  // <- mudar aqui
}
```

### "CORE_CONFIG não responde"

```bash
# Verificar se está rodando
curl http://127.0.0.1:8001/auth/me

# Se falhar, start CORE_CONFIG:
cd c:\DEV\QIM_EDGE_CORE_CONFIG
python .venv/Scripts/python.exe -m uvicorn qim_platform.main:app \
  --host 127.0.0.1 --port 8001
```

### "Login falha com 422 VALIDATION_ERROR"

```
Possíveis causas:
- Email vazio ou malformado
- Password vazio
- User não existe em CORE_CONFIG

Verificar em CORE_CONFIG:
SELECT id, email FROM users WHERE is_active = true;
```

### "Logout não funciona"

Verificar em DevTools:

```javascript
sessionStorage.getItem('access_token')  // Deve existir antes de logout
// Depois de logout, deve retornar null
```

Se não limpar, checar `SessionProvider.logout()`.

---

## 🔄 Fluxo de Desenvolvimento (Iterativo)

### Ciclo Típico

```
1. Edit React component (src/pages/Login.tsx)
   ↓ (HMR automático)
2. Browser atualiza sem full reload
   ↓
3. Test no browser
   ↓
4. (Se trocou type) npm run lint
   ↓
5. Verificar no DevTools se houver erro
   ↓
6. Commit
```

### Type Checking On-The-Fly

```bash
# Executar manualmente
npm run build  # Roda tsc + vite build

# Ou em outro terminal, watchmode
npm exec tsc -- --watch --noEmit
```

---

## 📦 Build para Produção (Preview)

```bash
npm run build
npm run preview  # Roda servidor static mock de produção
```

Abrir `http://localhost:4173` para testar build.

---

## ✅ Status

**APPROVED** — Dev setup canônico definido, troubleshooting coberto.

**Próximo**: INSTANCE_2_CI_CANONICAL.md
