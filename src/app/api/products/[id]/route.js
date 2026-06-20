import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { verifyAdmin } from '@/lib/apiAuth';

// Helper to extract Cloudinary public_id from imageUrl
const getPublicId = (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const folderAndFile = urlParts.slice(-2).join('/');
    return folderAndFile.split('.')[0];
  } catch {
    return null;
  }
};

// GET specific product by ID (Public)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        category: {
          select: { category_name: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const formattedProduct = {
      ...product,
      category_name: product.category?.category_name || null,
      price: parseFloat(product.price)
    };

    return NextResponse.json(formattedProduct);

  } catch (err) {
    console.error('GET Product Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

// PUT update product (Admin only)
export async function PUT(request, { params }) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const { product_name, brand, description, price, stock_quantity, image_url, category_id } = body;

    // Fetch old product details to check for image changes
    const oldProduct = await prisma.product.findUnique({
      where: { product_id: productId }
    });

    if (!oldProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Delete old image from Cloudinary if updated
    if (oldProduct.image_url && image_url && oldProduct.image_url !== image_url) {
      try {
        const public_id = getPublicId(oldProduct.image_url);
        if (public_id && oldProduct.image_url.includes('cloudinary.com')) {
          await cloudinary.uploader.destroy(public_id);
          console.log('✅ Old Cloudinary image deleted:', public_id);
        }
      } catch (cloudErr) {
        console.error('⚠️ Cloudinary delete failed:', cloudErr.message);
      }
    }

    await prisma.product.update({
      where: { product_id: productId },
      data: {
        product_name,
        brand,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity || 0),
        image_url,
        category_id: category_id ? parseInt(category_id) : null
      }
    });

    return NextResponse.json({ message: '✅ Product updated' });

  } catch (err) {
    console.error('PUT Product Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

// DELETE product (Admin only)
export async function DELETE(request, { params }) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);

    const product = await prisma.product.findUnique({
      where: { product_id: productId }
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Check if product is in active customer orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { product_id: productId }
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete product as it is associated with existing customer orders. You can set its stock to 0 to disable purchases instead.' },
        { status: 400 }
      );
    }

    // Delete cart item dependencies
    await prisma.cartItem.deleteMany({
      where: { product_id: productId }
    });

    // Delete Cloudinary image
    if (product.image_url) {
      try {
        const public_id = getPublicId(product.image_url);
        if (public_id && product.image_url.includes('cloudinary.com')) {
          await cloudinary.uploader.destroy(public_id);
          console.log('✅ Cloudinary image deleted:', public_id);
        }
      } catch (cloudErr) {
        console.error('⚠️ Cloudinary delete failed:', cloudErr.message);
      }
    }

    // Delete product from PostgreSQL
    await prisma.product.delete({
      where: { product_id: productId }
    });

    return NextResponse.json({ message: '✅ Product deleted' });

  } catch (err) {
    console.error('DELETE Product Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
