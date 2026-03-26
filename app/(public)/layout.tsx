'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ authenticated: boolean; name?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser({ authenticated: false });
        }
      } catch {
        setUser({ authenticated: false });
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST' });
      setUser({ authenticated: false });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBlock}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoKicker}>Natchiyar</span>
            <span style={styles.logoMain}>TEX</span>
          </Link>
          <p style={styles.tagline}>Wholesale premium cotton fabrics.</p>
        </div>

        <nav aria-label="Primary" style={styles.nav}>
          <Link href="/shop" style={styles.navItem}>Shop</Link>
          <Link href="/collections" style={styles.navItem}>Collections</Link>
          <Link href="/about" style={styles.navItem}>About</Link>
          <Link href="/contact" style={styles.navItem}>Contact</Link>
          <Link href="/cart" style={styles.navItem}>Cart</Link>
          <Link href="/orders" style={styles.navItem}>My Orders</Link>
        </nav>

        <div style={styles.sidebarFooter}>
          {user?.authenticated ? (
            <div style={styles.userBlock}>
              <p style={styles.welcomeText}>Hello, <span style={styles.username}>{user.name}</span></p>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <div style={styles.authRow}>
              <Link href="/login" style={styles.loginButton}>
                Login
              </Link>
              <Link href="/signup" style={styles.secondaryButton}>
                Sign Up
              </Link>
            </div>
          )}
          <div style={styles.sidebarMeta}>
            <p style={styles.metaLine}>Theni, Tamil Nadu</p>
            <p style={styles.metaLine}>Bulk supply • Consistent batches</p>
          </div>
        </div>
      </aside>

      <div style={styles.contentWrapper}>
        <main style={styles.main}>{children}</main>
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <p style={styles.footerPrimary}>NATCHIYAR TEX</p>
            <p style={styles.footerSecondary}>
              Wholesale cotton fabrics from traditional looms. GSTIN: 33AWYPN2264M1ZT
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #f7f1e6 0%, #f3e6d4 35%, #f9f5ee 70%, #f2e2c9 100%)',
    color: 'var(--color-text)',
  },
  sidebar: {
    position: 'sticky' as 'sticky',
    top: 0,
    alignSelf: 'flex-start' as 'flex-start',
    width: '270px',
    minHeight: '100vh',
    padding: '2.5rem 2rem',
    borderRight: '1px solid rgba(120, 90, 60, 0.25)',
    background:
      'radial-gradient(circle at top, rgba(255,255,255,0.9) 0, rgba(247,238,224,0.95) 55%, rgba(236,216,190,0.98) 100%)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between',
    rowGap: '3rem',
  },
  brandBlock: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.75rem',
  },
  logo: {
    textDecoration: 'none',
    display: 'inline-flex',
    flexDirection: 'column' as 'column',
    letterSpacing: '0.08em',
  },
  logoKicker: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.85rem',
    textTransform: 'uppercase' as 'uppercase',
    color: '#8b6a3f',
  },
  logoMain: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.9rem',
    lineHeight: 1.1,
    color: '#4b3421',
  },
  tagline: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#8b6a3f',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  navItem: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.12em',
    color: '#4b3421',
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(139, 106, 63, 0.2)',
  },
  sidebarFooter: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1rem',
  },
  authRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.6rem',
  },
  loginButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.7rem 1rem',
    borderRadius: '999px',
    border: '1px solid rgba(80, 55, 35, 0.5)',
    background:
      'linear-gradient(120deg, rgba(160,120,70,0.12), rgba(190,150,90,0.05))',
    color: '#4b3421',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.12em',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.7rem 1rem',
    borderRadius: '999px',
    border: '1px solid rgba(80, 55, 35, 0.35)',
    backgroundColor: 'rgba(255,255,255,0.6)',
    color: '#5d472c',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.12em',
  },
  sidebarMeta: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#8b6a3f',
  },
  metaLine: {
    marginBottom: '0.15rem',
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    minWidth: 0,
  },
  main: {
    padding: '2.5rem 3vw 3.5rem 3vw',
    minHeight: '100vh',
  },
  footer: {
    borderTop: '1px solid rgba(120, 90, 60, 0.25)',
    padding: '1.2rem 3vw 1.5rem 3vw',
  },
  footerInner: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.3rem',
    fontFamily: 'var(--font-sans)',
  },
  footerPrimary: {
    fontSize: '0.8rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as 'uppercase',
    color: '#4b3421',
  },
  footerSecondary: {
    fontSize: '0.8rem',
    color: '#92724c',
  },
  userBlock: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.8rem',
    padding: '0.5rem 0',
  },
  welcomeText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    color: '#4b3421',
  },
  username: {
    fontWeight: 700,
    color: '#8b6a3f',
  },
  logoutButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(75, 52, 33, 0.08)',
    border: '1px solid rgba(75, 52, 33, 0.2)',
    color: '#4b3421',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    width: 'fit-content',
  },
};
