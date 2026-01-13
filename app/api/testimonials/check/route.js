import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Testimonial from '@/lib/models/Testimonial';
import User from '@/lib/models/User';

// GET - Check if testimonial exists for a booking
export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID required' },
        { status: 400 }
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

    const testimonial = await Testimonial.findOne({ 
      bookingId,
      userId: user._id 
    });
    
    return NextResponse.json({ 
      success: true, 
      exists: !!testimonial,
      testimonial: testimonial || null
    });
  } catch (error) {
    console.error('Error checking testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check testimonial' },
      { status: 500 }
    );
  }
}
