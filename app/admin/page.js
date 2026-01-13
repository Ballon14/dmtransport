'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalCars: 0,
    totalMotors: 0,
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    ongoingBookings: 0,
    completedBookings: 0,
    activeChats: 0,
    unreadMessages: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vehiclesRes, usersRes, bookingsRes, chatsRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/users'),
          fetch('/api/admin/bookings'),
          fetch('/api/chat/sessions'),
        ]);
        
        const [vehiclesData, usersData, bookingsData, chatsData] = await Promise.all([
          vehiclesRes.json(),
          usersRes.json(),
          bookingsRes.json(),
          chatsRes.json(),
        ]);
        
        const vehicles = vehiclesData.success ? vehiclesData.data : [];
        const users = usersData.success ? usersData.data : [];
        const bookings = bookingsData.success ? bookingsData.data : [];
        const chats = chatsData.success ? chatsData.data : [];
        
        // Calculate revenue
        const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
        const totalRevenue = paidBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
        
        // Monthly revenue (current month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyBookings = paidBookings.filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        });
        const monthlyRevenue = monthlyBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
        
        setStats({
          totalVehicles: vehicles.length,
          totalCars: vehicles.filter(v => v.type === 'mobil').length,
          totalMotors: vehicles.filter(v => v.type === 'motor').length,
          totalUsers: users.length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.paymentStatus === 'pending').length,
          confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
          ongoingBookings: bookings.filter(b => b.status === 'ongoing').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          activeChats: chats.filter(c => c.status === 'active').length,
          unreadMessages: chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
          totalRevenue,
          monthlyRevenue,
        });
        
        // Recent bookings (last 5)
        setRecentBookings(bookings.slice(0, 5));
        
        // Recent chats (last 5 active)
        setRecentChats(chats.filter(c => c.status === 'active').slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getPaymentBadge = (status) => {
    const map = {
      paid: { label: 'Lunas', bg: '#dcfce7', color: '#166534' },
      pending: { label: 'Pending', bg: '#fef3c7', color: '#92400e' },
      failed: { label: 'Gagal', bg: '#fee2e2', color: '#991b1b' },
      expired: { label: 'Expired', bg: '#f1f5f9', color: '#475569' },
    };
    return map[status] || map.pending;
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard Admin 📊</h2>
        <p style={styles.subtitle}>Ringkasan statistik dan aktivitas terbaru.</p>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Memuat statistik...</p>
        </div>
      ) : (
        <>
          {/* Revenue Section */}
          <div style={styles.revenueSection}>
            <div style={styles.revenueCard}>
              <div style={styles.revenueIcon}>💰</div>
              <div style={styles.revenueInfo}>
                <span style={styles.revenueLabel}>Total Pendapatan</span>
                <span style={styles.revenueValue}>{formatCurrency(stats.totalRevenue)}</span>
              </div>
            </div>
            <div style={styles.revenueCard}>
              <div style={{ ...styles.revenueIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>📈</div>
              <div style={styles.revenueInfo}>
                <span style={styles.revenueLabel}>Pendapatan Bulan Ini</span>
                <span style={styles.revenueValue}>{formatCurrency(stats.monthlyRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#1e3a5f' }}>🚗</div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{stats.totalVehicles}</span>
                <span style={styles.statLabel}>Total Kendaraan</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#3b82f6' }}>🚙</div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{stats.totalCars}</span>
                <span style={styles.statLabel}>Mobil</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#8b5cf6' }}>🏍️</div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{stats.totalMotors}</span>
                <span style={styles.statLabel}>Motor</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#10b981' }}>👥</div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{stats.totalUsers}</span>
                <span style={styles.statLabel}>Pengguna</span>
              </div>
            </div>
          </div>

          {/* Booking Stats */}
          <h3 style={styles.sectionTitle}>📋 Statistik Pemesanan</h3>
          <div style={styles.bookingStatsGrid}>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#f59e0b' }}>
              <span style={styles.bookingStatValue}>{stats.totalBookings}</span>
              <span style={styles.bookingStatLabel}>Total Booking</span>
            </div>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#ef4444' }}>
              <span style={{ ...styles.bookingStatValue, color: '#ef4444' }}>{stats.pendingBookings}</span>
              <span style={styles.bookingStatLabel}>Pending Bayar</span>
            </div>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#3b82f6' }}>
              <span style={{ ...styles.bookingStatValue, color: '#3b82f6' }}>{stats.confirmedBookings}</span>
              <span style={styles.bookingStatLabel}>Dikonfirmasi</span>
            </div>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#06b6d4' }}>
              <span style={{ ...styles.bookingStatValue, color: '#06b6d4' }}>{stats.ongoingBookings}</span>
              <span style={styles.bookingStatLabel}>Berlangsung</span>
            </div>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#22c55e' }}>
              <span style={{ ...styles.bookingStatValue, color: '#22c55e' }}>{stats.completedBookings}</span>
              <span style={styles.bookingStatLabel}>Selesai</span>
            </div>
          </div>

          {/* Chat Stats */}
          <h3 style={styles.sectionTitle}>💬 Live Chat</h3>
          <div style={styles.chatStatsGrid}>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#06b6d4' }}>
              <span style={{ ...styles.bookingStatValue, color: '#06b6d4' }}>{stats.activeChats}</span>
              <span style={styles.bookingStatLabel}>Chat Aktif</span>
            </div>
            <div style={{ ...styles.bookingStatCard, borderLeftColor: '#ec4899' }}>
              <span style={{ ...styles.bookingStatValue, color: '#ec4899' }}>{stats.unreadMessages}</span>
              <span style={styles.bookingStatLabel}>Pesan Belum Dibaca</span>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div style={styles.recentSection}>
            {/* Recent Bookings */}
            <div style={styles.recentCard}>
              <div style={styles.recentHeader}>
                <h3 style={styles.recentTitle}>📋 Booking Terbaru</h3>
                <Link href="/admin/bookings" style={styles.viewAllLink}>Lihat Semua →</Link>
              </div>
              {recentBookings.length === 0 ? (
                <p style={styles.emptyText}>Belum ada booking</p>
              ) : (
                <div style={styles.recentList}>
                  {recentBookings.map((booking) => {
                    const payment = getPaymentBadge(booking.paymentStatus);
                    return (
                      <div key={booking._id} style={styles.recentItem}>
                        <div style={styles.recentItemInfo}>
                          <span style={styles.recentItemName}>{booking.customerName}</span>
                          <span style={styles.recentItemSub}>
                            {booking.vehicleName} • {formatDate(booking.createdAt)}
                          </span>
                        </div>
                        <div style={styles.recentItemRight}>
                          <span style={styles.recentItemPrice}>
                            {formatCurrency(booking.totalPrice || 0)}
                          </span>
                          <span style={{ ...styles.badge, background: payment.bg, color: payment.color }}>
                            {payment.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Chats */}
            <div style={styles.recentCard}>
              <div style={styles.recentHeader}>
                <h3 style={styles.recentTitle}>💬 Chat Aktif</h3>
                <Link href="/admin/chats" style={styles.viewAllLink}>Lihat Semua →</Link>
              </div>
              {recentChats.length === 0 ? (
                <p style={styles.emptyText}>Tidak ada chat aktif</p>
              ) : (
                <div style={styles.recentList}>
                  {recentChats.map((chat) => (
                    <Link key={chat._id} href={`/admin/chats/${chat._id}`} style={styles.recentItem}>
                      <div style={styles.chatAvatar}>
                        {chat.guestName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={styles.recentItemInfo}>
                        <span style={styles.recentItemName}>
                          {chat.guestName || 'User #' + chat._id.slice(-6)}
                        </span>
                        <span style={styles.recentItemSub}>
                          {chat.lastMessage || 'Tidak ada pesan'}
                        </span>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span style={styles.unreadBadge}>{chat.unreadCount}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: '1rem',
    color: '#64748b',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderTopColor: '#1e3a5f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  revenueSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  revenueCard: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    color: 'white',
    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.3)',
  },
  revenueIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '1rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    flexShrink: 0,
  },
  revenueInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  revenueLabel: {
    fontSize: '0.9rem',
    opacity: 0.8,
    marginBottom: '0.25rem',
  },
  revenueValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    flexShrink: 0,
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e3a5f',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '1rem',
    marginTop: '0.5rem',
  },
  bookingStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  bookingStatCard: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1rem',
    borderLeft: '4px solid #1e3a5f',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  bookingStatValue: {
    display: 'block',
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e3a5f',
  },
  bookingStatLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  chatStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(180px, 250px))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  recentSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  recentCard: {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
  },
  recentTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    margin: 0,
  },
  viewAllLink: {
    fontSize: '0.85rem',
    color: '#3b82f6',
    textDecoration: 'none',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f8fafc',
    borderRadius: '0.75rem',
    textDecoration: 'none',
  },
  recentItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  recentItemName: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentItemSub: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentItemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  recentItemPrice: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f97316',
  },
  badge: {
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: '600',
  },
  chatAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  unreadBadge: {
    background: '#ef4444',
    color: 'white',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '1.5rem',
    fontSize: '0.9rem',
  },
};
