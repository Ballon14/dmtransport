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
  
  // Testimonial states
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialExists, setTestimonialExists] = useState(false);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    rating: 5,
    text: '',
    role: '',
  });

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
          // Check if testimonial exists for this booking
          const testimonialRes = await fetch(`/api/testimonials/check?bookingId=${params.id}`);
          const testimonialData = await testimonialRes.json();
          if (testimonialData.success && testimonialData.exists) {
            setTestimonialExists(true);
          }
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

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    if (!testimonialForm.text.trim()) return;
    
    setSubmittingTestimonial(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          name: booking.customerName,
          role: testimonialForm.role || 'Pelanggan',
          text: testimonialForm.text,
          rating: testimonialForm.rating,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setTestimonialExists(true);
        setShowTestimonialModal(false);
        setTestimonialForm({ rating: 5, text: '', role: '' });
      } else {
        setError(data.error || 'Gagal mengirim testimoni');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setSubmittingTestimonial(false);
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
                  {booking?.vehicleImage ? (
                    <img 
                      src={booking.vehicleImage} 
                      alt={booking.vehicleName}
                      style={styles.vehicleImg}
                    />
                  ) : (
                    <div style={styles.vehicleIcon}>
                      {booking?.vehicleType?.toLowerCase().includes('motor') ? '🏍️' : '🚗'}
                    </div>
                  )}
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

                {/* Delivery Info */}
                <div style={styles.infoSection}>
                  <h4 style={styles.infoTitle}>🚚 Pengiriman</h4>
                  <div style={styles.deliveryInfo}>
                    <div style={styles.deliveryBadge}>
                      <span style={styles.deliveryBadgeIcon}>
                        {booking?.deliveryOption === 'delivery' ? '🚚' : '🏠'}
                      </span>
                      <span style={styles.deliveryBadgeText}>
                        {booking?.deliveryOption === 'delivery' ? 'Antar & Jemput' : 'Ambil Sendiri'}
                      </span>
                    </div>
                    {booking?.deliveryOption === 'delivery' && booking?.deliveryAddress && (
                      <div style={styles.deliveryAddressBox}>
                        <span style={styles.deliveryAddressLabel}>Alamat Pengantaran:</span>
                        <span style={styles.deliveryAddressValue}>{booking.deliveryAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div style={styles.infoSection}>
                  <h4 style={styles.infoTitle}>💳 Pembayaran</h4>
                  <div style={styles.paymentSummary}>
                    <div style={styles.paymentRow}>
                      <span>Harga sewa ({booking?.totalDays} x Rp {booking?.pricePerDay?.toLocaleString('id-ID')})</span>
                      <span>Rp {((booking?.totalDays || 0) * (booking?.pricePerDay || 0)).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={styles.paymentRow}>
                      <span>Biaya Pengiriman</span>
                      <span style={{ color: booking?.deliveryCost > 0 ? '#ea580c' : '#22c55e' }}>
                        {booking?.deliveryCost > 0 
                          ? `Rp ${booking.deliveryCost.toLocaleString('id-ID')}` 
                          : 'Gratis'}
                      </span>
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
                  
                  {/* Testimonial Button - only for paid bookings */}
                  {booking?.paymentStatus === 'paid' && !testimonialExists && (
                    <button
                      onClick={() => setShowTestimonialModal(true)}
                      style={styles.testimonialBtn}
                    >
                      ⭐ Berikan Testimoni
                    </button>
                  )}
                  
                  {testimonialExists && (
                    <div style={styles.testimonialSubmitted}>
                      ✅ Terima kasih! Testimoni Anda sudah terkirim.
                    </div>
                  )}
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

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTestimonialModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>⭐ Berikan Testimoni</h3>
              <button 
                onClick={() => setShowTestimonialModal(false)}
                style={styles.modalClose}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitTestimonial} style={styles.testimonialForm}>
              {/* Rating */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Rating</label>
                <div style={styles.ratingSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestimonialForm({...testimonialForm, rating: star})}
                      style={{
                        ...styles.starBtn,
                        color: star <= testimonialForm.rating ? '#fbbf24' : '#d1d5db',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Role */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Profesi (opsional)</label>
                <input
                  type="text"
                  value={testimonialForm.role}
                  onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})}
                  placeholder="Contoh: Pengusaha, Mahasiswa, dll"
                  style={styles.formInput}
                />
              </div>
              
              {/* Text */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Testimoni Anda *</label>
                <textarea
                  value={testimonialForm.text}
                  onChange={e => setTestimonialForm({...testimonialForm, text: e.target.value})}
                  placeholder="Ceritakan pengalaman Anda menyewa di DM Transport..."
                  rows={4}
                  required
                  style={styles.formTextarea}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={submittingTestimonial || !testimonialForm.text.trim()}
                style={styles.submitTestimonialBtn}
              >
                {submittingTestimonial ? 'Mengirim...' : 'Kirim Testimoni'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)',
    padding: '4rem 0',
    paddingTop: '7rem',
    marginTop: '-80px',
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
  vehicleImg: { 
    width: '80px', 
    height: '80px', 
    borderRadius: '0.75rem', 
    objectFit: 'cover',
  },
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
  deliveryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  deliveryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
  },
  deliveryBadgeIcon: {
    fontSize: '1.25rem',
  },
  deliveryBadgeText: {
    fontWeight: '600',
    color: '#166534',
  },
  deliveryAddressBox: {
    background: '#f8fafc',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  },
  deliveryAddressLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  deliveryAddressValue: {
    fontSize: '0.95rem',
    color: '#0f172a',
    fontWeight: '500',
  },
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
  // Testimonial styles
  testimonialBtn: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#1e3a5f', padding: '1rem', borderRadius: '0.75rem', border: 'none',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
  },
  testimonialSubmitted: {
    background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.75rem',
    textAlign: 'center', fontWeight: '600', fontSize: '0.95rem',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modalContent: {
    background: 'white', borderRadius: '1.25rem', maxWidth: '500px', width: '100%',
    maxHeight: '90vh', overflow: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem', borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  modalClose: {
    background: 'none', border: 'none', fontSize: '1.25rem', color: '#64748b',
    cursor: 'pointer', padding: '0.25rem',
  },
  testimonialForm: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  formLabel: { fontSize: '0.9rem', fontWeight: '600', color: '#374151' },
  formInput: {
    padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
    fontSize: '1rem', outline: 'none',
  },
  formTextarea: {
    padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
    fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
  },
  ratingSelector: { display: 'flex', gap: '0.5rem' },
  starBtn: {
    background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  submitTestimonialBtn: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white', padding: '1rem', borderRadius: '0.75rem', border: 'none',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
  },
};
