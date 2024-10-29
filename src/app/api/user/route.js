import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  if (request.method === 'GET') {
    try {
      const products = await prisma.userpermission.findMany()

      return new Response(JSON.stringify({ products }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error fetching products:', error)

      return new Response(JSON.stringify({ error: 'Products could not be fetched', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request) {
  if (request.method === 'POST') {
    try {
      const data = await request.json()
      const newUserPermission = await prisma.userPermission.create({ data })

      return new Response(JSON.stringify({ newUserPermission }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error creating user permission:', error)

      return new Response(JSON.stringify({ error: 'User permission could not be created', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
