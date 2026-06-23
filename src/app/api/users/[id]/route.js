import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/apiAuth';

export async function PUT(request, { params }) {
  try {
    // Verify admin
    let authUser;
    try {
      authUser = verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { role, is_blocked } = body;

    const dataToUpdate = {};

    if (role !== undefined) {
      if (role !== 'admin' && role !== 'customer') {
        return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
      }
      dataToUpdate.role = role;
    }

    if (is_blocked !== undefined) {
      if (typeof is_blocked !== 'boolean') {
        return NextResponse.json({ message: 'is_blocked must be a boolean' }, { status: 400 });
      }
      // Prevent admin from blocking themselves
      if (is_blocked && authUser.userId === userId) {
        return NextResponse.json({ message: 'Cannot block yourself' }, { status: 400 });
      }
      dataToUpdate.is_blocked = is_blocked;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'Nothing to update' }, { status: 400 });
    }

    await prisma.user.update({
      where: { user_id: userId },
      data: dataToUpdate
    });

    return NextResponse.json({ message: '✅ User updated successfully!' });

  } catch (err) {
    console.error('PUT User Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify admin
    let authUser;
    try {
      authUser = verifyAdmin(request);
    } catch (authErr) {
      return NextResponse.json({ message: authErr.message }, { status: authErr.message.includes('Forbidden') ? 403 : 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Prevent admin from deleting themselves
    if (authUser.userId === userId) {
      return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { user_id: userId }
    });

    return NextResponse.json({ message: '✅ User deleted successfully!' });

  } catch (err) {
    console.error('DELETE User Error:', err);
    return NextResponse.json({ message: '❌ Server error', error: err.message }, { status: 500 });
  }
}
