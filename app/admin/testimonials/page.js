'use client';

import { useEffect, useState } from 'react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(testimonialId, isApproved) {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, isApproved }),
      });
      const data = await res.json();
      
      if (data.success) {
        fetchTestimonials();
      } else {
        alert(data.error || 'Gagal mengupdate status');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  }

  async function handleDelete(testimonialId) {
    if (!confirm('Yakin ingin menghapus testimoni ini?')) return;
    
    try {
      const res = await fetch(`/api/admin/testimonials?id=${testimonialId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        fetchTestimonials();
      } else {
        alert(data.error || 'Gagal menghapus testimoni');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  }

  const pendingTestimonials = testimonials.filter(t => !t.isApproved);
  const approvedTestimonials = testimonials.filter(t => t.isApproved);

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Manajemen Testimoni</h2>
        <div style={styles.stats}>
          <span style={styles.statBadge}>
            ⏳ Pending: {pendingTestimonials.length}
          </span>
          <span style={styles.statBadgeApproved}>
            ✓ Disetujui: {approvedTestimonials.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Memuat testimoni...</div>
      ) : testimonials.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>💬</span>
          <h3>Belum Ada Testimoni</h3>
          <p>Testimoni dari pelanggan akan muncul di sini.</p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pendingTestimonials.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>⏳ Menunggu Persetujuan</h3>
              <div style={styles.grid}>
                {pendingTestimonials.map((t) => (
                  <div key={t._id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.avatar}>{t.name?.charAt(0) || 'P'}</div>
                      <div style={styles.info}>
                        <h4 style={styles.name}>{t.name}</h4>
                        <span style={styles.role}>{t.role}</span>
                      </div>
                      <div style={styles.rating}>{'★'.repeat(t.rating)}</div>
                    </div>
                    <p style={styles.text}>{t.text}</p>
                    <div style={styles.meta}>
                      <span>Order: {t.bookingId?.orderId || '-'}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div style={styles.actions}>
                      <button 
                        onClick={() => handleApprove(t._id, true)}
                        style={styles.approveBtn}
                      >
                        ✓ Setujui
                      </button>
                      <button 
                        onClick={() => handleDelete(t._id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved */}
          {approvedTestimonials.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>✓ Sudah Disetujui (Tampil di Homepage)</h3>
              <div style={styles.grid}>
                {approvedTestimonials.map((t) => (
                  <div key={t._id} style={{...styles.card, ...styles.cardApproved}}>
                    <div style={styles.cardHeader}>
                      <div style={styles.avatar}>{t.name?.charAt(0) || 'P'}</div>
                      <div style={styles.info}>
                        <h4 style={styles.name}>{t.name}</h4>
                        <span style={styles.role}>{t.role}</span>
                      </div>
                      <div style={styles.rating}>{'★'.repeat(t.rating)}</div>
                    </div>
                    <p style={styles.text}>{t.text}</p>
                    <div style={styles.meta}>
                      <span>Order: {t.bookingId?.orderId || '-'}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div style={styles.actions}>
                      <button 
                        onClick={() => handleApprove(t._id, false)}
                        style={styles.rejectBtn}
                      >
                        ✗ Batalkan
                      </button>
                      <button 
                        onClick={() => handleDelete(t._id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e3a5f',
    margin: 0,
  },
  stats: {
    display: 'flex',
    gap: '0.75rem',
  },
  statBadge: {
    background: '#fef3c7',
    color: '#d97706',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  statBadgeApproved: {
    background: '#dcfce7',
    color: '#16a34a',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '2px solid #fef3c7',
  },
  cardApproved: {
    border: '2px solid #dcfce7',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#1e3a5f',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    margin: 0,
  },
  role: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  rating: {
    color: '#fbbf24',
    fontSize: '1rem',
  },
  text: {
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e2e8f0',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  approveBtn: {
    flex: 1,
    padding: '0.5rem',
    background: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  rejectBtn: {
    flex: 1,
    padding: '0.5rem',
    background: '#f97316',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  deleteBtn: {
    padding: '0.5rem 0.75rem',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
};
