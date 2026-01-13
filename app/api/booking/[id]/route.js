import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import { createTransaction } from '@/lib/midtrans';

// GET - Get booking detail
export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const booking = await Booking.findById(id).lean();
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check ownership (user can only see their own bookings unless admin)
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && booking.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT - Update booking (e.g., regenerate payment token)
export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    await connectDB();
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check ownership
    const user = await User.findOne({ clerkId: userId });
    if (user.role !== 'admin' && booking.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Handle different actions
    if (action === 'regenerate_payment') {
      // Regenerate Midtrans token for pending bookings
      if (booking.paymentStatus !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Cannot regenerate payment for non-pending booking' },
          { status: 400 }
        );
      }

      // Generate new orderId
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      booking.orderId = `DMT-${timestamp}-${random}`;
      
      const midtransResult = await createTransaction(booking);
      
      if (midtransResult.success) {
        booking.snapToken = midtransResult.token;
        booking.snapRedirectUrl = midtransResult.redirect_url;
        await booking.save();
        
        return NextResponse.json({
          success: true,
          data: {
            booking: booking.toObject(),
            payment: {
              token: midtransResult.token,
              redirect_url: midtransResult.redirect_url,
            },
          },
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to create payment' },
          { status: 500 }
        );
      }
    }

    // Admin actions
    if (user.role === 'admin') {
      if (body.status) {
        booking.status = body.status;
      }
      if (body.paymentStatus) {
        booking.paymentStatus = body.paymentStatus;
      }
      await booking.save();
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking
export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check ownership
    const user = await User.findOne({ clerkId: userId });
    if (user.role !== 'admin' && booking.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Can only cancel pending bookings
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel paid booking' },
        { status: 400 }
      );
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'failed';
    await booking.save();

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
