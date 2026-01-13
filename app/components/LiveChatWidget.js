'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function LiveChatWidget() {
  const { isLoaded, userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMessageTimeRef = useRef('');

  // Scroll ke bawah saat ada pesan baru
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

  // Polling untuk pesan baru
  useEffect(() => {
    if (!session || isClosed) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const after = lastMessageTimeRef.current || '';
        const res = await fetch(`/api/chat/messages?sessionId=${session._id}&after=${after}`);
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
        
        if (data.session?.status === 'closed') {
          setIsClosed(true);
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
  }, [session?._id, isClosed]);

  // Cek apakah user sudah punya sesi aktif
  useEffect(() => {
    if (isLoaded && userId && isOpen && !session) {
      checkExistingSession();
    }
  }, [isLoaded, userId, isOpen]);

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      const data = await res.json();
      
      if (data.success && data.data.length > 0) {
        const activeSession = data.data.find(s => s.status === 'active');
        if (activeSession) {
          setSession(activeSession);
          setShowForm(false);
          await loadMessages(activeSession._id);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data.messages || []);
        if (data.data.session.status === 'closed') {
          setIsClosed(true);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startChat = async (e) => {
    e.preventDefault();
    
    if (!userId && !guestName.trim()) {
      alert('Silakan isi nama Anda');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestEmail,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSession(data.data);
        setShowForm(false);
      } else {
        alert(data.error || 'Gagal memulai chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Gagal memulai chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Optimistic update
    const tempMessage = {
      _id: Date.now().toString(),
      sessionId: session._id,
      sender: 'customer',
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
          sessionId: session._id,
          message: messageText,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Replace temp message dengan yang asli
        setMessages(prev => prev.map(m => 
          m._id === tempMessage._id ? data.data : m
        ));
      } else {
        // Hapus temp message jika gagal
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
        alert(data.error || 'Gagal mengirim pesan');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.chatButton,
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
        aria-label="Live Chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
        {!isOpen && session && !isClosed && (
          <span style={styles.badge}>●</span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={styles.chatPanel}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerInfo}>
              <div style={styles.avatar}>💬</div>
              <div>
                <div style={styles.headerTitle}>Live Chat</div>
                <div style={styles.headerSubtitle}>
                  {isClosed ? 'Chat ditutup' : 'Tim support kami siap membantu'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {showForm && !session ? (
              /* Start Chat Form */
              <div style={styles.formContainer}>
                <div style={styles.welcomeText}>
                  <h3 style={styles.welcomeTitle}>Selamat datang! 👋</h3>
                  <p style={styles.welcomeDesc}>
                    Kami siap membantu pertanyaan Anda seputar rental kendaraan.
                  </p>
                </div>
                
                <form onSubmit={startChat} style={styles.form}>
                  {!userId && (
                    <>
                      <input
                        type="text"
                        placeholder="Nama Anda *"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        style={styles.input}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email (opsional)"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        style={styles.input}
                      />
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.startButton,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Memulai...' : 'Mulai Chat'}
                  </button>
                </form>
              </div>
            ) : (
              /* Messages Area */
              <div style={styles.messagesArea}>
                {messages.length === 0 ? (
                  <div style={styles.emptyMessages}>
                    <p>Kirim pesan untuk memulai percakapan</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          ...styles.message,
                          ...(msg.sender === 'customer' ? styles.customerMessage : styles.adminMessage),
                          opacity: msg.isTemp ? 0.7 : 1,
                        }}
                      >
                        <p style={styles.messageText}>{msg.message}</p>
                        <span style={styles.messageTime}>{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {session && !isClosed && (
            <form onSubmit={sendMessage} style={styles.inputArea}>
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={styles.messageInput}
              />
              <button type="submit" style={styles.sendButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
          )}

          {isClosed && (
            <div style={styles.closedBanner}>
              Chat ini sudah ditutup. 
              <button
                onClick={() => {
                  setSession(null);
                  setMessages([]);
                  setShowForm(true);
                  setIsClosed(false);
                }}
                style={styles.newChatButton}
              >
                Mulai chat baru
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  chatButton: {
    position: 'fixed',
    bottom: '100px',
    right: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 9998,
    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)',
    transition: 'all 0.3s ease',
  },
  badge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    color: '#22c55e',
    fontSize: '14px',
  },
  chatPanel: {
    position: 'fixed',
    bottom: '170px',
    right: '24px',
    width: '380px',
    maxWidth: 'calc(100vw - 48px)',
    height: '500px',
    maxHeight: 'calc(100vh - 200px)',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9997,
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: '12px',
    opacity: 0.8,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  formContainer: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  welcomeDesc: {
    fontSize: '14px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  startButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  emptyMessages: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '12px',
    position: 'relative',
  },
  customerMessage: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  adminMessage: {
    background: '#f1f5f9',
    color: '#1e293b',
    borderBottomLeftRadius: '4px',
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '10px',
    opacity: 0.7,
    display: 'block',
    marginTop: '4px',
    textAlign: 'right',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  messageInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  closedBanner: {
    padding: '12px',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '13px',
    textAlign: 'center',
  },
  newChatButton: {
    background: 'transparent',
    border: 'none',
    color: '#1e3a5f',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '13px',
    marginLeft: '4px',
  },
};
