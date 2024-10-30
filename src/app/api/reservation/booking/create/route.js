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

// API POST เพื่อบันทึกข้อมูลใบจองใหม่
export async function POST(request) {
  try {
    // ดึงข้อมูลจาก body ของ request
    const { address_id, uni_id, film_no, booking_no } = await request.json()

    // ตรวจสอบว่ามีข้อมูลที่ต้องการครบถ้วนหรือไม่
    if (!address_id || !uni_id || !film_no || !booking_no) {
      return new Response(
        JSON.stringify({ error: 'All fields (address_id, uni_id, film_no, booking_no) are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // เชื่อมต่อกับฐานข้อมูล
    const connection = await dbConnect()

    // Query เพื่อบันทึกข้อมูลลงในตาราง address_booking
    const [result] = await connection.execute(
      'INSERT INTO address_booking (address_id, uni_id, film_no, booking_no) VALUES (?, ?, ?, ?)',
      [address_id, uni_id, film_no, booking_no]
    )

    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()

    // ตรวจสอบผลลัพธ์การบันทึกข้อมูล
    if (result.affectedRows === 1) {
      return new Response(JSON.stringify({ success: true, message: 'Booking saved successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Failed to save booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    // จัดการข้อผิดพลาดและส่ง response กลับ
    console.error('Error details:', error)
    return new Response(JSON.stringify({ error: 'An error occurred', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
