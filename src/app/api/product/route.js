import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  if (request.method === 'POST') {
    try {
      const { name, description, price, quantity, userId } = await request.json()

      if (!name || !description || isNaN(parseFloat(price)) || quantity == null || isNaN(userId)) {
        return new Response(JSON.stringify({ error: 'Invalid input data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Create the product
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price), // Convert price to number
          quantity
        }
      })

      // Log the action
      await prisma.log.create({
        data: {
          userId: parseInt(userId, 10), // Ensure userId is a number
          productId: product.id,
          action: 'CREATE_PRODUCT'
        }
      })

      return new Response(JSON.stringify({ message: 'Product created', product }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error creating product:', error) // Log the error

      return new Response(JSON.stringify({ error: 'Product could not be created', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    } finally {
      await prisma.$disconnect() // Ensure Prisma Client is disconnected
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

//getall
export async function GET(request) {
  if (request.method === 'GET') {
    try {
      const products = await prisma.product.findMany()

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
