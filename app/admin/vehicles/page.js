'use client';

import { useEffect, useState } from 'react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'mobil',
    category: '',
    price: '',
    specs: '',
    image: '',
    available: true,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if new file selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        uploadFormData.append('type', formData.type); // Send type for descriptive filename
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadData.success) {
          alert(uploadData.error || 'Gagal upload gambar');
          setUploading(false);
          return;
        }
        
        imageUrl = uploadData.data.url;
      }
      
      const vehicleData = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price),
        specs: formData.specs.split(',').map(s => s.trim()).filter(Boolean),
      };

      const url = editingVehicle 
        ? `/api/vehicles/${editingVehicle._id}`
        : '/api/vehicles';
      
      const res = await fetch(url, {
        method: editingVehicle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      const data = await res.json();
      
      if (data.success) {
        fetchVehicles();
        resetForm();
      } else {
        alert(data.error || 'Gagal menyimpan kendaraan');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Terjadi kesalahan');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.error || 'Gagal menghapus kendaraan');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  }

  function handleEdit(vehicle) {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      category: vehicle.category,
      price: vehicle.price,
      specs: vehicle.specs?.join(', ') || '',
      image: vehicle.image || '',
      available: vehicle.available,
    });
    setImagePreview(vehicle.image || '');
    setImageFile(null);
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingVehicle(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      name: '',
      type: 'mobil',
      category: '',
      price: '',
      specs: '',
      image: '',
      available: true,
    });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  const cars = vehicles.filter(v => v.type === 'mobil');
  const motors = vehicles.filter(v => v.type === 'motor');

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Manajemen Kendaraan</h2>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          + Tambah Kendaraan
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</h3>
              <button onClick={resetForm} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Kendaraan</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Toyota Avanza"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="mobil">Mobil</option>
                    <option value="motor">Motor</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="MPV, SUV, Matic, dll"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Harga per Hari (Rp)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="350000"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tersedia</label>
                  <select
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.value === 'true' })}
                    style={styles.input}
                  >
                    <option value="true">Ya</option>
                    <option value="false">Tidak</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Spesifikasi (pisah dengan koma)</label>
                <input
                  type="text"
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="7 Kursi, Matic, AC Dingin"
                  style={styles.input}
                />
              </div>

              {/* Image Upload */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Foto Kendaraan</label>
                <div style={styles.uploadArea}>
                  {imagePreview ? (
                    <div style={styles.previewContainer}>
                      <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                      <button 
                        type="button" 
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        style={styles.removeImageBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label style={styles.uploadLabel}>
                      <span style={styles.uploadIcon}>📷</span>
                      <span>Klik untuk upload gambar</span>
                      <span style={styles.uploadHint}>JPG, PNG, WebP (Maks. 5MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        style={styles.fileInput}
                      />
                    </label>
                  )}
                </div>
                <p style={styles.uploadInfo}>
                  📁 Lokasi penyimpanan: <code>public/vehicles/</code>
                </p>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  Batal
                </button>
                <button type="submit" style={styles.saveBtn} disabled={uploading}>
                  {uploading ? 'Menyimpan...' : (editingVehicle ? 'Simpan Perubahan' : 'Tambah Kendaraan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Memuat kendaraan...</div>
      ) : (
        <>
          {/* Cars Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🚗 Mobil ({cars.length})</h3>
            {cars.length === 0 ? (
              <p style={styles.empty}>Belum ada mobil. Tambahkan kendaraan pertama!</p>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <span style={{ flex: 2 }}>Nama</span>
                  <span style={{ flex: 1 }}>Kategori</span>
                  <span style={{ flex: 1 }}>Harga/Hari</span>
                  <span style={{ flex: 1 }}>Status</span>
                  <span style={{ flex: 1 }}>Aksi</span>
                </div>
                {cars.map((vehicle) => (
                  <div key={vehicle._id} style={styles.tableRow}>
                    <span style={{ flex: 2, fontWeight: '600' }}>{vehicle.name}</span>
                    <span style={{ flex: 1 }}>{vehicle.category}</span>
                    <span style={{ flex: 1, color: '#f97316', fontWeight: '600' }}>
                      Rp {vehicle.price.toLocaleString('id-ID')}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={vehicle.available ? styles.badgeAvailable : styles.badgeUnavailable}>
                        {vehicle.available ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </span>
                    <span style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(vehicle)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(vehicle._id)} style={styles.deleteBtn}>Hapus</button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Motors Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏍️ Motor ({motors.length})</h3>
            {motors.length === 0 ? (
              <p style={styles.empty}>Belum ada motor.</p>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <span style={{ flex: 2 }}>Nama</span>
                  <span style={{ flex: 1 }}>Kategori</span>
                  <span style={{ flex: 1 }}>Harga/Hari</span>
                  <span style={{ flex: 1 }}>Status</span>
                  <span style={{ flex: 1 }}>Aksi</span>
                </div>
                {motors.map((vehicle) => (
                  <div key={vehicle._id} style={styles.tableRow}>
                    <span style={{ flex: 2, fontWeight: '600' }}>{vehicle.name}</span>
                    <span style={{ flex: 1 }}>{vehicle.category}</span>
                    <span style={{ flex: 1, color: '#f97316', fontWeight: '600' }}>
                      Rp {vehicle.price.toLocaleString('id-ID')}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={vehicle.available ? styles.badgeAvailable : styles.badgeUnavailable}>
                        {vehicle.available ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </span>
                    <span style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(vehicle)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(vehicle._id)} style={styles.deleteBtn}>Hapus</button>
                    </span>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e3a5f',
    margin: 0,
  },
  addBtn: {
    background: '#f97316',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
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
  table: {
    background: 'white',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  tableHeader: {
    display: 'flex',
    padding: '1rem 1.5rem',
    background: '#f8fafc',
    fontWeight: '600',
    color: '#64748b',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  badgeAvailable: {
    background: '#dcfce7',
    color: '#16a34a',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeUnavailable: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  editBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b',
    background: 'white',
    borderRadius: '0.75rem',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalContent: {
    background: 'white',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '500px',
    margin: '1rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#64748b',
  },
  form: {
    padding: '1.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: 'white',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.5rem',
    background: '#1e3a5f',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
  uploadArea: {
    border: '2px dashed #e2e8f0',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    color: '#64748b',
  },
  uploadIcon: {
    fontSize: '2rem',
  },
  uploadHint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  fileInput: {
    display: 'none',
  },
  previewContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '0.5rem',
    objectFit: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadInfo: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.75rem',
    marginBottom: '0',
    padding: '0.5rem',
    background: '#f8fafc',
    borderRadius: '0.375rem',
  },
};
