'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function RiwayatPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/booking');
        const data = await res.json();
        if (data.success) {
          setBookings(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isSignedIn) {
      fetchBookings();
    }
  }, [isSignedIn]);

  const getStatusBadge = (paymentStatus) => {
    const statusMap = {
      paid: { label: 'Lunas', color: '#22c55e', bg: '#dcfce7' },
      pending: { label: 'Belum Bayar', color: '#f59e0b', bg: '#fef3c7' },
      failed: { label: 'Gagal', color: '#ef4444', bg: '#fee2e2' },
      expired: { label: 'Kedaluwarsa', color: '#64748b', bg: '#f1f5f9' },
    };
    return statusMap[paymentStatus] || statusMap.pending;
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.paymentStatus === filter;
  });

  if (!isLoaded || loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Riwayat Pemesanan</h1>
          <p style={styles.subtitle}>Lihat semua pesanan rental Anda</p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          {/* Filter */}
          <div style={styles.filterBar}>
            {[
              { value: 'all', label: 'Semua' },
              { value: 'pending', label: 'Belum Bayar' },
              { value: 'paid', label: 'Lunas' },
              { value: 'failed', label: 'Gagal' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f.value ? styles.filterBtnActive : {}),
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📋</span>
              <h3 style={styles.emptyTitle}>Belum ada pesanan</h3>
              <p style={styles.emptyText}>
                Anda belum memiliki riwayat pemesanan. Mulai sewa kendaraan sekarang!
              </p>
              <Link href="/mobil" style={styles.browseBtn}>
                🚗 Lihat Kendaraan
              </Link>
            </div>
          ) : (
            <div style={styles.bookingsList}>
              {filteredBookings.map((booking) => {
                const status = getStatusBadge(booking.paymentStatus);
                return (
                  <Link
                    key={booking._id}
                    href={`/booking/${booking._id}`}
                    style={styles.bookingCard}
                  >
                    <div style={styles.cardHeader}>
                      <span style={styles.orderId}>{booking.orderId}</span>
                      <span style={{
                        ...styles.statusBadge,
                        background: status.bg,
                        color: status.color,
                      }}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div style={styles.cardBody}>
                      <div style={styles.vehicleInfo}>
                        <span style={styles.vehicleIcon}>
                          {booking.vehicleType?.toLowerCase().includes('motor') ? '🏍️' : '🚗'}
                        </span>
                        <div>
                          <h4 style={styles.vehicleName}>{booking.vehicleName}</h4>
                          <span style={styles.vehicleType}>{booking.vehicleType}</span>
                        </div>
                      </div>
                      
                      <div style={styles.rentalInfo}>
                        <div style={styles.dateRange}>
                          <span>{new Date(booking.startDate).toLocaleDateString('id-ID')}</span>
                          <span style={styles.dateArrow}>→</span>
                          <span>{new Date(booking.endDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        <span style={styles.duration}>{booking.totalDays} hari</span>
                      </div>
                    </div>
                    
                    <div style={styles.cardFooter}>
                      <span style={styles.totalLabel}>Total</span>
                      <span style={styles.totalPrice}>
                        Rp {booking.totalPrice?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)',
    padding: '4rem 0',
    textAlign: 'center',
  },
  container: { maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' },
  section: { padding: '2rem 0 4rem' },
  filterBar: {
    display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap',
  },
  filterBtn: {
    background: 'white', color: '#64748b', padding: '0.625rem 1.25rem',
    borderRadius: '9999px', border: '1px solid #e2e8f0', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: '#1e3a5f', color: 'white', borderColor: '#1e3a5f',
  },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  bookingCard: {
    background: 'white', borderRadius: '1rem', overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textDecoration: 'none',
    border: '1px solid #e2e8f0', transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
  },
  orderId: { fontSize: '0.85rem', fontWeight: '600', color: '#64748b' },
  statusBadge: {
    padding: '0.375rem 0.875rem', borderRadius: '9999px',
    fontSize: '0.75rem', fontWeight: '600',
  },
  cardBody: {
    padding: '1.25rem', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
  },
  vehicleInfo: { display: 'flex', alignItems: 'center', gap: '0.875rem' },
  vehicleIcon: { fontSize: '2rem' },
  vehicleName: { fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0 },
  vehicleType: { fontSize: '0.8rem', color: '#64748b' },
  rentalInfo: { textAlign: 'right' },
  dateRange: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#374151' },
  dateArrow: { color: '#94a3b8' },
  duration: { fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', background: '#f8fafc',
  },
  totalLabel: { fontSize: '0.9rem', color: '#64748b' },
  totalPrice: { fontSize: '1.125rem', fontWeight: '700', color: '#ea580c' },
  emptyState: {
    textAlign: 'center', padding: '4rem 2rem',
    background: 'white', borderRadius: '1.25rem',
  },
  emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' },
  emptyText: { color: '#64748b', marginBottom: '1.5rem' },
  browseBtn: {
    display: 'inline-block', background: '#f97316', color: 'white',
    padding: '0.875rem 1.75rem', borderRadius: '0.75rem',
    textDecoration: 'none', fontWeight: '600',
  },
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '1rem',
  },
  spinner: {
    width: '40px', height: '40px', border: '4px solid #e2e8f0',
    borderTop: '4px solid #1e3a5f', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};
