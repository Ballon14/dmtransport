import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

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

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get vehicle type prefix from form data (optional)
    const vehicleType = formData.get('type') || 'vehicle';
    const sanitizedType = vehicleType.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Generate descriptive filename with type prefix
    const ext = file.name.split('.').pop();
    const filename = `${sanitizedType}-${Date.now()}.${ext}`;
    
    // Define upload directory path
    // Lokasi: public/vehicles/ (dapat diakses langsung dari browser sebagai /vehicles/*)
    const uploadDir = path.join(process.cwd(), 'public', 'vehicles');
    await mkdir(uploadDir, { recursive: true });
    
    // Save file to disk
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL and path info
    // Use API route for serving images (works on all server configurations)
    const imageUrl = `/api/images/vehicles/${filename}`;

    console.log(`📁 Image uploaded: ${filepath}`);
    console.log(`🔗 Public URL: ${imageUrl}`);

    return NextResponse.json({ 
      success: true, 
      data: { 
        url: imageUrl,
        filename: filename,
        storagePath: 'public/vehicles/',
        info: 'Gambar disimpan di folder public/vehicles/ dan dapat diakses lewat URL'
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
