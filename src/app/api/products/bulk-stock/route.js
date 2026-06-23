import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

export async function PUT(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json(
        { message: authErr.message },
        { status: authErr.message.includes('Forbidden') ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { message: 'Invalid updates payload. Expected updates array.' },
        { status: 400 }
      );
    }

    // Validate inputs
    for (const update of updates) {
      const { product_id, stock_quantity } = update;
      if (product_id === undefined || stock_quantity === undefined) {
        return NextResponse.json(
          { message: 'Each update must contain product_id and stock_quantity' },
          { status: 400 }
        );
      }
      if (isNaN(parseInt(product_id)) || isNaN(parseInt(stock_quantity))) {
        return NextResponse.json(
          { message: 'product_id and stock_quantity must be valid integers' },
          { status: 400 }
        );
      }
      if (parseInt(stock_quantity) < 0) {
        return NextResponse.json(
          { message: 'Stock quantity cannot be negative' },
          { status: 400 }
        );
      }
    }

    // Execute bulk update using a Prisma transaction
    const updatePromises = updates.map(update => {
      const { product_id, stock_quantity } = update;
      return prisma.product.update({
        where: { product_id: parseInt(product_id) },
        data: { stock_quantity: parseInt(stock_quantity) }
      });
    });

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ message: '✅ Bulk stock updated successfully!' });

  } catch (err) {
    console.error('PUT Bulk Stock Error:', err);
    return NextResponse.json(
      { message: '❌ Server error', error: err.message },
      { status: 500 }
    );
  }
}
