'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          NATCHIYAR TEX <span style={styles.adminBadge}>Admin</span>
        </div>
        
        <nav style={styles.nav}>
          <Link 
            href="/admin" 
            style={{
              ...styles.navItem,
              ...(pathname === '/admin' ? styles.activeNavItem : {})
            }}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/products" 
            style={{
              ...styles.navItem,
              ...(pathname === '/admin/products' ? styles.activeNavItem : {})
            }}
          >
            Products
          </Link>
          <Link 
            href="/admin/orders" 
            style={{
              ...styles.navItem,
              ...(pathname === '/admin/orders' ? styles.activeNavItem : {})
            }}
          >
            Orders & Reports
          </Link>
        </nav>
        
        <div style={styles.sidebarBottom}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>
      
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    position: 'fixed' as 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
  },
  brand: {
    padding: '2rem 1.5rem',
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBadge: {
    fontSize: '0.7rem',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontFamily: 'var(--font-sans)',
  },
  nav: {
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navItem: {
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    transition: 'var(--transition-fast)',
    display: 'block',
  },
  activeNavItem: {
    backgroundColor: 'rgba(192, 169, 142, 0.1)',
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
  sidebarBottom: {
    padding: '1.5rem',
    borderTop: '1px solid var(--color-border)',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.75rem',
    color: 'var(--color-text-muted)',
    textAlign: 'left' as 'left',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'var(--transition-fast)',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    padding: '2.5rem',
  }
};
