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

      // ตรวจสอบว่าฟิล์มนี้มีการส่งไปก่อนหน้าใน b_bookingsend หรือไม่
      const [sendRows] = await connection.execute(
        'SELECT MAX(number_send) AS max_number_send FROM b_bookingsend WHERE film_no = ? AND uni_id = ?',
        [film_no, uni_id]
      )

      // กำหนดค่าเริ่มต้นสำหรับ number_send เป็น 1
      let numberSend = 1
      if (sendRows.length > 0 && sendRows[0].max_number_send) {
        numberSend = sendRows[0].max_number_send + 1 // เพิ่มค่า 1 ถ้ามีการส่งไปก่อนหน้าแล้ว
      }

      return NextResponse.json({ customerName, bookingNos, numberSend }, { status: 200 })
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
