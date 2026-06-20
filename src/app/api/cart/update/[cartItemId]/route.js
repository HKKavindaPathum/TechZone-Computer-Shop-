import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/apiAuth';

export async function PUT(request, { params }) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const { cartItemId } = await params;
    const body = await request.json();
    const { quantity } = body;
    const userId = user.userId;

    if (quantity === undefined || quantity < 1) {
      return NextResponse.json({ message: 'Quantity must be at least 1' }, { status: 400 });
    }

    // Find and verify cart item ownership
    const item = await prisma.cartItem.findUnique({
      where: { cart_item_id: parseInt(cartItemId) },
      include: {
        cart: true
      }
    });

    if (!item || item.cart.user_id !== userId) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: { cart_item_id: parseInt(cartItemId) },
      data: { quantity: parseInt(quantity) }
    });

    return NextResponse.json({ message: '✅ Cart item updated' });

  } catch (err) {
    console.error('PUT CartItem Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
