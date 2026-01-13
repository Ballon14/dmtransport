'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Script from 'next/script';
import Link from 'next/link';

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingAgain, setPayingAgain] = useState(false);

  const status = searchParams.get('status');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/booking/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.data);
        } else {
          setError('Pemesanan tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data pemesanan');
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id && isSignedIn) {
      fetchBooking();
    }
  }, [params.id, isSignedIn]);

  const handlePayAgain = async () => {
    setPayingAgain(true);
    try {
      const res = await fetch(`/api/booking/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate_payment' }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data.payment?.token && window.snap) {
        window.snap.pay(data.data.payment.token, {
          onSuccess: () => window.location.reload(),
          onPending: () => window.location.reload(),
          onError: () => window.location.reload(),
          onClose: () => setPayingAgain(false),
        });
      } else {
        setError('Gagal membuat pembayaran');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setPayingAgain(false);
    }
  };

  const getStatusInfo = (paymentStatus, bookingStatus) => {
    if (paymentStatus === 'paid') {
      return { label: 'Pembayaran Berhasil', color: '#22c55e', bg: '#dcfce7', icon: '✓' };
    }
    if (paymentStatus === 'pending') {
      return { label: 'Menunggu Pembayaran', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' };
    }
    if (paymentStatus === 'failed' || paymentStatus === 'expired') {
      return { label: 'Pembayaran Gagal', color: '#ef4444', bg: '#fee2e2', icon: '✗' };
    }
    return { label: bookingStatus, color: '#64748b', bg: '#f1f5f9', icon: '•' };
  };

  if (!isLoaded || loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorPage}>
        <h2>Oops!</h2>
        <p>{error}</p>
        <Link href="/riwayat" style={styles.backBtn}>
          ← Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const statusInfo = booking ? getStatusInfo(booking.paymentStatus, booking.status) : {};

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div style={styles.page}>
        <section style={styles.header}>
          <div style={styles.container}>
            <h1 style={styles.title}>Detail Pemesanan</h1>
            <p style={styles.subtitle}>Order ID: {booking?.orderId}</p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.container}>
            {/* Status Banner */}
            {status === 'success' && (
              <div style={styles.successBanner}>
                🎉 Pembayaran berhasil! Terima kasih atas pesanan Anda.
              </div>
            )}
            
            {status === 'pending' && (
              <div style={styles.pendingBanner}>
                ⏳ Menunggu konfirmasi pembayaran...
              </div>
            )}

            <div style={styles.content}>
              {/* Main Info */}
              <div style={styles.mainCard}>
                {/* Status */}
                <div style={{
                  ...styles.statusBox,
                  background: statusInfo.bg,
                  color: statusInfo.color,
                }}>
                  <span style={styles.statusIcon}>{statusInfo.icon}</span>
                  <span style={styles.statusLabel}>{statusInfo.label}</span>
                </div>

                {/* Vehicle */}
                <div style={styles.vehicleBox}>
                  <div style={styles.vehicleIcon}>
                    {booking?.vehicleType?.toLowerCase().includes('motor') ? '🏍️' : '🚗'}
                  </div>
                  <div>
                    <h3 style={styles.vehicleName}>{booking?.vehicleName}</h3>
                    <span style={styles.vehicleType}>{booking?.vehicleType}</span>
                  </div>
                </div>

                {/* Rental Period */}
                <div style={styles.infoSection}>
                  <h4 style={styles.infoTitle}>📅 Periode Sewa</h4>
                  <div style={styles.dateBox}>
                    <div style={styles.dateItem}>
                      <span style={styles.dateLabel}>Mulai</span>
                      <span style={styles.dateValue}>
                        {new Date(booking?.startDate).toLocaleDateString('id-ID', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={styles.dateSeparator}>→</div>
                    <div style={styles.dateItem}>
                      <span style={styles.dateLabel}>Selesai</span>
                      <span style={styles.dateValue}>
                        {new Date(booking?.endDate).toLocaleDateString('id-ID', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <p style={styles.daysInfo}>Durasi: {booking?.totalDays} hari</p>
                </div>

                {/* Customer Info */}
                <div style={styles.infoSection}>
                  <h4 style={styles.infoTitle}>👤 Data Penyewa</h4>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Nama</span>
                      <span style={styles.infoValue}>{booking?.customerName}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Telepon</span>
                      <span style={styles.infoValue}>{booking?.customerPhone}</span>
                    </div>
                    {booking?.customerAddress && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Alamat</span>
                        <span style={styles.infoValue}>{booking?.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div style={styles.infoSection}>
                  <h4 style={styles.infoTitle}>💳 Pembayaran</h4>
                  <div style={styles.paymentSummary}>
                    <div style={styles.paymentRow}>
                      <span>Harga per hari</span>
                      <span>Rp {booking?.pricePerDay?.toLocaleString('id-ID')}</span>
                    </div>
                    <div style={styles.paymentRow}>
                      <span>Durasi</span>
                      <span>{booking?.totalDays} hari</span>
                    </div>
                    <div style={styles.paymentTotal}>
                      <span>Total</span>
                      <span style={styles.totalAmount}>
                        Rp {booking?.totalPrice?.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {booking?.paymentMethod && (
                      <div style={styles.paymentMethod}>
                        Metode: {booking.paymentMethod}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actions}>
                  {booking?.paymentStatus === 'pending' && (
                    <button
                      onClick={handlePayAgain}
                      disabled={payingAgain}
                      style={styles.payBtn}
                    >
                      {payingAgain ? 'Memproses...' : '💳 Bayar Sekarang'}
                    </button>
                  )}
                  <Link href="/riwayat" style={styles.historyBtn}>
                    📋 Lihat Riwayat Pesanan
                  </Link>
                </div>
              </div>

              {/* Notes */}
              {booking?.notes && (
                <div style={styles.notesCard}>
                  <h4 style={styles.notesTitle}>📝 Catatan</h4>
                  <p style={styles.notesText}>{booking.notes}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)',
    padding: '4rem 0',
    textAlign: 'center',
  },
  container: { maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: '1rem' },
  section: { padding: '2rem 0 4rem' },
  successBanner: {
    background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.75rem',
    marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600',
  },
  pendingBanner: {
    background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '0.75rem',
    marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600',
  },
  content: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  mainCard: {
    background: 'white', borderRadius: '1.25rem', padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  statusBox: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.625rem 1.25rem', borderRadius: '9999px',
    fontWeight: '600', marginBottom: '1.5rem',
  },
  statusIcon: { fontSize: '1rem' },
  statusLabel: { fontSize: '0.9rem' },
  vehicleBox: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', marginBottom: '1.5rem',
  },
  vehicleIcon: { fontSize: '2.5rem' },
  vehicleName: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  vehicleType: { fontSize: '0.85rem', color: '#64748b' },
  infoSection: { marginBottom: '1.5rem' },
  infoTitle: { fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' },
  dateBox: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  dateItem: { flex: 1, minWidth: '200px' },
  dateLabel: { display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' },
  dateValue: { fontWeight: '600', color: '#0f172a' },
  dateSeparator: { color: '#94a3b8', fontSize: '1.25rem' },
  daysInfo: { marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  infoItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' },
  infoLabel: { color: '#64748b' },
  infoValue: { fontWeight: '500', color: '#0f172a' },
  paymentSummary: { background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem' },
  paymentRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0.5rem 0', color: '#64748b', fontSize: '0.95rem',
  },
  paymentTotal: {
    display: 'flex', justifyContent: 'space-between',
    padding: '1rem 0 0', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0',
    fontWeight: '600', color: '#0f172a',
  },
  totalAmount: { fontSize: '1.25rem', fontWeight: '800', color: '#ea580c' },
  paymentMethod: { marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' },
  actions: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' },
  payBtn: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white', padding: '1rem', borderRadius: '0.75rem', border: 'none',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
  },
  historyBtn: {
    background: '#f1f5f9', color: '#374151', padding: '1rem', borderRadius: '0.75rem',
    textAlign: 'center', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem',
  },
  notesCard: {
    background: 'white', borderRadius: '1.25rem', padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  notesTitle: { fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' },
  notesText: { color: '#64748b', lineHeight: 1.6 },
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '1rem',
  },
  spinner: {
    width: '40px', height: '40px', border: '4px solid #e2e8f0',
    borderTop: '4px solid #1e3a5f', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
  errorPage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', textAlign: 'center', gap: '1rem',
  },
  backBtn: {
    background: '#1e3a5f', color: 'white', padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem', textDecoration: 'none', marginTop: '1rem',
  },
};
