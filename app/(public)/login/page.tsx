'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
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
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });

      if (res.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid OTP');
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
          {step === 1 ? 'Enter your mobile number to sign in or create an account.' : `Enter the OTP sent to ${mobileNumber} (Use 123456 for demo)`}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile Number</label>
              <div style={styles.inputPrefixWrapper}>
                <span style={styles.prefix}>+91</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  style={{...styles.input, paddingLeft: '3.5rem'}}
                  required
                />
              </div>
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Sending...' : 'Request OTP'}
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
          <form onSubmit={handleVerifyOtp} style={styles.form}>
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
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              style={styles.textButton}
            >
              Change Mobile Number
            </button>
            <button
              type="button"
              onClick={() => router.push('/signup')}
              style={styles.textButton}
            >
              Create an account
            </button>
          </form>
        )}
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
