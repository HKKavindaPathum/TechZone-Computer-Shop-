import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyAdmin } from '@/lib/apiAuth';

// POST upload image (Admin only)
export async function POST(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using stream
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'computer-shop',
          transformation: [{ width: 800, height: 800, crop: 'limit' }],
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      message: '✅ Image uploaded successfully',
      url: uploadResponse.secure_url
    });

  } catch (err) {
    console.error('POST Upload Error:', err);
    return NextResponse.json({ message: '❌ Upload failed', error: err.message }, { status: 500 });
  }
}

// DELETE image from Cloudinary (Admin only)
export async function DELETE(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const body = await request.json();
    const { public_id } = body;

    if (!public_id) {
      return NextResponse.json({ message: 'public_id is required' }, { status: 400 });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ message: '✅ Image deleted' });

  } catch (err) {
    console.error('DELETE Image Error:', err);
    return NextResponse.json({ message: '❌ Delete failed', error: err.message }, { status: 500 });
  }
}
