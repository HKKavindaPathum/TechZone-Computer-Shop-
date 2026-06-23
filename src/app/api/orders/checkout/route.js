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
    const { shipping_address, payment_method } = body;
    const userId = user.userId;

    if (!shipping_address) {
      return NextResponse.json({ message: 'Shipping address is required' }, { status: 400 });
    }

    // Check if user is blocked
    const dbUser = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { is_blocked: true }
    });
    if (dbUser?.is_blocked) {
      return NextResponse.json({ message: 'Your account has been blocked. Please contact support.' }, { status: 403 });
    }

    // Run interactive transaction in PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Get user cart
      const cart = await tx.cart.findFirst({
        where: { user_id: userId }
      });

      if (!cart) {
        throw new Error('Cart is empty');
      }

      // 2. Get cart items
      const items = await tx.cartItem.findMany({
        where: { cart_id: cart.cart_id },
        include: { product: true }
      });

      if (items.length === 0) {
        throw new Error('Cart is empty');
      }

      // 3. Check stock quantities
      for (const item of items) {
        if (item.product.stock_quantity < item.quantity) {
          throw new Error(`Not enough stock for ${item.product.product_name}`);
        }
      }

      // 4. Calculate total amount
      const totalAmount = items.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          user_id: userId,
          total_amount: totalAmount,
          shipping_address,
          status: 'pending'
        }
      });

      // 6. Create OrderItem records + Reduce product stocks
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: parseFloat(item.product.price)
          }
        });

        await tx.product.update({
          where: { product_id: item.product_id },
          data: {
            stock_quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // 7. Create Payment
      await tx.payment.create({
        data: {
          order_id: order.order_id,
          payment_method,
          amount: totalAmount,
          payment_status: 'pending'
        }
      });

      // 8. Clear Cart Items
      await tx.cartItem.deleteMany({
        where: { cart_id: cart.cart_id }
      });

      return {
        orderId: order.order_id,
        totalAmount
      };
    });

    return NextResponse.json({
      message: '✅ Order placed successfully',
      orderId: result.orderId,
      totalAmount: result.totalAmount
    }, { status: 201 });

  } catch (err) {
    console.error('Checkout API Transaction Error:', err);
    return NextResponse.json(
      { message: '❌ Checkout failed', error: err.message },
      { status: err.message?.includes('stock') || err.message?.includes('empty') ? 400 : 500 }
    );
  }
}
