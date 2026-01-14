import { NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

// Map file extensions to MIME types
const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function GET(request, { params }) {
  try {
    // Get the path from params - it's an array due to [...path]
    // In Next.js 15, params is a Promise and must be awaited
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No path provided' },
        { status: 400 }
      );
    }

    // Join path segments and sanitize to prevent directory traversal
    const imagePath = pathSegments.join('/');
    
    // Prevent directory traversal attacks
    if (imagePath.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    // Check if file exists
    try {
      await access(fullPath, constants.R_OK);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Get the file extension and determine MIME type
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Return the image with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}
