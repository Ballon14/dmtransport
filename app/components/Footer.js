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
                <a href="https://wa.me/6285200008800" target="_blank" rel="noopener noreferrer" style={styles.socialLink} aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/sewamobilpurworejoo.id?igsh=MTR4Mm1tYjVveTJncA==" target="_blank" rel="noopener noreferrer" style={styles.socialLink} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/dm.purworejo/" target="_blank" rel="noopener noreferrer" style={styles.socialLink} aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@dmtransportpurworejo" target="_blank" rel="noopener noreferrer" style={styles.socialLink} aria-label="TikTok">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
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
                  <div style={styles.phoneList}>
                    <a href="https://wa.me/6285200008800" target="_blank" rel="noopener noreferrer" style={styles.phoneLink}>
                      Admin 1: 0852-0000-8800
                    </a>
                    <a href="https://wa.me/6282136395758" target="_blank" rel="noopener noreferrer" style={styles.phoneLink}>
                      Admin 2: 0821-3639-5758
                    </a>
                    <a href="https://wa.me/6285945451616" target="_blank" rel="noopener noreferrer" style={styles.phoneLink}>
                      Admin 3: 0859-4545-1616
                    </a>
                  </div>
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
  phoneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  phoneLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
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
