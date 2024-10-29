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

// API POST เพื่อเพิ่มข้อมูลใบจองใหม่
export async function POST(request) {
  try {
    // ดึงข้อมูลจาก request body
    const body = await request.json()
    const { film_no, booking_no, address_id } = body

    // ตรวจสอบว่ามีการส่งค่าที่จำเป็นมาครบถ้วน
    if (!film_no || !booking_no || !address_id) {
      return new Response(JSON.stringify({ error: 'film_no, booking_no, and address_id are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    const connection = await dbConnect()

    // ตรวจสอบว่า booking_no และ film_no นี้มีอยู่แล้วหรือไม่
    const [existing] = await connection.execute('SELECT * FROM address_booking WHERE booking_no = ? AND film_no = ?', [
      booking_no,
      film_no
    ])

    if (existing.length > 0) {
      await connection.end()
      return new Response(JSON.stringify({ error: 'Booking number already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เพิ่มข้อมูลใหม่ลงในตาราง address_booking
    // เพิ่มข้อมูลใหม่ลงในตาราง address_booking โดยระบุเฉพาะคอลัมน์ที่จำเป็น
    const [result] = await connection.execute(
      `INSERT INTO address_booking (address_id, booking_no, film_no, update_date) VALUES (?, ?, ?, NOW())`,
      [address_id, booking_no, film_no]
    )

    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()

    // ส่ง Response กลับไป
    return new Response(JSON.stringify({ message: 'Booking added successfully', booking_no }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error adding booking:', error)
    return new Response(JSON.stringify({ error: 'Failed to add booking', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
