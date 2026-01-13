import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Vehicle from '@/lib/models/Vehicle';
import User from '@/lib/models/User';
import { createTransaction } from '@/lib/midtrans';

// GET - List user's bookings
export async function GET(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get bookings
    const bookings = await Booking.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create new booking
export async function POST(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    const body = await req.json();
    
    const {
      vehicleId,
      customerName,
      customerPhone,
      customerAddress,
      startDate,
      endDate,
      notes,
    } = body;

    // Validate required fields
    if (!vehicleId || !customerName || !customerPhone || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check vehicle availability
    if (!vehicle.available) {
      return NextResponse.json(
        { success: false, error: 'Vehicle is not available' },
        { status: 400 }
      );
    }

    // Calculate days and price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = totalDays * vehicle.price;

    // Create booking
    const booking = await Booking.create({
      userId: user._id,
      userEmail: clerkUser?.emailAddresses?.[0]?.emailAddress || user.email,
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.type,
      customerName,
      customerPhone,
      customerAddress: customerAddress || '',
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay: vehicle.price,
      totalPrice,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Create Midtrans transaction
    const midtransResult = await createTransaction(booking);
    
    if (midtransResult.success) {
      booking.snapToken = midtransResult.token;
      booking.snapRedirectUrl = midtransResult.redirect_url;
      await booking.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: booking.toObject(),
        payment: midtransResult.success ? {
          token: midtransResult.token,
          redirect_url: midtransResult.redirect_url,
        } : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
