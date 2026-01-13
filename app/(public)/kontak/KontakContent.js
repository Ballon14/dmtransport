'use client';

import { useState } from 'react';

// WhatsApp number from environment or fallback
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285200008800';

export default function KontakContent() {
  const [formData, setFormData] = useState({
    nama: '',
    telepon: '',
    pesan: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Halo DM Transport, saya ${formData.nama}.%0A%0A${formData.pesan}%0A%0ATelepon: ${formData.telepon}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Hubungi Kami</h1>
          <p style={styles.subtitle}>
            Ada pertanyaan? Jangan ragu untuk menghubungi kami!
          </p>
        </div>
      </div>

      {/* Content */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.grid}>
            {/* Contact Info */}
            <div style={styles.infoSection}>
              <h2 style={styles.infoTitle}>Informasi Kontak</h2>
              
              <div style={styles.contactList}>
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>📍</span>
                  <div>
                    <h3 style={styles.contactLabel}>Alamat</h3>
                    <p style={styles.contactValue}>
                      Jl. Kapten Piere Tendean, Rw. VI, Sindurjan, Kec. Purworejo, Kabupaten Purworejo, Jawa Tengah 54113
                    </p>
                  </div>
                </div>

                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>📞</span>
                  <div>
                    <h3 style={styles.contactLabel}>Telepon</h3>
                    <p style={styles.contactValue}>+62 852-0000-8800</p>
                  </div>
                </div>

                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>💬</span>
                  <div>
                    <h3 style={styles.contactLabel}>WhatsApp</h3>
                    <p style={styles.contactValue}>+62 852-0000-8800</p>
                  </div>
                </div>

                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>✉️</span>
                  <div>
                    <h3 style={styles.contactLabel}>Email</h3>
                    <p style={styles.contactValue}>info@dmtransport.com</p>
                  </div>
                </div>

                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>🕐</span>
                  <div>
                    <h3 style={styles.contactLabel}>Jam Operasional</h3>
                    <p style={styles.contactValue}>
                      Senin - Minggu: 07:00 - 21:00<br />
                      <em>(WhatsApp 24 jam)</em>
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.waButton}
              >
                💬 Chat WhatsApp Langsung
              </a>
            </div>

            {/* Contact Form */}
            <div style={styles.formSection}>
              <h2 style={styles.formTitle}>Kirim Pesan</h2>
              <p style={styles.formSubtitle}>
                Isi form di bawah ini dan pesan akan dikirim via WhatsApp
              </p>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label htmlFor="nama" style={styles.label}>Nama Lengkap</label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama Anda"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="telepon" style={styles.label}>Nomor Telepon</label>
                  <input
                    type="tel"
                    id="telepon"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder="08xx-xxxx-xxxx"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="pesan" style={styles.label}>Pesan</label>
                  <textarea
                    id="pesan"
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={5}
                    required
                    style={styles.textarea}
                  />
                </div>

                <button type="submit" style={styles.submitBtn}>
                  Kirim via WhatsApp 💬
                </button>
              </form>
            </div>
          </div>

          {/* Map placeholder */}
          <div style={styles.mapSection}>
            <h3 style={styles.mapTitle}>📍 Lokasi Kami</h3>
            <div style={styles.mapPlaceholder}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.7726351156543!2d110.00489387583852!3d-7.707529976349289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7aebb70a3b7575%3A0x9e674442a557a1d2!2sDm%20transport!5e0!3m2!1sid!2sid!4v1768315095594!5m2!1sid!2sid" 
                width="600" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
  },
  header: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f2a4a 100%)",
    padding: "4rem 0",
    paddingTop: "7rem",
    marginTop: "-80px",
    textAlign: "center",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.75rem",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "1.125rem",
  },
  section: {
    padding: "4rem 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "3rem",
    marginBottom: "4rem",
  },
  infoSection: {
    background: "#f8fafc",
    borderRadius: "1.5rem",
    padding: "2rem",
  },
  infoTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: "2rem",
  },
  contactList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  contactItem: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  contactIcon: {
    fontSize: "1.5rem",
    width: "40px",
    height: "40px",
    background: "white",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: "0.25rem",
  },
  contactValue: {
    color: "#1e3a5f",
    fontWeight: "500",
    lineHeight: 1.5,
  },
  waButton: {
    display: "block",
    width: "100%",
    background: "#25D366",
    color: "white",
    padding: "1rem",
    borderRadius: "0.75rem",
    textAlign: "center",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
  },
  formSection: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "1.5rem",
    padding: "2rem",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: "0.5rem",
  },
  formSubtitle: {
    color: "#64748b",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e3a5f",
  },
  input: {
    padding: "0.875rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #e2e8f0",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s",
  },
  textarea: {
    padding: "0.875rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #e2e8f0",
    fontSize: "1rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  submitBtn: {
    background: "#f97316",
    color: "white",
    padding: "1rem",
    borderRadius: "0.75rem",
    border: "none",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  mapSection: {
    textAlign: "center",
  },
  mapTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: "1.5rem",
  },
  mapPlaceholder: {
    borderRadius: "1rem",
    overflow: "hidden",
  },
};
