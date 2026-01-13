'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'Gagal mengubah role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  }

  const admins = users.filter(u => u.role === 'admin');
  const customers = users.filter(u => u.role === 'customer');

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Manajemen Pengguna</h2>
      </div>

      {loading ? (
        <div style={styles.loading}>Memuat pengguna...</div>
      ) : users.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>👥</span>
          <h3>Belum Ada Pengguna</h3>
          <p>Pengguna akan muncul di sini ketika mereka mendaftar.</p>
        </div>
      ) : (
        <>
          {/* Admins */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👑 Admin ({admins.length})</h3>
            {admins.length === 0 ? (
              <p style={styles.empty}>Belum ada admin.</p>
            ) : (
              <div style={styles.userGrid}>
                {admins.map((user) => (
                  <div key={user._id} style={styles.userCard}>
                    <div style={styles.userAvatar}>
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.name} style={styles.avatarImg} />
                      ) : (
                        <span>{user.name?.charAt(0) || user.email?.charAt(0)}</span>
                      )}
                    </div>
                    <div style={styles.userInfo}>
                      <h4 style={styles.userName}>{user.name || 'Tanpa Nama'}</h4>
                      <p style={styles.userEmail}>{user.email}</p>
                      <span style={styles.badgeAdmin}>Admin</span>
                    </div>
                    <div style={styles.userActions}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        style={styles.roleSelect}
                      >
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customers */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Customer ({customers.length})</h3>
            {customers.length === 0 ? (
              <p style={styles.empty}>Belum ada customer.</p>
            ) : (
              <div style={styles.userGrid}>
                {customers.map((user) => (
                  <div key={user._id} style={styles.userCard}>
                    <div style={styles.userAvatar}>
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.name} style={styles.avatarImg} />
                      ) : (
                        <span>{user.name?.charAt(0) || user.email?.charAt(0)}</span>
                      )}
                    </div>
                    <div style={styles.userInfo}>
                      <h4 style={styles.userName}>{user.name || 'Tanpa Nama'}</h4>
                      <p style={styles.userEmail}>{user.email}</p>
                      <span style={styles.badgeCustomer}>Customer</span>
                    </div>
                    <div style={styles.userActions}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        style={styles.roleSelect}
                      >
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e3a5f',
    margin: 0,
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
  empty: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#64748b',
    background: 'white',
    borderRadius: '0.75rem',
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  userCard: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#1e3a5f',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '600',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0.25rem 0 0.5rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badgeAdmin: {
    display: 'inline-block',
    background: '#fef3c7',
    color: '#d97706',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  badgeCustomer: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#2563eb',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  userActions: {
    flexShrink: 0,
  },
  roleSelect: {
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
