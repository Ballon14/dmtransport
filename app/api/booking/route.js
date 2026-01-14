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
      deliveryOption,
      deliveryAddress,
      rentalDuration, // For mobil: '12h' or '24h'
      rentalZone, // For motor: 'inCity' or 'outCity'
    } = body;

    // Validate required fields
    if (!vehicleId || !customerName || !customerPhone || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate delivery address if delivery option is selected
    if (deliveryOption === 'delivery' && !deliveryAddress) {
      return NextResponse.json(
        { success: false, error: 'Alamat pengantaran harus diisi' },
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
    
    const isMobil = vehicle.type === 'mobil';
    let rentalUnits;
    let unitPrice;
    let priceUnit;
    
    if (isMobil) {
      // For mobil: calculate based on selected duration (12h or 24h)
      if (rentalDuration === '12h') {
        rentalUnits = totalDays * 2; // 2 x 12-hour periods per day
        unitPrice = vehicle.price12h || 0;
        priceUnit = '12 jam';
      } else {
        rentalUnits = totalDays; // 1 x 24-hour period per day
        unitPrice = vehicle.price24h || 0;
        priceUnit = '24 jam';
      }
    } else {
      // For motor: calculate based on zone (inCity or outCity)
      rentalUnits = totalDays;
      if (rentalZone === 'outCity') {
        unitPrice = vehicle.priceOutCity || 0;
        priceUnit = 'hari (luar kota)';
      } else {
        unitPrice = vehicle.priceInCity || 0;
        priceUnit = 'hari (dalam kota)';
      }
    }
    
    // Delivery cost: Rp 50.000 for delivery option
    const deliveryCost = deliveryOption === 'delivery' ? 50000 : 0;
    const rentalPrice = rentalUnits * unitPrice;
    const totalPrice = rentalPrice + deliveryCost;

    // Create booking
    const booking = await Booking.create({
      userId: user._id,
      userEmail: clerkUser?.emailAddresses?.[0]?.emailAddress || user.email,
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.type,
      vehicleImage: vehicle.image || '',
      customerName,
      customerPhone,
      customerAddress: customerAddress || '',
      startDate: start,
      endDate: end,
      totalDays,
      rentalUnits, // Number of rental units
      priceUnit, // Unit label for display ('12 jam', '24 jam', or 'hari')
      pricePerDay: unitPrice, // Price per rental unit
      deliveryOption: deliveryOption || 'self_pickup',
      deliveryCost,
      deliveryAddress: deliveryAddress || '',
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
