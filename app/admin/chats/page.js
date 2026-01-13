'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminChatsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchSessions();
    // Polling setiap 10 detik
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const url = filter ? `/api/chat/sessions?status=${filter}` : '/api/chat/sessions';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalUnread = sessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Live Chat</h1>
          <p style={styles.subtitle}>
            Kelola percakapan dengan pelanggan
            {totalUnread > 0 && (
              <span style={styles.totalUnread}>{totalUnread} pesan belum dibaca</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('')}
          style={{
            ...styles.filterButton,
            ...(filter === '' ? styles.filterButtonActive : {}),
          }}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{
            ...styles.filterButton,
            ...(filter === 'active' ? styles.filterButtonActive : {}),
          }}
        >
          Aktif
        </button>
        <button
          onClick={() => setFilter('closed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'closed' ? styles.filterButtonActive : {}),
          }}
        >
          Ditutup
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Memuat data...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>💬</span>
          <p>Belum ada percakapan</p>
        </div>
      ) : (
        <div style={styles.sessionsList}>
          {sessions.map((session) => (
            <Link
              key={session._id}
              href={`/admin/chats/${session._id}`}
              style={styles.sessionCard}
            >
              <div style={styles.sessionInfo}>
                <div style={styles.sessionAvatar}>
                  {session.guestName?.[0]?.toUpperCase() || session.userId?.[0] || '?'}
                </div>
                <div style={styles.sessionDetails}>
                  <div style={styles.sessionHeader}>
                    <span style={styles.sessionName}>
                      {session.guestName || 'User #' + session._id.slice(-6)}
                    </span>
                    {session.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>{session.unreadCount}</span>
                    )}
                  </div>
                  <p style={styles.sessionLastMessage}>
                    {session.lastMessage || 'Tidak ada pesan'}
                  </p>
                  <div style={styles.sessionMeta}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(session.status === 'active' ? styles.statusActive : styles.statusClosed),
                    }}>
                      {session.status === 'active' ? 'Aktif' : 'Ditutup'}
                    </span>
                    <span style={styles.sessionTime}>
                      {formatDate(session.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e3a5f',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    marginTop: '4px',
  },
  totalUnread: {
    background: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginLeft: '8px',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  filterButton: {
    padding: '8px 16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
    background: 'white',
    color: '#64748b',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    background: '#1e3a5f',
    color: 'white',
    borderColor: '#1e3a5f',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderTopColor: '#1e3a5f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sessionCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  sessionInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  sessionAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  sessionDetails: {
    flex: 1,
    minWidth: 0,
  },
  sessionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  sessionName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  unreadBadge: {
    background: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  sessionLastMessage: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '4px 0 8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sessionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  statusActive: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  statusClosed: {
    background: '#f1f5f9',
    color: '#64748b',
  },
  sessionTime: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
};
