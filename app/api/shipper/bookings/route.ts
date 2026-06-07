import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shipperId = searchParams.get('shipperId');

  if (!shipperId) return NextResponse.json({ error: 'Missing Identity' }, { status: 400 });

  try {
    const shipperLoads = await prisma.booking.findMany({
      where: { shipperId },
      include: {
        driver: {
          select: {
            name: true,
            email: true // Shipper sees driver identity & info only if driverId is filled
          }
        }
      }
    });

    return NextResponse.json(shipperLoads);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}