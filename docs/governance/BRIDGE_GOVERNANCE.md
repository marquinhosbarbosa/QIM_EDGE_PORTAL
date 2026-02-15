# BRIDGE GOVERNANCE — Governança Transversal (QIM EDGE PORTAL)

**Versão**: 1.0.0  
**Data**: 2026-02-15  
**Status**: BRIDGE LOCAL (Não Normativo)

---

## ⚠️ AVISO CRÍTICO

Este arquivo é um **BRIDGE**.  
Ele **NÃO duplica conteúdo** — apenas aponta para SSOT.

**Os 6 documentos macro canônicos existem SOMENTE em QIM_EDGE_GOVERNANCE.**  
Qualquer duplicação local foi REMOVIDA para evitar drift.

---

## 📍 SSOT Transversal (Autoridade Máxima)

**Repositório**: `QIM_EDGE_GOVERNANCE`  
**Path relativo**: `../QIM_EDGE_GOVERNANCE/docs/governance/`  
**Path absoluto**: `C:\DEV\QIM_EDGE_GOVERNANCE\docs\governance\`

---

## 📚 Os 6 Documentos Macro Canônicos (OBRIGATÓRIOS)

**Localização única**: `QIM_EDGE_GOVERNANCE/docs/governance/`

1. **CANONICAL_INDEX.md** — Hierarquia e precedência global  
2. **VCP_CANONICAL.md** — SSOT, Tenant-scope, Soft-delete, Auditoria  
3. **CEA_CANONICAL.md** — Arquitetura, separação de responsabilidades  
4. **API_CONTRACT.md** — Contratos REST, padrões HTTP  
5. **CODING_STANDARDS.md** — Type hints, Pydantic v2, SQLAlchemy async  
6. **TESTING_CANONICAL.md** — Testes como governança, P0/P1/P2

---

## 📚 Documentos Transversais Aplicáveis ao Portal

### Branding e UI/UX
- **BRANDING_CANONICAL.md** — Paleta, tipografia, Q Quadrado  
  `../QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md`

### Autenticação e Autorização
- **AUTH_CONTRACT.md** — JWT, Login, Logout  
  `../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md`

- **RBAC_CONTRACT.md** — Roles, Permissions, Fail-closed  
  `../QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md`

### Tenant Scope
- **TENANT_SCOPE_CANONICAL.md** — X-Organization-Id obrigatório  
  `../QIM_EDGE_GOVERNANCE/docs/governance/TENANT_SCOPE_CANONICAL.md`

### Testing
- **TESTING_CANONICAL.md** — Vitest, cobertura >= 80%  
  `../QIM_EDGE_GOVERNANCE/docs/governance/TESTING_CANONICAL.md`

### Security
- **SECURITY_CANONICAL.md** — LGPD, PII, fail-closed  
  `../QIM_EDGE_GOVERNANCE/docs/governance/SECURITY_CANONICAL.md`

---

## 🎯 Regras de Consumo (Não Negociáveis)

✅ **Permitido**:
- Ler SSOTs transversais via este bridge
- Referenciar paleta/tokens do SSOT em código (CSS variables)
- Seguir padrões de Branding/Auth/RBAC

❌ **Proibido**:
- Duplicar conteúdo canônico (branding, tokens)
- Criar paleta/tipografia local (usar BRANDING_CANONICAL)
- Alterar padrões transversais (ex: JWT structure, permissions format)
- Inferir conteúdo se bridge quebrado (PARAR e avisar)
- Criar endpoints de autenticação locais (consumir CORE_CONFIG)

---

## 🚫 Precedência em Conflitos

**Escopo transversal** (Branding, Auth, RBAC, API):
1. `QIM_EDGE_GOVERNANCE/docs/governance/` — **precedência máxima**
2. Backend (CORE_CONFIG endpoints implementados) — **SSOT de runtime**
3. Documentos deste módulo (Portal) — somente se não conflitarem

**Escopo Portal-específico** (UI/UX, Instance config):
1. `docs/governance/PORTAL_ARCH_CANONICAL.md` — Arquitetura local
2. `docs/governance/INSTANCE_1_DEV_CANONICAL.md` / `INSTANCE_2_CI_CANONICAL.md` — Setup específico
3. Governança transversal (se aplicável)

Ver: `../QIM_EDGE_GOVERNANCE/docs/governance/PRECEDENCE_RULES.md`

---

## 📖 Leitura Obrigatória (Ordem de Precedência)

Ao desenvolver no Portal:

### Instância 1 — Local (Estrutura)
1. `docs/governance/CANONICAL_INDEX_PORTAL.md` — Mapa de SSOT local
2. `docs/governance/PORTAL_ARCH_CANONICAL.md` — Arquitetura
3. `docs/governance/PORTAL_AUTH_CANONICAL.md` — Autenticação (se mexer em auth)
4. `docs/governance/PORTAL_API_CONTRACT_CANONICAL.md` — API Client (se mexer em API)
5. `docs/governance/INSTANCE_1_DEV_CANONICAL.md` — Setup local

### Instância 2 — Transversal (Governança)
1. `../QIM_EDGE_GOVERNANCE/docs/governance/CANONICAL_INDEX.md` ⭐⭐⭐
2. `../QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md` (se UI)
3. `../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md` (se auth)
4. `../QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md` (se permissions)

---

## 🔍 Como Usar Este Bridge

### Exemplo 1: Consumir Branding
```typescript
// ❌ ERRADO: Criar paleta local
const colors = {
  primary: '#0066CC',  // Pode desincronizar!
  secondary: '#FF6600'
};

// ✅ CORRETO: Consumir via CSS variables (definidas em BRANDING_CANONICAL)
const Button = styled.button`
  background-color: var(--color-primary);
  color: var(--color-on-primary);
`;
```

### Exemplo 2: Consumir Auth
```typescript
// ❌ ERRADO: Criar endpoint de login local
app.post('/login', async (req, res) => { ... });

// ✅ CORRETO: Consumir endpoint de CORE_CONFIG
const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## 📞 Suporte

**Dúvidas sobre governança transversal?**  
→ Consultar QIM_EDGE_GOVERNANCE/AGENTS.md  

**Dúvidas sobre Portal-específico?**  
→ Consultar AGENTS.md deste repositório  

**Conflito entre transversal e local?**  
→ Transversal vence em escopo transversal (Branding, Auth, RBAC)  
→ Local vence em escopo Portal (UI/UX, layout, routing)

---

**Versão**: 1.0.0  
**Última atualização**: 2026-02-15  
**Mantenedor**: QIM EDGE Core Team
