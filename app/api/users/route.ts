import { NextRequest, NextResponse } from 'next/server'
import { mockUsers } from '../auth/login/route'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userType = searchParams.get('userType')
  const search = searchParams.get('search')?.toLowerCase()

  let userList = Object.values(mockUsers)

  if (userType && userType !== 'all') {
    userList = userList.filter((u: any) => u.role === userType)
  }

  if (search) {
    userList = userList.filter((u: any) => 
      u.name.toLowerCase().includes(search) || 
      u.phone.includes(search) || 
      u.email.toLowerCase().includes(search)
    )
  }

  return NextResponse.json(userList)
}