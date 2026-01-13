import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import ChatSession from '@/lib/models/ChatSession';
import ChatMessage from '@/lib/models/ChatMessage';
import User from '@/lib/models/User';

// GET - List semua chat sessions (untuk admin)
export async function GET(request) {
  try {
    const { userId } = await auth();
    
    await connectDB();
    
    // Cek apakah admin
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user?.role === 'admin') {
        // Admin bisa lihat semua sesi
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        
        const filter = {};
        if (status) filter.status = status;
        
        const sessions = await ChatSession.find(filter)
          .sort({ updatedAt: -1 })
          .lean();
        
        return NextResponse.json({
          success: true,
          data: sessions,
        });
      }
    }
    
    // Customer hanya bisa lihat sesi mereka sendiri
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: sessions,
    });
    
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil data chat',
    }, { status: 500 });
  }
}

// POST - Buat sesi chat baru
export async function POST(request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { guestName, guestEmail, message } = body;
    
    await connectDB();
    
    // Cek apakah user sudah punya sesi aktif
    let session;
    if (userId) {
      session = await ChatSession.findOne({ userId, status: 'active' });
    }
    
    // Jika belum ada sesi aktif, buat baru
    if (!session) {
      session = await ChatSession.create({
        userId: userId || null,
        guestName: guestName || '',
        guestEmail: guestEmail || '',
        status: 'active',
        lastMessage: message || '',
        unreadCount: 1,
      });
    }
    
    // Buat pesan pertama jika ada
    if (message) {
      await ChatMessage.create({
        sessionId: session._id,
        sender: 'customer',
        message,
        isRead: false,
      });
      
      // Update last message
      session.lastMessage = message;
      session.unreadCount = (session.unreadCount || 0) + 1;
      await session.save();
    }
    
    return NextResponse.json({
      success: true,
      data: session,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal membuat sesi chat',
    }, { status: 500 });
  }
}
