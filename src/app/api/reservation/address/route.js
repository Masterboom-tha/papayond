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

// API GET เพื่อดึงข้อมูลจากตาราง address, m_signs, และ m_faculties ตาม id ที่ระบุ
export async function GET(request) {
  let connection
  try {
    // ดึงพารามิเตอร์ id จาก URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // ตรวจสอบว่า id มีค่าไหมและเป็นตัวเลข
    if (!id || isNaN(parseInt(id))) {
      return new Response(JSON.stringify({ error: 'Invalid ID parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // Query ข้อมูลจากตาราง address ตาม id
    const [addressRows] = await connection.execute(
      'SELECT signs_id, fname, lname, film_no, educ1, educ2, educ3, educ4, facid, tel, posiphoto_1, posiphoto_2, posiphoto_3, posiphoto_4, posiphoto_5, posiphoto_6, posiphoto_7, posiphoto_8, posiphoto_9, update_date, update_by, uni_id FROM address WHERE id = ?',
      [parseInt(id)]
    )

    // ตรวจสอบว่ามีข้อมูลในตาราง address หรือไม่
    if (addressRows.length === 0) {
      return new Response(JSON.stringify({ message: 'No data found for address' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Query ข้อมูลทั้งหมดจากตาราง m_signs
    const [signsRows] = await connection.execute('SELECT * FROM m_signs')

    // Query ข้อมูลจากตาราง m_faculties ตาม uni_id ที่ได้จาก address
    const uni_id = addressRows[0].uni_id
    const [facultyRows] = await connection.execute('SELECT id AS facid, facuname FROM m_faculties WHERE uni_id = ?', [
      uni_id
    ])

    // รวมข้อมูล faculty เข้ากับ addressRows
    const addressDataWithFaculty = {
      ...addressRows[0],
      faculties: facultyRows
    }

    // ส่งข้อมูลที่ได้จากการ Query กลับไป
    return new Response(
      JSON.stringify({
        addressData: addressDataWithFaculty,
        signsData: signsRows
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    // จัดการข้อผิดพลาดและส่ง response กลับ
    console.error('Error details:', error)
    return new Response(JSON.stringify({ error: 'Data could not be fetched', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูล
    if (connection) {
      await connection.end()
    }
  }
}
