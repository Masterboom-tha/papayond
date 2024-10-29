import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  const { slug } = params
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  try {
    switch (slug[0]) {
      case 'provinces':
        const provinces = await prisma.province.findMany()

        return NextResponse.json(provinces)

      case 'amphurs':
        if (!id) return NextResponse.json({ error: 'Missing province ID' }, { status: 400 })

        const amphurs = await prisma.amphur.findMany({
          where: { provinceId: parseInt(id) }
        })

        return NextResponse.json(amphurs)

      case 'districts':
        if (!id) return NextResponse.json({ error: 'Missing amphur ID' }, { status: 400 })

        const districts = await prisma.district.findMany({
          where: { amphurId: parseInt(id) }
        })

        return NextResponse.json(districts)

      case 'postcodes':
        if (!id) return NextResponse.json({ error: 'Missing amphur ID' }, { status: 400 })

        const postcodes = await prisma.amphurPostcode.findMany({
          where: { amphurId: parseInt(id) }
        })

        return NextResponse.json(postcodes)

      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error:', error)

    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}
