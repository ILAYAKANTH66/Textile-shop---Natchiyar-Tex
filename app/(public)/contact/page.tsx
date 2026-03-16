'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>Reach out to the Natchiyar Tex weaving house for bulk enquiries or custom textiles.</p>
      </header>

      <div style={styles.grid}>
        <div style={styles.infoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Our Workshop</h2>
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <strong>NATCHIYAR TEX</strong>
              </div>
              <div style={styles.infoItem}>
                3-21, Kanthanathan Kovil Street,<br />
                T. Subbulapuram – 625 536,<br />
                Aundipatti (Tk), Theni District,<br />
                Tamil Nadu
              </div>
              <div style={styles.infoItem}>
                <strong>GSTIN:</strong> 33AWYPN2264M1ZT
              </div>
              <div style={styles.infoItem}>
                <strong>Email:</strong> hello@natchiyartex.com
              </div>
              <div style={styles.infoItem}>
                <strong>Business Hours:</strong><br />
                Mon - Sat: 9:00 AM - 7:00 PM
              </div>
            </div>
          </div>
        </div>

        <div style={styles.formCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Send a Message</h2>
            {success ? (
              <div style={styles.successMsg}>
                <p>Thank you for reaching out! We will get back to you shortly.</p>
                <button onClick={() => setSuccess(false)} style={styles.resendBtn}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                {error && <p style={styles.errorMsg}>{error}</p>}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Message</label>
                  <textarea 
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '4rem',
    textAlign: 'center' as 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem',
    maxWidth: '700px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)',
    gap: '3rem',
    alignItems: 'start' as 'start',
  },
  infoCol: {},
  formCol: {},
  card: {
    backgroundColor: 'var(--color-surface)',
    padding: '2.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    fontFamily: 'var(--font-serif)',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '0.75rem',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.5rem',
    lineHeight: 1.6,
    color: 'var(--color-text-muted)',
  },
  infoItem: {
    fontSize: '1rem',
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
    fontWeight: 600,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    color: 'var(--color-text-muted)',
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    transition: 'background-color var(--transition-fast)',
  },
  successMsg: {
    textAlign: 'center' as 'center',
    padding: '2rem 0',
    color: 'var(--color-success)',
    fontSize: '1.1rem',
  },
  resendBtn: {
    marginTop: '1rem',
    textDecoration: 'underline',
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
  errorMsg: {
    color: 'var(--color-error)',
    padding: '1rem',
    backgroundColor: 'rgba(var(--color-error-rgb), 0.1)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
  }
};
