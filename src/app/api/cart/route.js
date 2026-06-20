import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/apiAuth';

// GET cart for authenticated user
export async function GET(request) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const userId = user.userId;

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { user_id: userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId }
      });
    }

    // Get cart items with product details
    const items = await prisma.cartItem.findMany({
      where: { cart_id: cart.cart_id },
      include: {
        product: true
      }
    });

    // Format items to match client expectation and calculate total
    const formattedItems = items.map(item => ({
      cart_item_id: item.cart_item_id,
      quantity: item.quantity,
      product_id: item.product.product_id,
      product_name: item.product.product_name,
      brand: item.product.brand,
      price: parseFloat(item.product.price),
      image_url: item.product.image_url,
      subtotal: item.quantity * parseFloat(item.product.price)
    }));

    const total = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({ cart, items: formattedItems, total });

  } catch (err) {
    console.error('GET Cart Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

// DELETE clear cart
export async function DELETE(request) {
  try {
    let user;
    try {
      user = verifyAuth(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: 401 });
    }

    const userId = user.userId;

    const cart = await prisma.cart.findFirst({
      where: { user_id: userId }
    });

    if (!cart) {
      return NextResponse.json({ message: 'Cart is already empty' });
    }

    await prisma.cartItem.deleteMany({
      where: { cart_id: cart.cart_id }
    });

    return NextResponse.json({ message: '✅ Cart cleared' });

  } catch (err) {
    console.error('DELETE Cart Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
