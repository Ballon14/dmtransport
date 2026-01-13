import Link from 'next/link';
import Image from 'next/image';

// WhatsApp number from environment or fallback
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285200008800';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/mobil', label: 'Sewa Mobil' },
    { href: '/motor', label: 'Sewa Motor' },
    { href: '/tentang', label: 'Tentang Kami' },
    { href: '/kontak', label: 'Kontak' },
  ];

  const services = [
    'Rental Harian',
    'Rental Mingguan',
    'Rental Bulanan',
    'Antar Jemput',
    'Layanan 24 Jam',
  ];

  return (
    <footer style={styles.footer}>
      {/* Wave decoration */}
      <div style={styles.waveWrapper}>
        <svg viewBox="0 0 1440 100" fill="none" style={styles.wave}>
          <path
            d="M0 50L60 45.8C120 41.7 240 33.3 360 37.5C480 41.7 600 58.3 720 62.5C840 66.7 960 58.3 1080 50C1200 41.7 1320 33.3 1380 29.2L1440 25V100H0V50Z"
            fill="#1e3a5f"
          />
        </svg>
      </div>
      
      <div style={styles.main}>
        <div style={styles.container}>
          <div style={styles.grid}>
            {/* Brand */}
            <div style={styles.brand}>
              <div style={styles.logoArea}>
                <div style={styles.logoImageWrapper}>
                  <Image
                    src="/logo.jpeg"
                    alt="DM Transport Logo"
                    width={50}
                    height={50}
                    style={styles.logoImage}
                  />
                </div>
                <div>
                  <span style={styles.logoText}>DM Transport</span>
                  <span style={styles.logoSubtext}>Purworejo</span>
                </div>
              </div>
              <p style={styles.tagline}>
                Penyedia jasa penyewaan kendaraan terpercaya sejak 2012. Solusi transportasi untuk kebutuhan pribadi, bisnis, dan wisata.
              </p>
              <div style={styles.socialLinks}>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  💬
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  📸
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  📘
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div style={styles.column}>
              <h4 style={styles.columnTitle}>Menu</h4>
              <ul style={styles.linkList}>
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} style={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div style={styles.column}>
              <h4 style={styles.columnTitle}>Layanan</h4>
              <ul style={styles.linkList}>
                {services.map((service, index) => (
                  <li key={index} style={styles.serviceItem}>
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div style={styles.column}>
              <h4 style={styles.columnTitle}>Hubungi Kami</h4>
              <div style={styles.contactList}>
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>📍</span>
                  <span>Jl. Kapten Piere Tendean, Rw. VI, Sindurjan, Kec. Purworejo, Kabupaten Purworejo, Jawa Tengah 54113</span>
                </div>
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>📞</span>
                  <span>+62 852-0000-8800</span>
                </div>
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>✉️</span>
                  <span>info@dmtransport.com</span>
                </div>
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>🕐</span>
                  <span>Buka 24 Jam (WhatsApp)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.bottom}>
        <div style={styles.container}>
          <div style={styles.bottomContent}>
            <p style={styles.copyright}>
              © {currentYear} DM Transport Purworejo. All rights reserved.
            </p>
            <p style={styles.credit}>
              Made with ❤️ in Purworejo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#0f2a4a',
    color: 'white',
    position: 'relative',
    marginTop: '4rem',
  },
  waveWrapper: {
    position: 'absolute',
    top: '-99px',
    left: 0,
    right: 0,
    overflow: 'hidden',
    lineHeight: 0,
  },
  wave: {
    width: '100%',
    height: '100px',
  },
  main: {
    paddingTop: '4rem',
    paddingBottom: '3rem',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '3rem',
  },
  brand: {
    maxWidth: '320px',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    marginBottom: '1.25rem',
  },
  logoImageWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoText: {
    display: 'block',
    fontSize: '1.375rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  logoSubtext: {
    display: 'block',
    fontSize: '0.75rem',
    opacity: 0.6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
  },
  socialLinks: {
    display: 'flex',
    gap: '0.75rem',
  },
  socialLink: {
    width: '42px',
    height: '42px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.125rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  column: {},
  columnTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    color: 'white',
    position: 'relative',
    paddingBottom: '0.75rem',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  link: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  serviceItem: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  contactIcon: {
    fontSize: '1rem',
    marginTop: '0.125rem',
  },
  bottom: {
    background: 'rgba(0,0,0,0.2)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  bottomContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 0',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  copyright: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    margin: 0,
  },
  credit: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    margin: 0,
  },
};
