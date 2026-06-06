import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userType = searchParams.get('userType')
  const search = searchParams.get('search')

  try {
    const users = await db.user.findMany({
      where: {
        AND: [
          userType && userType !== 'all' ? { role: userType.toUpperCase() as any } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          } : {}
        ]
      }
    })

    const safeUsers = users.map(({ password, ...user }) => ({
      ...user,
      role: user.role.toLowerCase()
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}