import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import ChatSession from '@/lib/models/ChatSession';
import ChatMessage from '@/lib/models/ChatMessage';
import User from '@/lib/models/User';

// GET - Detail sesi chat + pesan
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    await connectDB();
    
    const session = await ChatSession.findById(id).lean();
    
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
    
    // Customer hanya bisa akses sesi mereka
    if (!isAdmin && session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 });
    }
    
    // Ambil semua pesan
    const messages = await ChatMessage.find({ sessionId: id })
      .sort({ createdAt: 1 })
      .lean();
    
    // Jika admin membuka, mark messages as read
    if (isAdmin) {
      await ChatMessage.updateMany(
        { sessionId: id, sender: 'customer', isRead: false },
        { isRead: true }
      );
      await ChatSession.findByIdAndUpdate(id, { unreadCount: 0 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        session,
        messages,
      },
    });
    
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil data chat',
    }, { status: 500 });
  }
}

// PATCH - Update status sesi
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Cek admin
    const user = await User.findOne({ clerkId: userId });
    if (user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Hanya admin yang bisa mengubah status chat',
      }, { status: 403 });
    }
    
    const session = await ChatSession.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Sesi chat tidak ditemukan',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: session,
    });
    
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengubah status chat',
    }, { status: 500 });
  }
}
