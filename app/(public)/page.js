'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VehicleCard from "../components/VehicleCard";

const features = [
  {
    icon: "car",
    title: "Armada Terawat",
    description: "Semua kendaraan dalam kondisi prima dan terawat untuk kenyamanan Anda.",
    color: "#3b82f6",
  },
  {
    icon: "wallet",
    title: "Harga Terjangkau",
    description: "Harga sewa kompetitif tanpa mengorbankan kualitas layanan.",
    color: "#22c55e",
  },
  {
    icon: "clock",
    title: "Layanan 24 Jam",
    description: "Tim kami siap melayani kebutuhan rental Anda kapan saja.",
    color: "#f97316",
  },
];

// Feature Icons as SVG
const FeatureIcon = ({ type, color }) => {
  const icons = {
    car: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    ),
    wallet: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
      </svg>
    ),
    clock: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  };
  return icons[type] || null;
};


export default function Home() {
  const [cars, setCars] = useState([]);
  const [motors, setMotors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalCars: 0,
    totalMotors: 0,
  });

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        
        if (data.success) {
          const allVehicles = data.data;
          const carList = allVehicles.filter(v => v.type === 'mobil').slice(0, 3);
          const motorList = allVehicles.filter(v => v.type === 'motor').slice(0, 2);
          
          setCars(carList);
          setMotors(motorList);
          setStats({
            totalVehicles: allVehicles.length,
            totalCars: allVehicles.filter(v => v.type === 'mobil').length,
            totalMotors: allVehicles.filter(v => v.type === 'motor').length,
          });
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials');
        const data = await res.json();
        if (data.success) {
          setTestimonials(data.data);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    }
    
    fetchVehicles();
    fetchTestimonials();
  }, []);

  const displayStats = [
    { number: `${stats.totalVehicles}+`, label: "Armada", icon: "🚗" },
    { number: "1000+", label: "Pelanggan Puas", icon: "😊" },
    { number: "12+", label: "Tahun Pengalaman", icon: "🏆" },
    { number: "24/7", label: "Layanan", icon: "⏰" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBackground}>
          <div style={styles.gradientOrb1}></div>
          <div style={styles.gradientOrb2}></div>
          <div style={styles.gradientOrb3}></div>
        </div>
        <div style={styles.gridPattern}></div>
        
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>
            <span style={styles.badgeDot}></span>
            🏆 Rental Terpercaya #1 di Purworejo
          </span>
          
          <h1 style={styles.heroTitle}>
            Sewa Mobil & Motor
            <span style={styles.heroTitleGradient}> Mudah, Cepat & Terjangkau</span>
          </h1>
          
          <p style={styles.heroSubtitle}>
            Nikmati perjalanan nyaman dengan armada berkualitas dari DM Transport Purworejo. 
            Proses mudah, harga bersaing, dan pelayanan 24 jam!
          </p>
          
          <div style={styles.heroButtons}>
            <Link href="/mobil" style={styles.btnPrimary}>
              <span>🚗</span> Lihat Mobil
              <span style={styles.btnArrow}>→</span>
            </Link>
            <Link href="/motor" style={styles.btnOutline}>
              <span>🏍️</span> Lihat Motor
            </Link>
          </div>
          
          {/* Stats Bar */}
          <div style={styles.statsBar}>
            {displayStats.map((stat, index) => (
              <div key={index} style={styles.statItem}>
                <span style={styles.statIcon}>{stat.icon}</span>
                <div style={styles.statInfo}>
                  <span style={styles.statNumber}>{stat.number}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div style={styles.scrollIndicator}>
          <div style={styles.scrollMouse}>
            <div style={styles.scrollWheel}></div>
          </div>
          <span style={styles.scrollText}>Scroll ke bawah</span>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>🔥 Populer</span>
            <h2 style={styles.sectionTitle}>Kendaraan Unggulan</h2>
            <p style={styles.sectionSubtitle}>
              Pilih kendaraan terbaik untuk kebutuhan perjalanan Anda
            </p>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Memuat kendaraan...</p>
            </div>
          ) : (
            <>
              <div style={styles.vehicleSection}>
                <div style={styles.vehicleHeader}>
                  <h3 style={styles.categoryTitle}>
                    <span style={styles.categoryIcon}>🚗</span> Mobil
                  </h3>
                  <Link href="/mobil" style={styles.seeAllLink}>
                    Lihat Semua <span>→</span>
                  </Link>
                </div>
                {cars.length > 0 ? (
                  <div style={styles.vehicleGrid}>
                    {cars.map((vehicle) => (
                      <VehicleCard key={vehicle._id} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>Belum ada mobil tersedia</p>
                )}
              </div>

              <div style={{ ...styles.vehicleSection, marginTop: "4rem" }}>
                <div style={styles.vehicleHeader}>
                  <h3 style={styles.categoryTitle}>
                    <span style={styles.categoryIcon}>🏍️</span> Motor
                  </h3>
                  <Link href="/motor" style={styles.seeAllLink}>
                    Lihat Semua <span>→</span>
                  </Link>
                </div>
                {motors.length > 0 ? (
                  <div style={styles.vehicleGrid}>
                    {motors.map((vehicle) => (
                      <VehicleCard key={vehicle._id} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>Belum ada motor tersedia</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={styles.featuresSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>✨ Keunggulan</span>
            <h2 style={styles.sectionTitle}>Mengapa Memilih Kami?</h2>
            <p style={styles.sectionSubtitle}>
              Keunggulan layanan DM Transport Purworejo
            </p>
          </div>
          
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={{ ...styles.featureIconWrapper, background: `${feature.color}15` }}>
                  <FeatureIcon type={feature.icon} color={feature.color} />
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={styles.testimonialSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>💬 Testimoni</span>
            <h2 style={styles.sectionTitle}>Apa Kata Pelanggan?</h2>
            <p style={styles.sectionSubtitle}>
              Ribuan pelanggan puas telah mempercayakan kami
            </p>
          </div>
          
          <div style={styles.testimonialGrid}>
            {testimonials.length > 0 ? testimonials.map((item, index) => (
              <div key={index} style={styles.testimonialCard}>
                <div style={styles.testimonialQuote}>"</div>
                <div style={styles.testimonialStars}>
                  {"★".repeat(item.rating)}
                </div>
                <p style={styles.testimonialText}>{item.text}</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>
                    {item.name?.charAt(0) || 'P'}
                  </div>
                  <div style={styles.testimonialInfo}>
                    <span style={styles.testimonialName}>{item.name}</span>
                    <span style={styles.testimonialRole}>{item.role}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p style={styles.emptyText}>Belum ada testimoni tersedia</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBackground}>
          <div style={styles.ctaOrb1}></div>
          <div style={styles.ctaOrb2}></div>
        </div>
        <div style={styles.container}>
          <div style={styles.ctaContent}>
            <span style={styles.ctaBadge}>🚀 Mulai Sekarang</span>
            <h2 style={styles.ctaTitle}>Siap Untuk Menyewa?</h2>
            <p style={styles.ctaSubtitle}>
              Pilih kendaraan dan pesan langsung melalui website kami.
              <br />Pembayaran mudah dan aman via Midtrans.
            </p>
            <div style={styles.ctaButtons}>
              <Link href="/mobil" style={styles.ctaButton}>
                <span style={styles.ctaButtonIcon}>🚗</span>
                Sewa Mobil Sekarang
                <span style={styles.ctaButtonArrow}>→</span>
              </Link>
              <Link href="/motor" style={styles.ctaButtonSecondary}>
                <span>🏍️</span> Sewa Motor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const styles = {
  // Hero
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    overflow: "hidden",
    marginTop: "-80px",
    paddingTop: "80px",
  },
  heroBackground: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  },
  gradientOrb1: {
    position: "absolute",
    top: "-20%",
    left: "-10%",
    width: "50%",
    height: "50%",
    background: "radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)",
    filter: "blur(60px)",
  },
  gradientOrb2: {
    position: "absolute",
    bottom: "-30%",
    right: "-10%",
    width: "60%",
    height: "60%",
    background: "radial-gradient(circle, rgba(30,58,95,0.8) 0%, transparent 70%)",
    filter: "blur(80px)",
  },
  gradientOrb3: {
    position: "absolute",
    top: "40%",
    right: "20%",
    width: "30%",
    height: "30%",
    background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
    filter: "blur(40px)",
  },
  gridPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    opacity: 0.5,
  },
  heroContent: {
    position: "relative",
    textAlign: "center",
    padding: "2rem",
    maxWidth: "900px",
    zIndex: 10,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(249, 115, 22, 0.15)",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    color: "#fb923c",
    padding: "0.625rem 1.25rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "2rem",
    backdropFilter: "blur(10px)",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    background: "#22c55e",
    borderRadius: "50%",
    boxShadow: "0 0 10px #22c55e",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: "800",
    color: "white",
    lineHeight: 1.1,
    marginBottom: "1.5rem",
    letterSpacing: "-0.03em",
  },
  heroTitleGradient: {
    display: "block",
    background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "1.25rem",
    color: "rgba(255,255,255,0.7)",
    maxWidth: "650px",
    margin: "0 auto 2.5rem",
    lineHeight: 1.8,
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "3.5rem",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.625rem",
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    color: "white",
    padding: "1rem 1.75rem",
    borderRadius: "0.875rem",
    fontWeight: "600",
    fontSize: "1rem",
    textDecoration: "none",
    boxShadow: "0 8px 30px rgba(249, 115, 22, 0.35)",
  },
  btnArrow: {
    marginLeft: "0.25rem",
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.625rem",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    color: "white",
    padding: "1rem 1.75rem",
    borderRadius: "0.875rem",
    fontWeight: "600",
    fontSize: "1rem",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "1.25rem",
    padding: "1.5rem 2.5rem",
    maxWidth: "fit-content",
    margin: "0 auto",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.875rem",
  },
  statIcon: {
    fontSize: "1.5rem",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  statNumber: {
    fontSize: "1.375rem",
    fontWeight: "800",
    color: "#f97316",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  },
  scrollMouse: {
    width: "24px",
    height: "38px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    padding: "6px 0",
  },
  scrollWheel: {
    width: "4px",
    height: "8px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "2px",
  },
  scrollText: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.4)",
  },

  // Sections
  section: {
    padding: "6rem 0",
    background: "#ffffff",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "4rem",
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
  sectionTitle: {
    fontSize: "2.75rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "1rem",
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: "1.125rem",
    maxWidth: "500px",
    margin: "0 auto",
  },
  vehicleSection: {},
  vehicleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  categoryTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  categoryIcon: {
    fontSize: "1.5rem",
  },
  seeAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#f97316",
    fontWeight: "600",
    fontSize: "0.95rem",
    textDecoration: "none",
  },
  vehicleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "2rem",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "4rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #f97316",
    borderRadius: "50%",
    margin: "0 auto 1rem",
    animation: "spin 1s linear infinite",
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "2rem",
  },

  // Features
  featuresSection: {
    padding: "6rem 0",
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  featureCard: {
    background: "white",
    padding: "2.5rem 2rem",
    borderRadius: "1.25rem",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },
  featureIconWrapper: {
    width: "72px",
    height: "72px",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "0.75rem",
    margin: "0 0 0.75rem 0",
  },
  featureDesc: {
    color: "#64748b",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    margin: 0,
  },

  // Testimonials
  testimonialSection: {
    padding: "6rem 0",
    background: "#ffffff",
  },
  testimonialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "2rem",
  },
  testimonialCard: {
    background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
    padding: "2.5rem",
    borderRadius: "1.5rem",
    border: "1px solid #e2e8f0",
    position: "relative",
  },
  testimonialQuote: {
    position: "absolute",
    top: "1rem",
    right: "1.5rem",
    fontSize: "5rem",
    fontFamily: "Georgia, serif",
    color: "#f97316",
    opacity: 0.15,
    lineHeight: 1,
  },
  testimonialStars: {
    color: "#fbbf24",
    fontSize: "1.125rem",
    letterSpacing: "2px",
    marginBottom: "1.25rem",
  },
  testimonialText: {
    color: "#475569",
    lineHeight: 1.8,
    marginBottom: "1.75rem",
    fontSize: "1rem",
    position: "relative",
    zIndex: 1,
  },
  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  testimonialAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1.25rem",
  },
  testimonialInfo: {
    display: "flex",
    flexDirection: "column",
  },
  testimonialName: {
    fontWeight: "700",
    color: "#0f172a",
  },
  testimonialRole: {
    color: "#94a3b8",
    fontSize: "0.875rem",
  },

  // CTA
  ctaSection: {
    padding: "6rem 0",
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)",
    position: "relative",
    overflow: "hidden",
  },
  ctaBackground: {
    position: "absolute",
    inset: 0,
  },
  ctaOrb1: {
    position: "absolute",
    top: "-50%",
    left: "-20%",
    width: "60%",
    height: "100%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
  },
  ctaOrb2: {
    position: "absolute",
    bottom: "-50%",
    right: "-20%",
    width: "60%",
    height: "100%",
    background: "radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)",
  },
  ctaContent: {
    textAlign: "center",
    position: "relative",
    zIndex: 10,
  },
  ctaBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
  },
  ctaTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    color: "white",
    marginBottom: "1rem",
  },
  ctaSubtitle: {
    fontSize: "1.25rem",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "2.5rem",
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "white",
    color: "#ea580c",
    padding: "1.125rem 2.5rem",
    borderRadius: "1rem",
    fontWeight: "700",
    fontSize: "1.1rem",
    textDecoration: "none",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },
  ctaButtonIcon: {
    fontSize: "1.25rem",
  },
  ctaButtonArrow: {
    marginLeft: "0.25rem",
  },
  ctaButtonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "1rem",
    fontWeight: "600",
    fontSize: "1.05rem",
    textDecoration: "none",
  },
};
