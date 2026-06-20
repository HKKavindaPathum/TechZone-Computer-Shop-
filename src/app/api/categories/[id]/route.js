import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

// PUT update category (Admin only)
export async function PUT(request, { params }) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { category_name, description } = body;

    if (!category_name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    await prisma.category.update({
      where: { category_id: parseInt(id) },
      data: {
        category_name,
        description
      }
    });

    return NextResponse.json({ message: '✅ Category updated' });

  } catch (err) {
    console.error('PUT Category Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

// DELETE category (Admin only)
export async function DELETE(request, { params }) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id);

    // Check if category has associated products
    const productsCount = await prisma.product.count({
      where: { category_id: categoryId }
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category because it contains associated products. Please delete or reassign the products first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { category_id: categoryId }
    });

    return NextResponse.json({ message: '✅ Category deleted' });

  } catch (err) {
    console.error('DELETE Category Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
