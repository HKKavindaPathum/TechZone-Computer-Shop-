import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/apiAuth';

export async function DELETE(request, { params }) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const { cartItemId } = await params;
    const userId = user.userId;

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

    await prisma.cartItem.delete({
      where: { cart_item_id: parseInt(cartItemId) }
    });

    return NextResponse.json({ message: '✅ Item removed from cart' });

  } catch (err) {
    console.error('DELETE CartItem Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
