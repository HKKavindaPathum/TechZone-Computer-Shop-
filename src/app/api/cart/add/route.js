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
    const { product_id, quantity } = body;
    const userId = user.userId;

    if (!product_id || !quantity) {
      return NextResponse.json({ message: 'Product ID and quantity are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({ message: 'Not enough stock' }, { status: 400 });
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

    // Check if item exists in cart
    const existing = await prisma.cartItem.findFirst({
      where: { cart_id: cart.cart_id, product_id: parseInt(product_id) }
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { cart_item_id: existing.cart_item_id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.cart_id,
          product_id: parseInt(product_id),
          quantity
        }
      });
    }

    return NextResponse.json({ message: '✅ Item added to cart' });

  } catch (err) {
    console.error('POST Add to Cart Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
