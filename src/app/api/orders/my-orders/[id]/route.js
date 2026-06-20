import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/apiAuth';

// GET specific order details
export async function GET(request, { params }) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const userId = user.userId;

    // Get order and check ownership
    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        payments: {
          select: { payment_method: true, payment_status: true }
        }
      }
    });

    if (!order || order.user_id !== userId) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Get order items
    const items = await prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: {
        product: {
          select: { product_name: true, brand: true, image_url: true }
        }
      }
    });

    // Format output
    const formattedOrder = {
      order_id: order.order_id,
      user_id: order.user_id,
      order_date: order.order_date,
      total_amount: parseFloat(order.total_amount),
      status: order.status,
      shipping_address: order.shipping_address,
      payment_method: order.payments[0]?.payment_method || null,
      payment_status: order.payments[0]?.payment_status || null
    };

    const formattedItems = items.map(item => ({
      order_item_id: item.order_item_id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      product_name: item.product.product_name,
      brand: item.product.brand,
      image_url: item.product.image_url
    }));

    return NextResponse.json({ order: formattedOrder, items: formattedItems });

  } catch (err) {
    console.error('GET Order Details Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
