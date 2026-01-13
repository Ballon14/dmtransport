import Image from 'next/image';

export const metadata = {
  title: "Tentang Kami | DM Transport Purworejo",
  description: "Mengenal lebih dekat DM Transport Purworejo - penyedia jasa penyewaan kendaraan terpercaya sejak 2012.",
};

export default function TentangPage() {
  const stats = [
    { number: "12+", label: "Tahun Pengalaman" },
    { number: "50+", label: "Unit Kendaraan" },
    { number: "1000+", label: "Pelanggan Puas" },
    { number: "24/7", label: "Layanan Nonstop" },
  ];

  const reasons = [
    { icon: "🏆", title: "Berpengalaman", desc: "Beroperasi sejak 2012" },
    { icon: "🚘", title: "Armada Lengkap", desc: "Mobil & motor terawat" },
    { icon: "💯", title: "Profesional", desc: "Tim yang berpengalaman" },
    { icon: "⏰", title: "24 Jam", desc: "Siap melayani kapan saja" },
    { icon: "💰", title: "Harga Bersaing", desc: "Transparan & terjangkau" },
    { icon: "🛡️", title: "Aman", desc: "Kendaraan diasuransikan" },
  ];

  return (
    <div style={styles.page}>
      {/* Hero Header */}
      <section style={styles.header}>
        <div style={styles.headerBackground}>
          <div style={styles.headerOrb1}></div>
          <div style={styles.headerOrb2}></div>
        </div>
        <div style={styles.gridPattern}></div>
        <div style={styles.container}>
          <div style={styles.headerContent}>
            <span style={styles.headerBadge}>🏢 Profil Perusahaan</span>
            <h1 style={styles.title}>Tentang Kami</h1>
            <p style={styles.subtitle}>
              Kenali lebih dekat DM Transport Purworejo - Mitra transportasi terpercaya Anda
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={styles.section}>
        <div style={styles.containerWide}>
          {/* About Section */}
          <div style={styles.aboutSection}>
            <div style={styles.aboutContent}>
              <span style={styles.sectionBadge}>🚗 Siapa Kami?</span>
              <h2 style={styles.aboutTitle}>DM Transport Purworejo</h2>
              <p style={styles.aboutText}>
                Kami adalah <strong>DM Transport Purworejo</strong>, penyedia jasa penyewaan kendaraan 
                yang telah beroperasi sejak tahun <strong>2012</strong>. Kami menyediakan berbagai pilihan 
                armada, mulai dari mobil hingga sepeda motor, yang selalu terawat dan siap digunakan.
              </p>
              <p style={styles.aboutText}>
                Dengan pengalaman lebih dari <strong>satu dekade</strong>, kami berkomitmen memberikan 
                layanan profesional, aman, dan nyaman bagi setiap pelanggan. Didukung oleh tim yang 
                berpengalaman serta sistem operasional yang tertata, kami siap menjadi solusi transportasi 
                terpercaya untuk kebutuhan <strong>pribadi</strong>, <strong>bisnis</strong>, maupun 
                <strong> perjalanan wisata</strong>.
              </p>
            </div>
            <div style={styles.aboutImage}>
              <div style={styles.aboutImageWrapper}>
                <Image
                  src="/logo.jpeg"
                  alt="DM Transport Logo"
                  width={200}
                  height={200}
                  style={styles.logoImage}
                />
              </div>
              <span style={styles.aboutImageCaption}>Sejak 2012</span>
            </div>
          </div>

          {/* Vision Mission */}
          <div style={styles.vmSection}>
            <div style={styles.vmCard}>
              <div style={styles.vmIconWrapper}>
                <span style={styles.vmIcon}>👁️</span>
              </div>
              <h3 style={styles.vmTitle}>Visi</h3>
              <p style={styles.vmText}>
                Menjadi penyedia layanan rental kendaraan terpercaya dan terdepan di Purworejo 
                dengan mengutamakan kepuasan pelanggan dan keamanan berkendara.
              </p>
            </div>
            <div style={styles.vmCard}>
              <div style={styles.vmIconWrapper}>
                <span style={styles.vmIcon}>🎯</span>
              </div>
              <h3 style={styles.vmTitle}>Misi</h3>
              <ul style={styles.vmList}>
                <li>Menyediakan armada yang berkualitas dan terawat</li>
                <li>Memberikan harga yang kompetitif dan transparan</li>
                <li>Melayani dengan ramah, cepat, dan profesional</li>
                <li>Mengutamakan keamanan dan kenyamanan pelanggan</li>
              </ul>
            </div>
          </div>

          {/* Why Us */}
          <div style={styles.whySection}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionBadge}>✨ Keunggulan</span>
              <h2 style={styles.sectionTitle}>Mengapa Memilih Kami?</h2>
            </div>
            <div style={styles.reasonsGrid}>
              {reasons.map((item, index) => (
                <div key={index} style={styles.reasonCard}>
                  <span style={styles.reasonIcon}>{item.icon}</span>
                  <h4 style={styles.reasonTitle}>{item.title}</h4>
                  <p style={styles.reasonDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsSection}>
            <div style={styles.statsContent}>
              <h3 style={styles.statsTitle}>Kami Dalam Angka</h3>
              <p style={styles.statsSubtitle}>Pencapaian kami selama lebih dari satu dekade</p>
            </div>
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <span style={styles.statNumber}>{stat.number}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={styles.ctaSection}>
            <h3 style={styles.ctaTitle}>Siap Menjadi Pelanggan Kami?</h3>
            <p style={styles.ctaText}>
              Hubungi kami sekarang dan nikmati pengalaman rental kendaraan terbaik di Purworejo
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20bertanya%20tentang%20layanan%20DM%20Transport"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.ctaButton}
            >
              <span>💬</span> Hubungi Kami via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  header: {
    background: "#0f172a",
    padding: "5rem 0 6rem",
    position: "relative",
    overflow: "hidden",
  },
  headerBackground: {
    position: "absolute",
    inset: 0,
  },
  headerOrb1: {
    position: "absolute",
    top: "-30%",
    left: "-10%",
    width: "50%",
    height: "80%",
    background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)",
    filter: "blur(60px)",
  },
  headerOrb2: {
    position: "absolute",
    bottom: "-40%",
    right: "-10%",
    width: "50%",
    height: "80%",
    background: "radial-gradient(circle, rgba(30,58,95,0.6) 0%, transparent 70%)",
    filter: "blur(60px)",
  },
  gridPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    opacity: 0.5,
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 1.5rem",
    position: "relative",
    zIndex: 10,
  },
  containerWide: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  headerContent: {
    textAlign: "center",
  },
  headerBadge: {
    display: "inline-block",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    padding: "0.5rem 1.25rem",
    borderRadius: "9999px",
    fontSize: "0.9rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: "800",
    color: "white",
    marginBottom: "1rem",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "1.125rem",
    maxWidth: "500px",
    margin: "0 auto",
    lineHeight: 1.7,
  },
  section: {
    padding: "4rem 0",
  },
  sectionBadge: {
    display: "inline-block",
    background: "rgba(249, 115, 22, 0.1)",
    color: "#f97316",
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  aboutSection: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "3rem",
    alignItems: "center",
    marginBottom: "4rem",
    background: "white",
    borderRadius: "1.5rem",
    padding: "3rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  aboutContent: {},
  aboutTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "1.5rem",
    letterSpacing: "-0.02em",
  },
  aboutText: {
    color: "#475569",
    lineHeight: 1.8,
    fontSize: "1.05rem",
    marginBottom: "1rem",
  },
  aboutImage: {
    textAlign: "center",
  },
  aboutImageWrapper: {
    width: "180px",
    height: "180px",
    borderRadius: "1.5rem",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    margin: "0 auto 1rem",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  aboutImageCaption: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "600",
  },
  vmSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    marginBottom: "4rem",
  },
  vmCard: {
    background: "white",
    borderRadius: "1.5rem",
    padding: "2.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  vmIconWrapper: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  vmIcon: {
    fontSize: "1.75rem",
  },
  vmTitle: {
    fontSize: "1.375rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "1rem",
  },
  vmText: {
    color: "#475569",
    lineHeight: 1.7,
    margin: 0,
  },
  vmList: {
    color: "#475569",
    lineHeight: 2,
    paddingLeft: "1.25rem",
    margin: 0,
  },
  whySection: {
    marginBottom: "4rem",
  },
  reasonsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "1.5rem",
  },
  reasonCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "1.25rem",
    padding: "1.75rem 1.25rem",
    textAlign: "center",
    transition: "all 0.3s",
  },
  reasonIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "1rem",
  },
  reasonTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "0.5rem",
  },
  reasonDesc: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },
  statsSection: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)",
    borderRadius: "1.5rem",
    padding: "3rem",
    marginBottom: "4rem",
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "2rem",
    alignItems: "center",
  },
  statsContent: {},
  statsTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.5rem",
  },
  statsSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.95rem",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.5rem",
  },
  statCard: {
    textAlign: "center",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "1rem",
    padding: "1.5rem 1rem",
  },
  statNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f97316",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.8)",
  },
  ctaSection: {
    textAlign: "center",
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    borderRadius: "1.5rem",
    padding: "3rem",
  },
  ctaTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.75rem",
  },
  ctaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "1.05rem",
    marginBottom: "1.5rem",
    maxWidth: "500px",
    margin: "0 auto 1.5rem",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.625rem",
    background: "white",
    color: "#ea580c",
    padding: "1rem 2rem",
    borderRadius: "0.75rem",
    fontWeight: "700",
    fontSize: "1rem",
    textDecoration: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
};
