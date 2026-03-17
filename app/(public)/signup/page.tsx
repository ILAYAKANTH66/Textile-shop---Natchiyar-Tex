'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email && !mobileNumber) {
      setError('Please provide either email or mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || null,
          mobileNumber: mobileNumber || null,
          password: password || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Signup failed');

      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex-center animate-fade-in" style={{ minHeight: '60vh' }}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>
          Register with email or mobile number to manage orders and wholesale enquiries.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          {email && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="********" 
                required={!!email}
              />
            </div>
          )}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile number (optional)</label>
            <input
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
              type="tel"
              placeholder="9876543210"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating…' : 'Sign Up'}
          </button>

          <button type="button" onClick={() => router.push('/login')} style={styles.textButton}>
            Already have an account? Login
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
    maxWidth: '450px',
    border: '1px solid var(--color-border)',
  },
  title: {
    textAlign: 'center' as 'center',
    marginBottom: '0.5rem',
    fontSize: '1.75rem',
    fontFamily: 'var(--font-serif)',
  },
  subtitle: {
    textAlign: 'center' as 'center',
    color: 'var(--color-text-muted)',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  button: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '0.875rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'var(--transition-fast)',
    marginTop: '0.5rem',
  },
  textButton: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
    textDecoration: 'underline',
    marginTop: '-0.5rem',
    padding: '0.5rem',
  },
  error: {
    backgroundColor: 'var(--color-error)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    textAlign: 'center' as 'center',
  },
};

