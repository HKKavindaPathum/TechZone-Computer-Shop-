import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    // Verify admin
    try {
      verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        is_blocked: true
      },
      orderBy: { user_id: 'asc' }
    });

    return NextResponse.json(users);

  } catch (err) {
    console.error('GET Users Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
