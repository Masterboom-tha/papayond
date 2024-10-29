import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  if (request.method === 'GET') {
    try {
      const FrameSet = await prisma.FrameSet.findMany()

      return new Response(JSON.stringify({ FrameSet }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching FrameSet:', error) // Log the error

      return new Response(JSON.stringify({ error: 'FrameSet could not be fetched', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    } finally {
      await prisma.$disconnect() // Ensure Prisma Client is disconnected
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 40
    })
  }
}
