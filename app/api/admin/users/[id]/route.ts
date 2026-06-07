import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key';

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1] || request.cookies.get('token')?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role.toUpperCase() === 'SUPER_ADMIN';
  } catch {
    return false;
  }
}

// PUT: Update user verification status or role profiles
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { verified, role } = body;

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { 
        ...(verified !== undefined && { verified }),
        ...(role && { role })
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user parameters' }, { status: 500 });
  }
}

// DELETE: Purge accounts from database safely
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }

  try {
    await db.user.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ message: 'User record completely removed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete target user' }, { status: 500 });
  }
}