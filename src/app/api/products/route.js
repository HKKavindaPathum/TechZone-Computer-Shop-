import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

// GET all products (Public)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { category_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Map database output to match original API property category_name
    const formattedProducts = products.map(p => ({
      ...p,
      category_name: p.category?.category_name || null,
      price: parseFloat(p.price) // Convert Decimal to float
    }));

    return NextResponse.json(formattedProducts);

  } catch (err) {
    console.error('GET Products Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

// POST create product (Admin only)
export async function POST(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const body = await request.json();
    const { product_name, brand, description, price, stock_quantity, image_url, category_id } = body;

    if (!product_name || price === undefined) {
      return NextResponse.json({ message: 'Product name and price are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
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

    return NextResponse.json(
      { message: '✅ Product created', productId: product.product_id },
      { status: 201 }
    );

  } catch (err) {
    console.error('POST Product Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
