'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!userId) {
        router.push('/sign-in');
        return;
      }

      try {
        const res = await fetch('/api/user/role');
        const data = await res.json();
        
        if (data.success && data.data.role === 'admin') {
          setUserRole('admin');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      checkRole();
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/vehicles', label: 'Kendaraan', icon: '🚗' },
    { href: '/admin/bookings', label: 'Pemesanan', icon: '📋' },
    { href: '/admin/chats', label: 'Live Chat', icon: '💬' },
    { href: '/admin/users', label: 'Pengguna', icon: '👥' },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.logoIcon}>🚗</span>
          <div>
            <span style={styles.logoText}>DM Transport</span>
            <span style={styles.logoSubtext}>Admin Panel</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} style={styles.navItem}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <Link href="/" style={styles.backLink}>
            ← Kembali ke Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <div style={styles.userSection}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f1f5f9',
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2a4a 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoIcon: {
    fontSize: '1.75rem',
  },
  logoText: {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  logoSubtext: {
    display: 'block',
    fontSize: '0.7rem',
    opacity: 0.7,
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1.5rem',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  sidebarFooter: {
    padding: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  backLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    background: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  pageTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e3a5f',
    margin: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  content: {
    flex: 1,
    padding: '2rem',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #1e3a5f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
