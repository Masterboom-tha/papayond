import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 })
    }

    const { uni_id } = body

    if (!uni_id) {
      return NextResponse.json({ message: 'uni_id is required' }, { status: 400 })
    }

    // สร้างการเชื่อมต่อกับฐานข้อมูล
    const dbConnect = async () => {
      return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      })
    }

    const connection = await dbConnect()

    // ดึงข้อมูลจาก f_pricegroup_active ที่ตรงกับ uni_id
    const [rows] = await connection.execute('SELECT * FROM f_pricegroup_active WHERE uni_id = ?', [uni_id])

    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching price groups:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
