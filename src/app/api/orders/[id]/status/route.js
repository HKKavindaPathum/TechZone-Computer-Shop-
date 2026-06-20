import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

export async function PUT(request, { params }) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // Update order status in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { order_id: orderId },
        data: { status }
      });

      // If marked as delivered, complete payment status
      if (status === 'delivered') {
        await tx.payment.updateMany({
          where: { order_id: orderId },
          data: { payment_status: 'completed' }
        });
      }
    });

    return NextResponse.json({ message: '✅ Order status updated' });

  } catch (err) {
    console.error('PUT Order Status Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
