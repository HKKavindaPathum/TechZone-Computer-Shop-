import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/apiAuth';

// GET customer orders
export async function GET(request) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const userId = user.userId;

    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      include: {
        payments: {
          select: { payment_method: true, payment_status: true }
        }
      },
      orderBy: { order_date: 'desc' }
    });

    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      user_id: order.user_id,
      order_date: order.order_date,
      total_amount: parseFloat(order.total_amount),
      status: order.status,
      shipping_address: order.shipping_address,
      payment_method: order.payments[0]?.payment_method || null,
      payment_status: order.payments[0]?.payment_status || null
    }));

    return NextResponse.json(formattedOrders);

  } catch (err) {
    console.error('GET My Orders Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
