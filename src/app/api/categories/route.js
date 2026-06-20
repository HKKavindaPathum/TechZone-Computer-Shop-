import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

// GET all categories (Public)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { category_name: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error('GET Categories Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

// POST new category (Admin only)
export async function POST(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const body = await request.json();
    const { category_name, description } = body;

    if (!category_name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        category_name,
        description
      }
    });

    return NextResponse.json(
      { message: '✅ Category created', categoryId: category.category_id },
      { status: 201 }
    );

  } catch (err) {
    console.error('POST Category Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
