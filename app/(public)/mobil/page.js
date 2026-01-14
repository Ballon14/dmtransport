'use client';

import { useState, useEffect } from 'react';
import VehicleCard from "../../components/VehicleCard";

const infoItems = [
  { icon: "⏱️", text: "Durasi sewa minimal 12 jam" },
  { icon: "👤", text: "Sewa dengan/tanpa sopir tersedia" },
  { icon: "🪪", text: "Deposit: KTP/SIM + uang jaminan" },
  { icon: "🚗", text: "Antar jemput gratis area Purworejo" },
  { icon: "💰", text: "Diskon sewa mingguan/bulanan" },
];

export default function MobilPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      try {
        const res = await fetch('/api/vehicles?category=mobil');
        const data = await res.json();
        if (data.success) {
          setCars(data.data);
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  const availableCount = cars.filter(c => c.available).length;
  const lowestPrice = cars.length > 0 ? Math.min(...cars.map(c => c.price)) : 0;

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
            <span style={styles.headerBadge}>🚗 Rental Mobil</span>
            <h1 style={styles.title}>Sewa Mobil di Purworejo</h1>
            <p style={styles.subtitle}>
              Pilih mobil sesuai kebutuhan Anda. Semua kendaraan dalam kondisi prima dan terawat.
            </p>
            <div style={styles.headerStats}>
              <div style={styles.headerStat}>
                <span style={styles.headerStatNumber}>{cars.length}</span>
                <span style={styles.headerStatLabel}>Total Unit</span>
              </div>
              <div style={styles.headerStatDivider}></div>
              <div style={styles.headerStat}>
                <span style={styles.headerStatNumber}>{availableCount}</span>
                <span style={styles.headerStatLabel}>Tersedia</span>
              </div>
              <div style={styles.headerStatDivider}></div>
              <div style={styles.headerStat}>
                <span style={styles.headerStatNumber}>
                  {lowestPrice > 0 ? `${Math.round(lowestPrice/1000)}K` : '-'}
                </span>
                <span style={styles.headerStatLabel}>Mulai dari</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle List */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionInfo}>
              <h2 style={styles.sectionTitle}>Pilihan Mobil</h2>
              <p style={styles.sectionSubtitle}>Tersedia {availableCount} mobil siap sewa</p>
            </div>
            <span style={styles.priceNote}>
              * Harga dapat berubah sewaktu-waktu
            </span>
          </div>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Memuat data mobil...</p>
            </div>
          ) : cars.length > 0 ? (
            <div style={styles.grid}>
              {cars.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🚗</span>
              <h3>Belum Ada Mobil</h3>
              <p>Mohon maaf, saat ini belum ada mobil yang tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Box */}
      <section style={styles.infoSection}>
        <div style={styles.container}>
          <div style={styles.infoBox}>
            <div style={styles.infoBoxHeader}>
              <div style={styles.infoIconWrapper}>
                <span style={styles.infoIcon}>ℹ️</span>
              </div>
              <div>
                <h3 style={styles.infoTitle}>Informasi Sewa</h3>
                <p style={styles.infoSubtitle}>Ketentuan dan syarat sewa mobil</p>
              </div>
            </div>
            <div style={styles.infoGrid}>
              {infoItems.map((item, index) => (
                <div key={index} style={styles.infoItem}>
                  <span style={styles.infoItemIcon}>{item.icon}</span>
                  <span style={styles.infoItemText}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc" },
  header: {
    background: "#0f172a",
    padding: "5rem 0 6rem",
    paddingTop: "8rem",
    marginTop: "-80px",
    position: "relative",
    overflow: "hidden",
  },
  headerBackground: { position: "absolute", inset: 0 },
  headerOrb1: {
    position: "absolute",
    top: "-30%",
    left: "-10%",
    width: "50%",
    height: "80%",
    background: "radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)",
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
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
    position: "relative",
    zIndex: 10,
  },
  headerContent: { textAlign: "center" },
  headerBadge: {
    display: "inline-block",
    background: "rgba(249, 115, 22, 0.15)",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    color: "#fb923c",
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
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "1.125rem",
    maxWidth: "550px",
    margin: "0 auto 2.5rem",
  },
  headerStats: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2rem",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "1rem",
    padding: "1.25rem 2.5rem",
  },
  headerStat: { textAlign: "center" },
  headerStatNumber: { display: "block", fontSize: "1.75rem", fontWeight: "800", color: "#f97316" },
  headerStatLabel: { fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" },
  headerStatDivider: { width: "1px", height: "40px", background: "rgba(255,255,255,0.2)" },
  section: { padding: "4rem 0" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  sectionInfo: {},
  sectionTitle: { fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem" },
  sectionSubtitle: { color: "#64748b", fontSize: "1rem" },
  priceNote: { fontSize: "0.875rem", color: "#94a3b8", fontStyle: "italic" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "2rem",
  },
  loadingContainer: { textAlign: "center", padding: "4rem" },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #f97316",
    borderRadius: "50%",
    margin: "0 auto 1rem",
    animation: "spin 1s linear infinite",
  },
  emptyState: { textAlign: "center", padding: "4rem", background: "white", borderRadius: "1rem" },
  emptyIcon: { fontSize: "3rem", display: "block", marginBottom: "1rem" },
  infoSection: { paddingBottom: "5rem" },
  infoBox: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)",
    borderRadius: "1.5rem",
    padding: "2.5rem",
    color: "white",
  },
  infoBoxHeader: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" },
  infoIconWrapper: {
    width: "50px",
    height: "50px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "0.875rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: { fontSize: "1.5rem" },
  infoTitle: { fontSize: "1.375rem", fontWeight: "700", marginBottom: "0.125rem" },
  infoSubtitle: { fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1rem",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.875rem",
    background: "rgba(255,255,255,0.05)",
    padding: "1rem 1.25rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  infoItemIcon: { fontSize: "1.25rem" },
  infoItemText: { fontSize: "0.95rem", color: "rgba(255,255,255,0.9)" },
};
