'use client';

import { useState } from 'react';

// Daftar Admin WhatsApp
const ADMIN_LIST = [
  { id: 1, name: 'Admin 1', number: '6285200008800' },
  { id: 2, name: 'Admin 2', number: '6282136395758' },
  { id: 3, name: 'Admin 3', number: '6285945451616' },
];

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const message = encodeURIComponent('Halo DM Transport, saya ingin bertanya tentang rental kendaraan.');

  const handleClick = (e) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  const handleAdminClick = (number) => {
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    setShowMenu(false);
  };

  return (
    <>
      {/* Admin Menu */}
      {showMenu && (
        <>
          <div 
            style={styles.overlay}
            onClick={() => setShowMenu(false)}
          />
          <div style={styles.menu}>
            <div style={styles.menuHeader}>Pilih Admin</div>
            {ADMIN_LIST.map((admin) => (
              <button
                key={admin.id}
                style={styles.menuItem}
                onClick={() => handleAdminClick(admin.number)}
              >
                <span style={styles.adminIcon}>👤</span>
                <div style={styles.adminInfo}>
                  <span style={styles.adminName}>{admin.name}</span>
                  <span style={styles.adminNumber}>
                    {admin.number.replace('62', '0').replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3')}
                  </span>
                </div>
                <span style={styles.waIcon}>💬</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Floating WhatsApp Button */}
      <button
        onClick={handleClick}
        style={{
          ...styles.button,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          boxShadow: isHovered 
            ? '0 8px 25px rgba(37, 211, 102, 0.5)' 
            : '0 4px 15px rgba(37, 211, 102, 0.4)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          fill="white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {/* Tooltip */}
      <div style={{
        ...styles.tooltip,
        opacity: isHovered && !showMenu ? 1 : 0,
        transform: isHovered && !showMenu ? 'translateX(0)' : 'translateX(10px)',
      }}>
        Chat dengan Admin
      </div>

      {/* Pulse Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 9997,
  },
  menu: {
    position: 'fixed',
    bottom: '94px',
    right: '24px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    zIndex: 9999,
    overflow: 'hidden',
    minWidth: '240px',
  },
  menuHeader: {
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 18px',
    background: 'white',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
  },
  adminIcon: {
    fontSize: '1.25rem',
  },
  adminInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  adminName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '0.95rem',
  },
  adminNumber: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  waIcon: {
    fontSize: '1.25rem',
  },
  button: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 9999,
    transition: 'all 0.3s ease',
    animation: 'pulse 2s infinite',
    textDecoration: 'none',
    border: 'none',
  },
  tooltip: {
    position: 'fixed',
    bottom: '38px',
    right: '95px',
    background: '#1e3a5f',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    zIndex: 9998,
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
  },
};
