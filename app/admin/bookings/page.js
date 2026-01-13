'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (data.success) {
        const allBookings = data.data;
        setBookings(allBookings);
        setStats({
          total: allBookings.length,
          pending: allBookings.filter(b => b.paymentStatus === 'pending').length,
          paid: allBookings.filter(b => b.paymentStatus === 'paid').length,
          failed: allBookings.filter(b => b.paymentStatus === 'failed' || b.paymentStatus === 'expired').length,
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId, status, paymentStatus) {
    try {
      const res = await fetch(`/api/booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const getPaymentBadge = (status) => {
    const map = {
      paid: { label: 'Lunas', bg: '#dcfce7', color: '#166534' },
      pending: { label: 'Belum Bayar', bg: '#fef3c7', color: '#92400e' },
      failed: { label: 'Gagal', bg: '#fee2e2', color: '#991b1b' },
      expired: { label: 'Kedaluwarsa', bg: '#f1f5f9', color: '#475569' },
    };
    return map[status] || map.pending;
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Menunggu', bg: '#fef3c7', color: '#92400e' },
      confirmed: { label: 'Dikonfirmasi', bg: '#dbeafe', color: '#1e40af' },
      ongoing: { label: 'Berlangsung', bg: '#d1fae5', color: '#065f46' },
      completed: { label: 'Selesai', bg: '#dcfce7', color: '#166534' },
      cancelled: { label: 'Dibatalkan', bg: '#fee2e2', color: '#991b1b' },
    };
    return map[status] || map.pending;
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.paymentStatus === filter;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Kelola Pemesanan</h1>
          <p style={styles.subtitle}>Lihat dan kelola semua pemesanan rental</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📋</span>
          <div style={styles.statInfo}>
            <span style={styles.statNumber}>{stats.total}</span>
            <span style={styles.statLabel}>Total Pesanan</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#f59e0b' }}>
          <span style={styles.statIcon}>⏳</span>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#f59e0b' }}>{stats.pending}</span>
            <span style={styles.statLabel}>Belum Bayar</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#22c55e' }}>
          <span style={styles.statIcon}>✅</span>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#22c55e' }}>{stats.paid}</span>
            <span style={styles.statLabel}>Lunas</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#ef4444' }}>
          <span style={styles.statIcon}>❌</span>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#ef4444' }}>{stats.failed}</span>
            <span style={styles.statLabel}>Gagal/Expired</span>
          </div>
        </div>
      </div>

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

      {/* Bookings Table */}
      {loading ? (
        <div style={styles.loading}>Memuat...</div>
      ) : filteredBookings.length === 0 ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>📭</span>
          <p>Belum ada pemesanan</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Pelanggan</th>
                <th style={styles.th}>Kendaraan</th>
                <th style={styles.th}>Periode</th>
                <th style={styles.th}>Pengiriman</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Pembayaran</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const payment = getPaymentBadge(booking.paymentStatus);
                const status = getStatusBadge(booking.status);
                return (
                  <tr key={booking._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.orderId}>{booking.orderId}</span>
                      <span style={styles.orderDate}>
                        {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.customerName}>{booking.customerName}</span>
                      <span style={styles.customerPhone}>{booking.customerPhone}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.vehicleName}>{booking.vehicleName}</span>
                      <span style={styles.vehicleType}>{booking.vehicleType}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dates}>
                        {new Date(booking.startDate).toLocaleDateString('id-ID')} -{' '}
                        {new Date(booking.endDate).toLocaleDateString('id-ID')}
                      </span>
                      <span style={styles.days}>{booking.totalDays} hari</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.deliveryBadge,
                        background: booking.deliveryOption === 'delivery' ? '#fef3c7' : '#dcfce7',
                        color: booking.deliveryOption === 'delivery' ? '#92400e' : '#166534',
                      }}>
                        {booking.deliveryOption === 'delivery' ? '🚚 Antar' : '🏠 Ambil'}
                      </span>
                      {booking.deliveryCost > 0 && (
                        <span style={styles.deliveryCost}>
                          +Rp {booking.deliveryCost?.toLocaleString('id-ID')}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.price}>
                        Rp {booking.totalPrice?.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: payment.bg,
                        color: payment.color,
                      }}>
                        {payment.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: status.bg,
                        color: status.color,
                      }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <Link href={`/booking/${booking._id}`} style={styles.viewBtn}>
                          👁️
                        </Link>
                        {booking.paymentStatus === 'paid' && booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'ongoing', 'paid')}
                            style={styles.actionBtn}
                            title="Tandai Berlangsung"
                          >
                            🚗
                          </button>
                        )}
                        {booking.status === 'ongoing' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'completed', 'paid')}
                            style={styles.actionBtn}
                            title="Tandai Selesai"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '0' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '0.25rem' },
  subtitle: { color: '#64748b', fontSize: '0.95rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid #1e3a5f',
  },
  statIcon: { fontSize: '1.75rem' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statNumber: { fontSize: '1.5rem', fontWeight: '800', color: '#1e3a5f' },
  statLabel: { fontSize: '0.85rem', color: '#64748b' },
  filterBar: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterBtn: {
    background: 'white',
    color: '#64748b',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  filterBtnActive: { background: '#1e3a5f', color: 'white', borderColor: '#1e3a5f' },
  tableWrapper: {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'auto',
    border: '1px solid #e2e8f0',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '1050px' },
  th: {
    background: '#f8fafc',
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1rem', verticalAlign: 'top' },
  orderId: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e3a5f' },
  orderDate: { display: 'block', fontSize: '0.75rem', color: '#94a3b8' },
  customerName: { display: 'block', fontWeight: '500', color: '#0f172a' },
  customerPhone: { display: 'block', fontSize: '0.8rem', color: '#64748b' },
  vehicleName: { display: 'block', fontWeight: '500', color: '#0f172a' },
  vehicleType: { display: 'block', fontSize: '0.8rem', color: '#64748b' },
  dates: { display: 'block', fontSize: '0.85rem', color: '#374151' },
  days: { display: 'block', fontSize: '0.75rem', color: '#94a3b8' },
  price: { fontWeight: '600', color: '#f97316' },
  deliveryBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.625rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  deliveryCost: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#f97316',
    marginTop: '0.25rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  actions: { display: 'flex', gap: '0.5rem' },
  viewBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  actionBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  loading: { textAlign: 'center', padding: '4rem', color: '#64748b' },
  empty: { textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem' },
  emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
};
