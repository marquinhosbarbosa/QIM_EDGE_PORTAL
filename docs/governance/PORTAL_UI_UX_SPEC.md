# PORTAL_UI_UX_SPEC.md

**Data**: 2026-02-14  
**Versão**: 1.0.0  
**Status**: 🚧 EM ESCOPO (Instância 3, futuro)  
**Domínio**: Design tokens, componentes base, padrões visuais

---

## 🎯 Objetivo (Roadmap)

Documentar padrões de UI/UX do Portal com bridge para BRANDING_CANONICAL transversal.

**Escopo Atual**: ❌ NÃO IMPLEMENTADO

**Roadmap**: Sprint N+2 (após Instância 1/2 canonicalizarem)

---

## 📚 Leitura Obrigatória (Futuro)

Quando implementar branding:

1. [QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md](../../QIM_EDGE_GOVERNANCE/docs/governance/BRANDING_CANONICAL.md)
2. Paleta de cores, tipografia, ícones
3. Componentes base (Button, Form, Modal, etc.)
4. Design System / Token Definitions

---

## 🎨 Placeholder — Estrutura Esperada

### 1. Design Tokens

```javascript
// src/theme/tokens.ts (futuro)
export const colors = {
  primary: '#0066CC',
  secondary: '#6B8E23',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
};

export const typography = {
  fontFamily: 'Inter, sans-serif',
  heading1: { size: '32px', weight: 700 },
  body: { size: '14px', weight: 400 },
};
```

### 2. Componentes Base

```tsx
// src/components/Button.tsx (futuro)
export function Button({ variant = 'primary', children, ...props }) {
  return <button className={`btn btn-${variant}`}>{children}</button>;
}

// src/components/Form.tsx (futuro)
export function FormInput({ label, name, error, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
```

### 3. Padrões de Layout

- **Sidebar + Main**: Usado em AppLayout
- **Modal**: Registro, dialogs
- **Notification Toast**: Feedback de ações
- **Loading Spinner**: Requisições assíncronas

---

## ⚠️ Tech Debt Relacionada

- **D-PORTAL-TOKENS-01**: Padronizar design tokens (BRANDING bridge)
- **D-PORTAL-COLORS-01**: Validar paleta QIM vs. padrão globais
- **D-PORTAL-COMPONENTS-01**: Inventory de componentes reutilizáveis

---

## ✅ Status

**ROADMAP APENAS** — Será implementado após Gate 1/2/3/4/5 canonicalizarem.

**Próximo**: Gate 4 — API Client Validação.
