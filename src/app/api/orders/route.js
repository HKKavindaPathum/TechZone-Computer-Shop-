import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

// GET all orders (Admin only)
export async function GET(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        payments: {
          select: { payment_method: true, payment_status: true }
        },
        items: {
          include: {
            product: {
              select: { product_name: true, brand: true, image_url: true }
            }
          }
        }
      },
      orderBy: { order_date: 'desc' }
    });

    // Format output to match client expectation
    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      user_id: order.user_id,
      order_date: order.order_date,
      total_amount: parseFloat(order.total_amount),
      status: order.status,
      shipping_address: order.shipping_address,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone || 'N/A',
      payment_method: order.payments[0]?.payment_method || null,
      payment_status: order.payments[0]?.payment_status || null,
      items: order.items.map(item => ({
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        product_name: item.product?.product_name || 'Unknown Product',
        brand: item.product?.brand || '',
        image_url: item.product?.image_url || null
      }))
    }));

    return NextResponse.json(formattedOrders);

  } catch (err) {
    console.error('GET All Orders Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
