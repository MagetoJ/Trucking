import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key';

export async function GET(request: NextRequest) {
  // 1. Pull the token out of headers or cookies to verify authentication
  const authHeader = request.headers.get('Authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.split(' ')[1] || cookieToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    // 2. Decode token and verify the user is a SUPER_ADMIN
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    if (decoded.role.toUpperCase() !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // 3. Fetch real users directly from the database without any mock data
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        rating: true,
        verified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Clean and normalize response strings to match your state-management expectations
    const safeUsers = users.map((user) => ({
      ...user,
      role: user.role.toLowerCase(),
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Session expired or database fetch failed' }, { status: 401 });
  }
}