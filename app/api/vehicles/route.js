import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Vehicle from '@/lib/models/Vehicle';
import User from '@/lib/models/User';

// GET - List all vehicles (public)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'mobil' or 'motor'
    const category = searchParams.get('category'); // 'mobil' or 'motor'
    
    // Support both 'type' and 'category' params for filtering
    const filterValue = type || category;
    const query = filterValue ? { type: filterValue } : {};
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST - Create new vehicle (admin only)
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

    // Check if user is admin
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const vehicle = await Vehicle.create(body);

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
