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

    const { id, uni_id, booking_no } = body

    // ตรวจสอบว่าข้อมูลที่จำเป็นมีครบหรือไม่
    if (!id || !uni_id || !booking_no) {
      return NextResponse.json({ message: 'id, uni_id, and booking_no are required' }, { status: 400 })
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

    // ดึงข้อมูลจาก b_bookingfw ที่ตรงกับ id, uni_id, และ booking_no
    const [rows] = await connection.execute(
      'SELECT * FROM b_bookingfw WHERE orderid = ? AND uni_id = ? AND booking_no = ?',
      [id, uni_id, booking_no]
    )

    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()

    // ส่งข้อมูลที่ได้กลับไปยัง frontend
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
