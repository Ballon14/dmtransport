'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, UserButton, SignInButton } from '@clerk/nextjs';

export default function Navbar() {
  const { isLoaded, isSignedIn, userId } = useAuth();
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
          maxHeight: isOpen ? '400px' : '0',
          opacity: isOpen ? 1 : 0,
          padding: isOpen ? '1rem 1.5rem 1.5rem' : '0 1.5rem',
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
                  <div style={styles.mobileUserArea}>
                    <UserButton afterSignOutUrl="/" />
                    <span style={styles.mobileUserText}>Akun Saya</span>
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
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    width: '30px',
  },
  hamburgerLine: {
    width: '100%',
    height: '2px',
    background: 'white',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(30, 58, 95, 0.98)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  mobileNavLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.875rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '1rem',
    fontWeight: '500',
  },
  mobileCta: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white',
    padding: '1rem',
    borderRadius: '0.625rem',
    textDecoration: 'none',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '1rem',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
  },
  mobileUserArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 0',
    marginTop: '0.5rem',
  },
  mobileUserText: {
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
};
