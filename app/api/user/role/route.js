import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Get admin emails from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// GET - Get current user's role
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user email from Clerk
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';

    await connectDB();
    
    // First try to find by clerkId
    let user = await User.findOne({ clerkId: userId });
    
    // If not found, try to find by email and update clerkId
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Update clerkId to match the actual Clerk user
        user.clerkId = userId;
        await user.save();
        console.log(`✅ Updated clerkId for user: ${email}`);
      }
    }
    
    // If still not found, create new user
    if (!user && email) {
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      user = await User.create({
        clerkId: userId,
        email: email,
        name: clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : '',
        imageUrl: clerkUser?.imageUrl || '',
        role: isAdmin ? 'admin' : 'customer',
      });
      console.log(`✅ Created user: ${email} (role: ${isAdmin ? 'admin' : 'customer'})`);
    }
    
    if (!user) {
      // Check if email is in admin list even without DB record
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      return NextResponse.json({ 
        success: true, 
        data: { 
          role: isAdmin ? 'admin' : 'customer',
          exists: false 
        } 
      });
    }

    // Double-check: if user email is in ADMIN_EMAILS but role is not admin, update it
    if (ADMIN_EMAILS.includes(email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log(`✅ Updated role to admin for: ${email}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        role: user.role,
        exists: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      } 
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
