# PORTAL-CORE-01 — Quick Reference

**Status**: ✅ COMPLETO  
**Data**: 2026-02-13

---

## 🚀 Como Rodar

```bash
# 1. Instalar dependências (já feito)
cd c:\DEV\QIM_EDGE_PORTAL
npm install

# 2. Garantir que CORE_CONFIG está rodando
# Porta: http://127.0.0.1:8001

# 3. Rodar Portal
npm run dev

# Acessa: http://localhost:3000
```

---

## 🔑 Credenciais de Teste

Usar usuário existente no CORE_CONFIG.

Exemplo:
```
Email: admin@empresa.com
Password: AdminPass123!
```

Se não existe, criar via seed ou diretamente no DB.

---

## ✅ Checklist de Validação Manual

- [ ] Acessa `http://localhost:3000` → redirect `/login`
- [ ] Login válido → vai `/app`
- [ ] Login inválido → erro "Credenciais inválidas"
- [ ] Hub mostra menus por permission (RBAC)
- [ ] Clicar em item → renderiza placeholder
- [ ] Tentar acessar rota sem permission (URL direto) → "Acesso negado"
- [ ] Clicar "Sair" → volta `/login`
- [ ] Tentar usar navegador back após logout → redirect `/login` (token revogado)

---

## 📂 Estrutura Chave

```
src/
├── api/client.ts          # CHECKPOINT B - API Client
├── auth/
│   ├── SessionProvider.tsx # CHECKPOINT C - SSOT frontend
│   └── guards.tsx          # RequireAuth, RequirePermission
├── pages/
│   ├── Login.tsx           # CHECKPOINT D - Login UI
│   └── app/
│       └── AppLayout.tsx   # CHECKPOINT E - Hub RBAC
└── utils/errors.ts         # toUserMessage()
```

---

## 🔗 Documentos Importantes

| Doc | Path |
|-----|------|
| Evidência Completa | `evidence/EVIDENCE_PORTAL_CORE_01_LOGIN_HUB.md` |
| README | `README.md` |
| Regras de Agente | `AGENTS.md` |
| AUTH_CONTRACT | `../QIM_EDGE_GOVERNANCE/docs/governance/AUTH_CONTRACT.md` |
| RBAC_CONTRACT | `../QIM_EDGE_GOVERNANCE/docs/governance/RBAC_CONTRACT.md` |

---

## 🎯 Próximos Passos

1. **Validação Manual**: seguir checklist acima
2. **Commit Canônico**:
   ```bash
   git add .
   git commit -m "feat(portal): PORTAL-CORE-01 login + hub + session + rbac navigation"
   ```
3. **PORTAL-CORE-02** (próximo sprint):
   - Refresh token frontend
   - Branding QIM
   - Testes E2E Playwright

---

**Build**: ✅ OK (`npm run build`)  
**TypeScript**: ✅ OK (`npx tsc --noEmit`)  
**Deps**: ✅ OK (205 packages)
