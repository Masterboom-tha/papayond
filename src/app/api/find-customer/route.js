import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// ฟังก์ชันสร้างการเชื่อมต่อกับฐานข้อมูล MySQL
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function POST(request) {
  let connection // ประกาศ connection เพื่อใช้ใน try-catch

  try {
    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ดึงข้อมูลจาก body ของคำขอ
    const body = await request.json()
    const { film_no, uni_id } = body

    if (!film_no || !uni_id) {
      return NextResponse.json({ error: 'Missing film_no or uni_id' }, { status: 400 })
    }

    // ดึงข้อมูล fname และ lname จากตาราง address
    const [addressRows] = await connection.execute(
      'SELECT fname, lname FROM address WHERE film_no = ? AND uni_id = ?',
      [film_no, uni_id]
    )

    if (addressRows.length > 0) {
      const { fname, lname } = addressRows[0]
      const customerName = `${fname} ${lname}`

      // ค้นหา booking_no ที่ตรงกับ film_no จากตาราง address_booking
      const [bookingRows] = await connection.execute(
        'SELECT booking_no FROM address_booking WHERE film_no = ? AND uni_id = ?',
        [film_no, uni_id]
      )

      const bookingNos = bookingRows.map(row => row.booking_no) // เก็บ booking_no ทั้งหมดใน array

      return NextResponse.json({ customerName, bookingNos }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end() // ปิดการเชื่อมต่อเมื่อเสร็จสิ้น
    }
  }
}
