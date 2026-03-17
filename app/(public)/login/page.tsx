'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: identifier, 2: password (email) or otp (mobile)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const id = identifier.trim();
    if (id.length < 5) {
      setError('Please enter a valid email or mobile number');
      return;
    }

    const emailMode = isEmail(id);
    setIsEmailLogin(emailMode);

    if (emailMode) {
      // For email, we move to password entry
      setStep(2);
    } else {
      // For mobile, we request OTP
      setLoading(true);
      try {
        const res = await fetch('/api/customer/otp-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: id }),
        });
        if (res.ok) {
          setStep(2);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to request OTP');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isEmailLogin) {
        res = await fetch('/api/customer/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier.trim(), password }),
        });
      } else {
        res = await fetch('/api/customer/otp-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), otp }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex-center animate-fade-in" style={{ minHeight: '60vh' }}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Natchiyar Tex</h1>
        <p style={styles.subtitle}>
          {step === 1 
            ? 'Enter your email or mobile number to sign in or create an account.' 
            : isEmailLogin 
              ? `Enter password for ${identifier}` 
              : `Enter the OTP sent to ${identifier} (Use 123456 for demo)`
          }
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleNext} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email or Mobile Number</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 9876543210"
                style={{...styles.input, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)'}}
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Processing...' : 'Next'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/signup')}
              style={styles.textButton}
            >
              New here? Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            {isEmailLogin ? (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  style={{...styles.input, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)'}}
                  required
                />
              </div>
            ) : (
              <div style={styles.inputGroup}>
                <label style={styles.label}>One Time Password</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  style={{...styles.input, textAlign: 'center', letterSpacing: '0.25rem', fontSize: '1.25rem'}}
                  required
                />
              </div>
            )}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              style={styles.textButton}
            >
              Change Email/Mobile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container flex-center" style={{ minHeight: '60vh' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
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
  },
  inputPrefixWrapper: {
    position: 'relative' as 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  prefix: {
    position: 'absolute' as 'absolute',
    left: '1rem',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
  input: {
    width: '100%',
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
  }
};
