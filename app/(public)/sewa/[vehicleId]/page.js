'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Script from 'next/script';

export default function SewaVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  
  const [calculated, setCalculated] = useState({
    totalDays: 0,
    totalPrice: 0,
  });

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Pre-fill user name
  useEffect(() => {
    if (clerkUser) {
      setFormData(prev => ({
        ...prev,
        customerName: clerkUser.fullName || '',
      }));
    }
  }, [clerkUser]);

  // Fetch vehicle data
  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await fetch(`/api/vehicles/${params.vehicleId}`);
        const data = await res.json();
        if (data.success) {
          setVehicle(data.data);
        } else {
          setError('Kendaraan tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data kendaraan');
      } finally {
        setLoading(false);
      }
    }
    
    if (params.vehicleId) {
      fetchVehicle();
    }
  }, [params.vehicleId]);

  // Calculate price when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate && vehicle) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      setCalculated({
        totalDays: days,
        totalPrice: days * vehicle.price,
      });
    }
  }, [formData.startDate, formData.endDate, vehicle]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: params.vehicleId,
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const booking = data.data.booking;
        const payment = data.data.payment;

        if (payment?.token && window.snap) {
          // Open Midtrans Snap popup
          window.snap.pay(payment.token, {
            onSuccess: function(result) {
              router.push(`/booking/${booking._id}?status=success`);
            },
            onPending: function(result) {
              router.push(`/booking/${booking._id}?status=pending`);
            },
            onError: function(result) {
              router.push(`/booking/${booking._id}?status=error`);
            },
            onClose: function() {
              router.push(`/booking/${booking._id}`);
            }
          });
        } else {
          // No Snap token, redirect to booking page
          router.push(`/booking/${booking._id}`);
        }
      } else {
        setError(data.error || 'Gagal membuat pesanan');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  if (!isLoaded || loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div style={styles.errorPage}>
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Midtrans Snap Script */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div style={styles.page}>
        {/* Header */}
        <section style={styles.header}>
          <div style={styles.container}>
            <h1 style={styles.title}>Form Pemesanan</h1>
            <p style={styles.subtitle}>Lengkapi data untuk menyewa kendaraan</p>
          </div>
        </section>

        {/* Content */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.grid}>
              {/* Vehicle Info */}
              <div style={styles.vehicleCard}>
                <div style={styles.vehicleImage}>
                  {vehicle?.image ? (
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      style={styles.vehicleImg}
                    />
                  ) : (
                    <span style={styles.vehicleIcon}>
                      {vehicle?.type === 'motor' ? '🏍️' : '🚗'}
                    </span>
                  )}
                </div>
                <div style={styles.vehicleInfo}>
                  <span style={styles.vehicleType}>{vehicle?.type}</span>
                  <h2 style={styles.vehicleName}>{vehicle?.name}</h2>
                  <div style={styles.vehicleSpecs}>
                    {vehicle?.specs?.map((spec, i) => (
                      <span key={i} style={styles.spec}>{spec}</span>
                    ))}
                  </div>
                  <div style={styles.priceBox}>
                    <span style={styles.priceLabel}>Harga per hari</span>
                    <span style={styles.priceValue}>
                      Rp {vehicle?.price?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Detail Pemesanan</h3>
                
                {error && (
                  <div style={styles.errorBox}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nama Lengkap *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nomor Telepon *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Alamat</label>
                    <input
                      type="text"
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Alamat pengambilan (opsional)"
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tanggal Mulai *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        min={today}
                        required
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tanggal Selesai *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={formData.startDate || today}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Catatan</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      style={styles.textarea}
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>

                  {/* Summary */}
                  {calculated.totalDays > 0 && (
                    <div style={styles.summary}>
                      <div style={styles.summaryRow}>
                        <span>Durasi Sewa</span>
                        <span>{calculated.totalDays} hari</span>
                      </div>
                      <div style={styles.summaryRow}>
                        <span>Harga per hari</span>
                        <span>Rp {vehicle?.price?.toLocaleString('id-ID')}</span>
                      </div>
                      <div style={styles.summaryTotal}>
                        <span>Total Pembayaran</span>
                        <span style={styles.totalPrice}>
                          Rp {calculated.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || calculated.totalDays === 0}
                    style={{
                      ...styles.submitBtn,
                      opacity: submitting || calculated.totalDays === 0 ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Memproses...' : '💳 Bayar Sekarang'}
                  </button>

                  <p style={styles.paymentNote}>
                    Anda akan diarahkan ke halaman pembayaran Midtrans
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)',
    padding: '4rem 0',
    textAlign: 'center',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1.1rem',
  },
  section: {
    padding: '3rem 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  vehicleCard: {
    background: 'white',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: '100px',
  },
  vehicleImage: {
    height: '200px',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIcon: {
    fontSize: '4rem',
  },
  vehicleImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  vehicleInfo: {
    padding: '1.5rem',
  },
  vehicleType: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  vehicleName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0.5rem 0 1rem',
  },
  vehicleSpecs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  spec: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
  },
  priceBox: {
    background: '#fff7ed',
    borderRadius: '0.75rem',
    padding: '1rem',
    textAlign: 'center',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#9a3412',
    marginBottom: '0.25rem',
  },
  priceValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ea580c',
  },
  formCard: {
    background: 'white',
    borderRadius: '1.25rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  formTitle: {
    fontSize: '1.375rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1.5rem',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '0.75rem',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  summary: {
    background: '#f8fafc',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    marginTop: '0.5rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    color: '#64748b',
    fontSize: '0.95rem',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0 0',
    marginTop: '0.5rem',
    borderTop: '1px solid #e2e8f0',
    fontWeight: '600',
    color: '#0f172a',
  },
  totalPrice: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ea580c',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white',
    padding: '1rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
  },
  paymentNote: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginTop: '0.5rem',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #1e3a5f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
    textAlign: 'center',
  },
  backBtn: {
    background: '#1e3a5f',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
};
