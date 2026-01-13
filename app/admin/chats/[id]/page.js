'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id;
  
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMessageTimeRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update lastMessageTimeRef when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.isTemp && lastMsg.createdAt) {
        lastMessageTimeRef.current = lastMsg.createdAt;
      }
    }
  }, [messages]);

  useEffect(() => {
    fetchSession();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId]);

  // Separate effect for polling
  useEffect(() => {
    if (!session || session.status === 'closed') return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const after = lastMessageTimeRef.current || '';
        const res = await fetch(`/api/chat/messages?sessionId=${sessionId}&after=${after}`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
          setMessages(prev => {
            // Filter out duplicates based on _id
            const existingIds = new Set(prev.map(m => m._id));
            const newMessages = data.data.filter(m => !existingIds.has(m._id));
            
            if (newMessages.length > 0) {
              return [...prev, ...newMessages];
            }
            return prev;
          });
        }
        
        // Check if chat was closed
        if (data.session?.status === 'closed') {
          setSession(prev => ({ ...prev, status: 'closed' }));
          clearInterval(pollIntervalRef.current);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [session?.status, sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      const data = await res.json();
      
      if (data.success) {
        setSession(data.data.session);
        setMessages(data.data.messages);
      } else {
        router.push('/admin/chats');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      router.push('/admin/chats');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    // Optimistic update
    const tempMessage = {
      _id: Date.now().toString(),
      sessionId,
      sender: 'admin',
      message: messageText,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageText,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => prev.map(m => 
          m._id === tempMessage._id ? data.data : m
        ));
      } else {
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
        alert(data.error || 'Gagal mengirim pesan');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!confirm('Apakah Anda yakin ingin menutup chat ini?')) return;
    
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSession(prev => ({ ...prev, status: 'closed' }));
        clearInterval(pollIntervalRef.current);
      } else {
        alert(data.error || 'Gagal menutup chat');
      }
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Memuat percakapan...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/admin/chats" style={styles.backButton}>
          ← Kembali
        </Link>
        
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>
            {session?.guestName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 style={styles.customerName}>
              {session?.guestName || 'User #' + session?._id?.slice(-6)}
            </h1>
            <p style={styles.customerEmail}>{session?.guestEmail || 'Tanpa email'}</p>
          </div>
        </div>
        
        <div style={styles.headerActions}>
          <span style={{
            ...styles.statusBadge,
            ...(session?.status === 'active' ? styles.statusActive : styles.statusClosed),
          }}>
            {session?.status === 'active' ? 'Aktif' : 'Ditutup'}
          </span>
          
          {session?.status === 'active' && (
            <button onClick={closeChat} style={styles.closeButton}>
              Tutup Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        <div style={styles.dateHeader}>
          {formatDate(session?.createdAt)}
        </div>

        {messages.map((msg) => (
          <div
            key={msg._id}
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.message,
                ...(msg.sender === 'admin' ? styles.adminMessage : styles.customerMessage),
                opacity: msg.isTemp ? 0.7 : 1,
              }}
            >
              <span style={styles.senderLabel}>
                {msg.sender === 'admin' ? 'Admin' : session?.guestName || 'Customer'}
              </span>
              <p style={styles.messageText}>{msg.message}</p>
              <span style={styles.messageTime}>{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {session?.status === 'active' ? (
        <form onSubmit={sendMessage} style={styles.inputArea}>
          <input
            type="text"
            placeholder="Ketik balasan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={styles.input}
          />
          <button 
            type="submit" 
            disabled={sending || !newMessage.trim()}
            style={{
              ...styles.sendButton,
              opacity: sending || !newMessage.trim() ? 0.5 : 1,
            }}
          >
            {sending ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>
      ) : (
        <div style={styles.closedBanner}>
          Chat ini sudah ditutup pada {formatDate(session?.updatedAt)}
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
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 140px)',
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  backButton: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  customerName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  customerEmail: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
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
  closeButton: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#f8fafc',
  },
  dateHeader: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: '8px 0',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    position: 'relative',
  },
  adminMessage: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  customerMessage: {
    background: 'white',
    color: '#1e293b',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  senderLabel: {
    display: 'block',
    fontSize: '0.7rem',
    opacity: 0.7,
    marginBottom: '4px',
    fontWeight: '500',
  },
  messageText: {
    margin: 0,
    fontSize: '0.95rem',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.6,
    display: 'block',
    marginTop: '6px',
    textAlign: 'right',
  },
  inputArea: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    background: 'white',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  closedBanner: {
    padding: '16px',
    background: '#fef3c7',
    color: '#92400e',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
};
