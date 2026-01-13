import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import ChatSession from '@/lib/models/ChatSession';
import ChatMessage from '@/lib/models/ChatMessage';
import User from '@/lib/models/User';

// POST - Kirim pesan baru
export async function POST(request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { sessionId, message } = body;
    
    if (!sessionId || !message) {
      return NextResponse.json({
        success: false,
        error: 'Session ID dan pesan harus diisi',
      }, { status: 400 });
    }
    
    await connectDB();
    
    const session = await ChatSession.findById(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Sesi chat tidak ditemukan',
      }, { status: 404 });
    }
    
    if (session.status === 'closed') {
      return NextResponse.json({
        success: false,
        error: 'Sesi chat sudah ditutup',
      }, { status: 400 });
    }
    
    // Tentukan sender
    let sender = 'customer';
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user?.role === 'admin') {
        sender = 'admin';
      }
    }
    
    // Cek akses customer
    if (sender === 'customer' && session.userId && session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 });
    }
    
    // Buat pesan
    const newMessage = await ChatMessage.create({
      sessionId,
      sender,
      message,
      isRead: sender === 'admin', // Pesan admin langsung dibaca
    });
    
    // Update session
    session.lastMessage = message;
    if (sender === 'customer') {
      session.unreadCount = (session.unreadCount || 0) + 1;
    }
    await session.save();
    
    return NextResponse.json({
      success: true,
      data: newMessage,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengirim pesan',
    }, { status: 500 });
  }
}

// GET - Ambil pesan baru (untuk polling)
export async function GET(request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const after = searchParams.get('after'); // Timestamp untuk polling
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID harus diisi',
      }, { status: 400 });
    }
    
    await connectDB();
    
    const session = await ChatSession.findById(sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Sesi chat tidak ditemukan',
      }, { status: 404 });
    }
    
    // Cek akses
    let isAdmin = false;
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      isAdmin = user?.role === 'admin';
    }
    
    if (!isAdmin && session.userId && session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 });
    }
    
    // Query pesan
    const filter = { sessionId };
    if (after) {
      filter.createdAt = { $gt: new Date(after) };
    }
    
    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: 1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: messages,
      session: {
        status: session.status,
      },
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil pesan',
    }, { status: 500 });
  }
}
