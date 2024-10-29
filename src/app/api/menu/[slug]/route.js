import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  const userId = params.slug

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const permissions = user.permissions.map(p => p.permission.name)

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching user permissions:', error)

    return NextResponse.json({ error: 'Unable to fetch user permissions' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
