import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/apiAuth';

export async function POST(request) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;
    const userId = user.userId;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Nothing to sync' });
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { user_id: userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId }
      });
    }

    // Sync items
    for (const item of items) {
      const productId = parseInt(item.productId);
      const qty = parseInt(item.qty);

      if (!productId || !qty) continue;

      const existing = await prisma.cartItem.findFirst({
        where: {
          cart_id: cart.cart_id,
          product_id: productId
        }
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { cart_item_id: existing.cart_item_id },
          data: { quantity: existing.quantity + qty }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cart_id: cart.cart_id,
            product_id: productId,
            quantity: qty
          }
        });
      }
    }

    return NextResponse.json({ message: '✅ Cart synced successfully' });

  } catch (err) {
    console.error('POST Sync Cart Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
