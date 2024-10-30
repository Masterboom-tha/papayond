import mysql from 'mysql2/promise'

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// API POST เพื่อดึงข้อมูลจากตาราง address_booking ตาม address_id และ booking_no ที่ระบุ
export async function POST(request) {
  try {
    // ดึงข้อมูลจาก body ของ request
    const { address_id, booking_no } = await request.json()

    // ตรวจสอบว่า address_id และ booking_no มีค่าไหม
    if (!address_id || !booking_no) {
      return new Response(JSON.stringify({ error: 'Both address ID and booking number are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    const connection = await dbConnect()

    // Query ข้อมูลจากตาราง address_booking ตาม address_id และ booking_no
    const [rows] = await connection.execute('SELECT * FROM address_booking WHERE address_id = ? AND booking_no = ?', [
      address_id,
      booking_no
    ])

    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ message: `No data found for address_id = ${address_id} and booking_no = ${booking_no}` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // ส่งข้อมูลที่ได้จากการ Query กลับไป
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // จัดการข้อผิดพลาดและส่ง response กลับ
    console.error('Error details:', error)
    return new Response(JSON.stringify({ error: 'Data could not be fetched', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
