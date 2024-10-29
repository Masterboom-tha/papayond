export async function GET(req, res) {
  try {
    const products = await prisma.product.findMany()

    res.status(200).json({ products })
  } catch (error) {
    console.error('Error fetching products:', error) //

    res.status(500).json({ error: 'Products could not be fetched', details: error.message })
  } finally {
    await prisma.$disconnect() // ตรวจสอบให้แน่ใจว่า Prisma Client ถูกตัดการเชื่อมต่อ
  }
}

export async function POST(req, res) {
  try {
    const {
      productId,
      universityId,
      quantity,
      totalPrice,
      address1,
      address2,
      address3,
      province,
      district,
      zip,
      phonenumber
    } = req.body

    const product = await prisma.order.create({
      data: {
        productId,
        universityId,
        quantity,
        totalPrice,
        address1,
        address2,
        address3,
        province,
        district,
        subDistrict,
        zip,
        phonenumber,
        status: 'PENDING'
      }
    })

    await prisma.log.create({
      data: {
        orderId: order.id,
        productId: product.id,
        universityId: university.id,
        action: 'CREATE_ORDER'
      }
    })
  } catch (error) {}
}
