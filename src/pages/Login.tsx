// Login.tsx - CHECKPOINT D
// ✅ Formulário de login com validação básica
// ✅ Exibe erros canônicos amigáveis
// ✅ Redireciona para /app após login bem-sucedido

import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../auth/SessionProvider';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Validação local básica
  function validate(): boolean {
    if (!email.trim()) {
      setLocalError('Email é obrigatório');
      return false;
    }

    if (!email.includes('@')) {
      setLocalError('Email inválido');
      return false;
    }

    if (!password || password.length < 8) {
      setLocalError('Senha deve ter no mínimo 8 caracteres');
      return false;
    }

    setLocalError(null);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });

      // Redireciona para rota original ou /app
      const from = (location.state as any)?.from?.pathname || '/app';
      navigate(from, { replace: true });
    } catch (err) {
      // Erro já tratado no SessionProvider (error state)
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>QIM EDGE Portal</h1>
        <p style={styles.subtitle}>Faça login para continuar</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={styles.input}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Exibe erro local (validação) ou erro de backend */}
          {(localError || error) && (
            <div style={styles.error}>{localError || error}</div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.footer}>
          <small>Sprint: PORTAL-CORE-01 | AUTH-CORE-03 Ready</small>
        </p>
      </div>
    </div>
  );
}

// Estilos inline básicos (MVP)
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#333',
  },
  subtitle: {
    margin: '0 0 1.5rem 0',
    color: '#666',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#333',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '0.875rem',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    color: '#999',
  },
};
