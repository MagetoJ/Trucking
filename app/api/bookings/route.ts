import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 1. View Available Jobs or My Accepted Jobs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId'); // Pull secure ID from session context instead in prod
  const type = searchParams.get('type'); // 'available' or 'my-jobs'

  try {
    if (type === 'available') {
      // Drivers can only see the basic load post request.
      const availableLoads = await prisma.booking.findMany({
        where: { status: 'PENDING' },
        include: {
          shipper: { select: { id: true, name: true, email: true } } // Includes shipper details upon view
        }
      });
      return NextResponse.json(availableLoads);
    }

    if (type === 'my-jobs' && driverId) {
      const workingJobs = await prisma.booking.findMany({
        where: { driverId: driverId },
        include: {
          shipper: { select: { name: true, email: true } } 
        }
      });
      return NextResponse.json(workingJobs);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}