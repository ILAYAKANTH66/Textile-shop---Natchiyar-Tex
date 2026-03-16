'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <div style={styles.card}>
        <div style={styles.brand}>NATCHIYAR TEX</div>
        <h1 style={styles.title}>Admin Portal Access</h1>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@natchiyartex.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-surface)',
    padding: '3rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid var(--color-border)',
  },
  brand: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    color: 'var(--color-primary)',
    textAlign: 'center' as 'center',
    marginBottom: '0.5rem',
    letterSpacing: '2px',
    textTransform: 'uppercase' as 'uppercase',
  },
  title: {
    textAlign: 'center' as 'center',
    marginBottom: '2.5rem',
    fontSize: '1.5rem',
    fontFamily: 'var(--font-sans)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
  },
  input: {
    width: '100%',
  },
  button: {
    backgroundColor: 'var(--color-text)',
    color: 'white',
    padding: '0.875rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'var(--transition-fast)',
    marginTop: '1rem',
  },
  error: {
    backgroundColor: 'var(--color-error)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    textAlign: 'center' as 'center',
  }
};
