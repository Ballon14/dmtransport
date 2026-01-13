import Link from 'next/link';

export default function VehicleCard({ vehicle }) {
  const isMotor = vehicle.type?.toLowerCase().includes('motor') || 
                  vehicle.type?.toLowerCase().includes('matic') || 
                  vehicle.type?.toLowerCase().includes('sport') ||
                  vehicle.type?.toLowerCase().includes('adventure');

  return (
    <div style={styles.card}>
      <div style={styles.imageWrapper}>
        {/* Image or Placeholder */}
        {vehicle.image ? (
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
            style={styles.vehicleImage}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <div style={styles.iconWrapper}>
              <span style={styles.placeholderIcon}>
                {isMotor ? '🏍️' : '🚗'}
              </span>
            </div>
            <span style={styles.placeholderText}>{vehicle.name}</span>
          </div>
        )}
        
        {/* Badges */}
        <div style={styles.badgeContainer}>
          {vehicle.available !== false ? (
            <span style={styles.badgeAvailable}>
              <span style={styles.badgeDot}></span>
              Tersedia
            </span>
          ) : (
            <span style={styles.badgeUnavailable}>Tidak Tersedia</span>
          )}
        </div>
        
        {/* Type Badge */}
        <span style={styles.typeBadge}>{vehicle.type}</span>
      </div>
      
      <div style={styles.content}>
        <h3 style={styles.name}>{vehicle.name}</h3>
        
        <div style={styles.specs}>
          {vehicle.specs?.map((spec, index) => (
            <span key={index} style={styles.spec}>
              {spec}
            </span>
          ))}
        </div>

        <div style={styles.footer}>
          <div style={styles.priceSection}>
            <span style={styles.priceLabel}>Mulai dari</span>
            <div style={styles.price}>
              <span style={styles.priceValue}>Rp {vehicle.price?.toLocaleString('id-ID')}</span>
              <span style={styles.priceUnit}>/hari</span>
            </div>
          </div>
        </div>
        
        {/* Action Button - Only Sewa */}
        <div style={styles.actions}>
          {vehicle.available !== false && vehicle._id ? (
            <Link
              href={`/sewa/${vehicle._id}`}
              style={styles.sewaBtn}
            >
              <span>📝</span> Sewa Sekarang
            </Link>
          ) : (
            <button style={styles.disabledBtn} disabled>
              Tidak Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid #e2e8f0',
  },
  imageWrapper: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 50%, #1e3a5f 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  placeholderIcon: {
    fontSize: '2.5rem',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    fontWeight: '500',
    letterSpacing: '0.05em',
  },
  badgeContainer: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
  },
  badgeAvailable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'rgba(34, 197, 94, 0.95)',
    color: 'white',
    padding: '0.4rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    background: 'white',
    borderRadius: '50%',
  },
  badgeUnavailable: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(239, 68, 68, 0.95)',
    color: 'white',
    padding: '0.4rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '0.35rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  content: {
    padding: '1.5rem',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e3a5f',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.02em',
  },
  specs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  spec: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '0.4rem 0.875rem',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '1rem',
  },
  priceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  priceLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },
  price: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  priceValue: {
    fontSize: '1.375rem',
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: '-0.02em',
  },
  priceUnit: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  sewaBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: 'white',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
    transition: 'all 0.3s ease',
  },
  disabledBtn: {
    flex: 1,
    background: '#94a3b8',
    color: 'white',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'not-allowed',
  },
};
