'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, UserButton, SignInButton, useClerk, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/user/role');
        const data = await res.json();
        if (data.success && data.data.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin:', error);
      }
    }
    
    if (isLoaded) {
      checkAdmin();
    }
  }, [isLoaded, userId]);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/mobil', label: 'Mobil' },
    { href: '/motor', label: 'Motor' },
    { href: '/tentang', label: 'Tentang' },
    { href: '/kontak', label: 'Kontak' },
  ];

  const userLinks = [
    { href: '/riwayat', label: '📋 Riwayat' },
  ];

  return (
    <nav style={{
      ...styles.nav,
      ...(scrolled ? styles.navScrolled : {}),
    }}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          <div style={styles.logoImageWrapper}>
            <Image
              src="/logo.jpeg"
              alt="DM Transport Logo"
              width={45}
              height={45}
              style={styles.logoImage}
            />
          </div>
          <div>
            <span style={styles.logoText}>DM Transport</span>
            <span style={styles.logoSubtext}>Purworejo</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        {!isMobile && (
          <div style={styles.desktopMenu}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={styles.navLink}>
                {link.label}
              </Link>
            ))}
            
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div style={styles.userArea}>
                    <Link href="/riwayat" style={styles.navLink}>
                      Riwayat
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" style={styles.adminBtn}>
                        Admin
                      </Link>
                    )}
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button style={styles.ctaButton}>
                      Masuk
                    </button>
                  </SignInButton>
                )}
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            style={styles.mobileMenuBtn}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div style={{
              ...styles.hamburgerLine,
              transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }} />
            <div style={{
              ...styles.hamburgerLine,
              opacity: isOpen ? 0 : 1,
            }} />
            <div style={{
              ...styles.hamburgerLine,
              transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }} />
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <div style={{
          ...styles.mobileMenu,
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0,
          paddingTop: isOpen ? '0.5rem' : '0',
          paddingBottom: isOpen ? '0.5rem' : '0',
          visibility: isOpen ? 'visible' : 'hidden',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={styles.mobileNavLink}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {isLoaded && (
            <>
              {isSignedIn ? (
                <>
                  <Link href="/riwayat" style={styles.mobileNavLink} onClick={() => setIsOpen(false)}>
                    Riwayat Pesanan
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" style={styles.mobileNavLink} onClick={() => setIsOpen(false)}>
                    Admin Panel
                    </Link>
                  )}
                  
                  {/* Account Section */}
                  <div style={styles.mobileAccountSection}>
                    <div style={styles.mobileAccountHeader}>
                      <div style={styles.mobileAvatarWrapper}>
                        <UserButton 
                          afterSignOutUrl="/" 
                          appearance={{
                            elements: {
                              avatarBox: {
                                width: 48,
                                height: 48,
                              }
                            }
                          }}
                        />
                      </div>
                      <div style={styles.mobileAccountInfo}>
                        <span style={styles.mobileAccountName}>
                          {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Pengguna'}
                        </span>
                        <span style={styles.mobileAccountEmail}>
                          {user?.emailAddresses?.[0]?.emailAddress || ''}
                        </span>
                        <span style={styles.mobileAccountHint}>
                          Tap foto untuk kelola akun
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button style={styles.mobileCta} onClick={() => setIsOpen(false)}>
                    Masuk / Daftar
                  </button>
                </SignInButton>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'rgba(30, 58, 95, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
  },
  navScrolled: {
    background: 'rgba(30, 58, 95, 0.98)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'white',
  },
  logoImageWrapper: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoText: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  logoSubtext: {
    display: 'block',
    fontSize: '0.7rem',
    opacity: 0.7,
    marginTop: '-2px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    padding: '0.5rem 0',
    position: 'relative',
  },
  ctaButton: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.625rem',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
    transition: 'all 0.3s ease',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  adminBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.2s ease',
  },
  mobileMenuBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    width: '44px',
    height: '44px',
  },
  hamburgerLine: {
    width: '22px',
    height: '2.5px',
    background: 'white',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
    transformOrigin: 'center',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(30, 58, 95, 0.98)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  mobileNavLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'background 0.2s ease',
  },
  mobileCta: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white',
    padding: '1rem',
    borderRadius: '0.625rem',
    textDecoration: 'none',
    fontWeight: '600',
    textAlign: 'center',
    margin: '1rem 1.5rem',
    border: 'none',
    cursor: 'pointer',
    width: 'calc(100% - 3rem)',
    fontSize: '1rem',
    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
  },
  // Mobile Account Section
  mobileAccountSection: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1.25rem 1.5rem',
    marginTop: '0.5rem',
  },
  mobileAccountHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  mobileAvatarWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(249, 115, 22, 0.5)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  mobileAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mobileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    color: 'white',
    fontWeight: '700',
  },
  mobileAccountInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    flex: 1,
  },
  mobileAccountName: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
  },
  mobileAccountEmail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
  },
  mobileAccountHint: {
    color: '#f97316',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    fontWeight: '500',
  },
  mobileAccountActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  mobileAccountBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    color: 'white',
    padding: '0.875rem 1rem',
    borderRadius: '0.625rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
  },
  mobileLogoutBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    border: 'none',
    color: 'white',
    padding: '0.875rem 1rem',
    borderRadius: '0.625rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
  },
  mobileUserArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    marginTop: '0.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
  },
  userButtonWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  mobileUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  mobileUserText: {
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  mobileUserHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.75rem',
  },
};
