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
    startTime: '08:00', // Default start time
    endDate: '',
    endTime: '08:00', // Default end time
    notes: '',
    deliveryOption: 'self_pickup',
    deliveryAddress: '',
    rentalZone: 'inCity', // For motor: 'inCity' or 'outCity'
  });
  
  const DELIVERY_COST = 50000; // Rp 50.000
  
  const [calculated, setCalculated] = useState({
    totalDays: 0,
    rentalUnits: 0, // For mobil: 12-hour periods, for motor: days
    rentalPrice: 0,
    deliveryCost: 0,
    totalPrice: 0,
  });

  // Rental requirements checklist
  const rentalRequirements = [
    { id: 'ktp', label: 'Saya akan menyiapkan KTP / SIM asli sebagai jaminan' },
    { id: 'deposit', label: 'Saya bersedia memberikan uang deposit sesuai ketentuan' },
    { id: 'condition', label: 'Saya akan menjaga dan mengembalikan kendaraan dalam kondisi baik' },
    { id: 'fuel', label: 'Saya akan mengembalikan kendaraan dengan bensin penuh' },
    { id: 'terms', label: 'Saya menyetujui syarat dan ketentuan sewa DM Transport' },
  ];

  const [checkedRequirements, setCheckedRequirements] = useState({});
  
  const allRequirementsChecked = rentalRequirements.every(
    req => checkedRequirements[req.id]
  );

  const handleRequirementChange = (id) => {
    setCheckedRequirements(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  // Calculate price when dates/times or delivery option change
  useEffect(() => {
    const isMobil = vehicle?.type === 'mobil';
    
    // For mobil: need both date and time
    // For motor: need only dates
    const hasRequiredFields = isMobil 
      ? (formData.startDate && formData.startTime && formData.endDate && formData.endTime)
      : (formData.startDate && formData.endDate);
    
    if (hasRequiredFields && vehicle) {
      let rentalUnits;
      let unitPrice;
      let priceLabel;
      let totalHours = 0;
      let totalDays = 0;
      
      if (isMobil) {
        // For mobil: calculate based on actual hours with tiered pricing
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);
        const diffMs = endDateTime - startDateTime;
        totalHours = Math.max(diffMs / (1000 * 60 * 60), 0);
        
        // Tiered pricing:
        // - ≤12 hours: 1 x price12h
        // - >12 hours and ≤24 hours: 1 x price24h  
        // - >24 hours: ceil(hours/24) x price24h
        if (totalHours <= 12) {
          rentalUnits = 1;
          unitPrice = vehicle.price12h || 0;
          priceLabel = '12 jam';
        } else if (totalHours <= 24) {
          rentalUnits = 1;
          unitPrice = vehicle.price24h || 0;
          priceLabel = '24 jam';
        } else {
          rentalUnits = Math.ceil(totalHours / 24);
          unitPrice = vehicle.price24h || 0;
          priceLabel = '24 jam';
        }
        totalDays = Math.ceil(totalHours / 24) || 1;
      } else {
        // For motor: calculate based on days
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        rentalUnits = totalDays;
        
        if (formData.rentalZone === 'outCity') {
          unitPrice = vehicle.priceOutCity || 0;
          priceLabel = 'hari (luar kota)';
        } else {
          unitPrice = vehicle.priceInCity || 0;
          priceLabel = 'hari (dalam kota)';
        }
      }
      
      const rentalPrice = rentalUnits * unitPrice;
      const deliveryCost = formData.deliveryOption === 'delivery' ? DELIVERY_COST : 0;
      
      setCalculated({
        totalDays,
        totalHours,
        rentalUnits,
        unitPrice,
        priceLabel,
        rentalPrice,
        deliveryCost,
        totalPrice: rentalPrice + deliveryCost,
      });
    }
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime, formData.deliveryOption, formData.rentalZone, vehicle]);

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

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .sewa-grid {
            grid-template-columns: 1fr !important;
          }
          .sewa-vehicle-card {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 600px) {
          .sewa-form-row {
            grid-template-columns: 1fr !important;
          }
          .sewa-datetime-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .sewa-datetime-row input[type="time"] {
            width: 100% !important;
          }
          .sewa-summary-row {
            flex-direction: column !important;
            gap: 0.25rem !important;
          }
          .sewa-summary-row span:first-child {
            font-size: 0.85rem !important;
          }
        }
      `}</style>

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
            <div style={styles.grid} className="sewa-grid">
              {/* Vehicle Info */}
              <div style={styles.vehicleCard} className="sewa-vehicle-card">
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
                    {vehicle?.type === 'mobil' ? (
                      <>
                        <div style={styles.priceRowContainer}>
                          <span style={styles.priceLabelSmall}>12 jam:</span>
                          <span style={styles.priceValueSmall}>
                            Rp {(vehicle?.price12h || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div style={styles.priceRowContainer}>
                          <span style={styles.priceLabelSmall}>24 jam:</span>
                          <span style={styles.priceValueSmall24h}>
                            Rp {(vehicle?.price24h || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={styles.priceRowContainer}>
                          <span style={styles.priceLabelSmall}>Dalam Kota:</span>
                          <span style={styles.priceValueSmallInCity}>
                            Rp {(vehicle?.priceInCity || 0).toLocaleString('id-ID')}/hari
                          </span>
                        </div>
                        <div style={styles.priceRowContainer}>
                          <span style={styles.priceLabelSmall}>Luar Kota:</span>
                          <span style={styles.priceValueSmallOutCity}>
                            Rp {(vehicle?.priceOutCity || 0).toLocaleString('id-ID')}/hari
                          </span>
                        </div>
                      </>
                    )}
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

                  {/* Date and Time inputs for Mobil, Date-only for Motor */}
                  {vehicle?.type === 'mobil' ? (
                    <>
                      {/* Start Date & Time */}
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Waktu Mulai Sewa *</label>
                        <div style={styles.dateTimeRow} className="sewa-datetime-row">
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            min={today}
                            required
                            style={{...styles.input, flex: 1}}
                          />
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                            style={{...styles.input, width: '130px'}}
                          />
                        </div>
                      </div>
                      
                      {/* End Date & Time */}
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Waktu Selesai Sewa *</label>
                        <div style={styles.dateTimeRow} className="sewa-datetime-row">
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate || today}
                            required
                            style={{...styles.input, flex: 1}}
                          />
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                            style={{...styles.input, width: '130px'}}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={styles.formRow} className="sewa-form-row">
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
                  )}

                  {/* Zone Option for Motor */}
                  {vehicle?.type === 'motor' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Zona Pemakaian *</label>
                      <div style={styles.deliveryOptions}>
                        <label style={{
                          ...styles.deliveryOption,
                          ...(formData.rentalZone === 'inCity' ? styles.deliveryOptionActive : {}),
                        }}>
                          <input
                            type="radio"
                            name="rentalZone"
                            value="inCity"
                            checked={formData.rentalZone === 'inCity'}
                            onChange={handleChange}
                            style={styles.radioInput}
                          />
                          <div style={styles.deliveryOptionContent}>
                            <span style={styles.deliveryIcon}>🏙️</span>
                            <div>
                              <span style={styles.deliveryTitle}>Dalam Kota</span>
                              <span style={styles.deliveryDesc}>Rp {(vehicle?.priceInCity || 0).toLocaleString('id-ID')}/hari</span>
                            </div>
                          </div>
                        </label>
                        <label style={{
                          ...styles.deliveryOption,
                          ...(formData.rentalZone === 'outCity' ? styles.deliveryOptionActive : {}),
                        }}>
                          <input
                            type="radio"
                            name="rentalZone"
                            value="outCity"
                            checked={formData.rentalZone === 'outCity'}
                            onChange={handleChange}
                            style={styles.radioInput}
                          />
                          <div style={styles.deliveryOptionContent}>
                            <span style={styles.deliveryIcon}>🛣️</span>
                            <div>
                              <span style={styles.deliveryTitle}>Luar Kota</span>
                              <span style={styles.deliveryDesc}>Rp {(vehicle?.priceOutCity || 0).toLocaleString('id-ID')}/hari</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                  {/* Delivery Option */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Opsi Pengambilan *</label>
                    <div style={styles.deliveryOptions}>
                      <label style={{
                        ...styles.deliveryOption,
                        ...(formData.deliveryOption === 'self_pickup' ? styles.deliveryOptionActive : {}),
                      }}>
                        <input
                          type="radio"
                          name="deliveryOption"
                          value="self_pickup"
                          checked={formData.deliveryOption === 'self_pickup'}
                          onChange={handleChange}
                          style={styles.radioInput}
                        />
                        <div style={styles.deliveryOptionContent}>
                          <span style={styles.deliveryIcon}>🏠</span>
                          <div>
                            <span style={styles.deliveryTitle}>Ambil Sendiri</span>
                            <span style={styles.deliveryDesc}>Gratis - Ambil di kantor kami</span>
                          </div>
                        </div>
                      </label>
                      <label style={{
                        ...styles.deliveryOption,
                        ...(formData.deliveryOption === 'delivery' ? styles.deliveryOptionActive : {}),
                      }}>
                        <input
                          type="radio"
                          name="deliveryOption"
                          value="delivery"
                          checked={formData.deliveryOption === 'delivery'}
                          onChange={handleChange}
                          style={styles.radioInput}
                        />
                        <div style={styles.deliveryOptionContent}>
                          <span style={styles.deliveryIcon}>🚚</span>
                          <div>
                            <span style={styles.deliveryTitle}>Antar & Jemput</span>
                            <span style={styles.deliveryDesc}>+Rp 50.000 - Diantar ke lokasi Anda</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Delivery Address (shown only when delivery is selected) */}
                  {formData.deliveryOption === 'delivery' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Alamat Pengantaran *</label>
                      <textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        rows={2}
                        required
                        style={styles.textarea}
                        placeholder="Masukkan alamat lengkap untuk pengantaran dan penjemputan"
                      />
                    </div>
                  )}

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
                  {(calculated.rentalUnits > 0) && (
                    <div style={styles.summary}>
                      <div style={styles.summaryRow} className="sewa-summary-row">
                        <span>Durasi Sewa</span>
                        <span>
                          {vehicle?.type === 'mobil' 
                            ? `${Math.floor(calculated.totalHours)} jam`
                            : `${calculated.totalDays} hari`
                          }
                        </span>
                      </div>
                      <div style={styles.summaryRow} className="sewa-summary-row">
                        <span>
                          Harga Sewa ({calculated.rentalUnits} x Rp {(calculated.unitPrice || 0).toLocaleString('id-ID')}/{calculated.priceLabel || 'hari'})
                        </span>
                        <span>Rp {calculated.rentalPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div style={styles.summaryRow} className="sewa-summary-row">
                        <span>Biaya Pengiriman</span>
                        <span style={{ color: calculated.deliveryCost > 0 ? '#ea580c' : '#22c55e' }}>
                          {calculated.deliveryCost > 0 
                            ? `Rp ${calculated.deliveryCost.toLocaleString('id-ID')}` 
                            : 'Gratis'}
                        </span>
                      </div>
                      <div style={styles.summaryTotal} className="sewa-summary-row">
                        <span>Total Pembayaran</span>
                        <span style={styles.totalPrice}>
                          Rp {calculated.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist */}
                  <div style={styles.requirementsSection}>
                    <h4 style={styles.requirementsTitle}>
                      ✅ Persyaratan Rental
                    </h4>
                    <p style={styles.requirementsSubtitle}>
                      Centang semua persyaratan sebelum melanjutkan
                    </p>
                    <div style={styles.requirementsList}>
                      {rentalRequirements.map((req) => (
                        <label key={req.id} style={styles.requirementItem}>
                          <input
                            type="checkbox"
                            checked={checkedRequirements[req.id] || false}
                            onChange={() => handleRequirementChange(req.id)}
                            style={styles.checkbox}
                          />
                          <span style={{
                            ...styles.checkboxCustom,
                            background: checkedRequirements[req.id] ? '#22c55e' : 'white',
                            borderColor: checkedRequirements[req.id] ? '#22c55e' : '#d4d4d8',
                          }}>
                            {checkedRequirements[req.id] && '✓'}
                          </span>
                          <span style={styles.requirementLabel}>{req.label}</span>
                        </label>
                      ))}
                    </div>
                    {!allRequirementsChecked && calculated.totalDays > 0 && (
                      <p style={styles.requirementsWarning}>
                        ⚠️ Harap centang semua persyaratan untuk melanjutkan
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || calculated.totalDays === 0 || !allRequirementsChecked}
                    style={{
                      ...styles.submitBtn,
                      opacity: submitting || calculated.totalDays === 0 || !allRequirementsChecked ? 0.7 : 1,
                      cursor: submitting || calculated.totalDays === 0 || !allRequirementsChecked ? 'not-allowed' : 'pointer',
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
    paddingTop: '7rem',
    marginTop: '-80px',
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
  priceRowContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  priceLabelSmall: {
    fontSize: '0.85rem',
    color: '#9a3412',
    fontWeight: '500',
  },
  priceValueSmall: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#f97316',
  },
  priceValueSmall24h: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#22c55e',
  },
  priceValueSmallInCity: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#3b82f6',
  },
  priceValueSmallOutCity: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#8b5cf6',
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
  dateTimeRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
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
  deliveryOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  deliveryOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderRadius: '0.75rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deliveryOptionActive: {
    borderColor: '#f97316',
    background: '#fff7ed',
  },
  radioInput: {
    display: 'none',
  },
  deliveryOptionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  deliveryIcon: {
    fontSize: '1.75rem',
  },
  deliveryTitle: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  deliveryDesc: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.125rem',
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
  requirementsSection: {
    background: '#fefce8',
    border: '1px solid #fef08a',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    marginTop: '1rem',
  },
  requirementsTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#854d0e',
    margin: '0 0 0.25rem 0',
  },
  requirementsSubtitle: {
    fontSize: '0.85rem',
    color: '#a16207',
    margin: '0 0 1rem 0',
  },
  requirementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'background 0.2s',
  },
  checkbox: {
    display: 'none',
  },
  checkboxCustom: {
    width: '22px',
    height: '22px',
    minWidth: '22px',
    borderRadius: '0.375rem',
    border: '2px solid #d4d4d8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'white',
    background: '#22c55e',
    transition: 'all 0.2s',
  },
  requirementLabel: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: '1.4',
  },
  requirementsWarning: {
    fontSize: '0.85rem',
    color: '#dc2626',
    marginTop: '1rem',
    marginBottom: '0',
    padding: '0.5rem',
    background: '#fef2f2',
    borderRadius: '0.5rem',
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
