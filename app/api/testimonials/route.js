import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Testimonial from '@/lib/models/Testimonial';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';

// GET - Fetch approved testimonials (public)
export async function GET() {
  try {
    await connectDB();
    
    const testimonials = await Testimonial.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST - Submit testimonial (authenticated users only)
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { bookingId, name, role, text, rating } = body;

    // Validate required fields
    if (!bookingId || !name || !text || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId: user._id,
      paymentStatus: 'paid'
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Valid completed booking not found' },
        { status: 404 }
      );
    }

    // Check if testimonial already exists for this booking
    const existingTestimonial = await Testimonial.findOne({ bookingId });
    if (existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial already submitted for this booking' },
        { status: 400 }
      );
    }

    // Create testimonial
    const testimonial = await Testimonial.create({
      userId: user._id,
      bookingId,
      name,
      role: role || 'Pelanggan',
      text,
      rating,
      isApproved: false,
    });

    return NextResponse.json(
      { success: true, data: testimonial },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}
