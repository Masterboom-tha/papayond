// app/api/getImage/route.js

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 })
  }

  // Convert userId to number
  const userIdNumber = parseInt(userId, 10)

  if (isNaN(userIdNumber)) {
    return new Response(JSON.stringify({ error: 'Invalid User ID' }), { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber }
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    return new Response(JSON.stringify({ imageBase64: user.image }), { status: 200 })
  } catch (error) {
    console.error('Error fetching image:', error)

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
