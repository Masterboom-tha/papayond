import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function POST(request) {
  let connection

  try {
    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ดึงค่า body จาก request
    const body = await request.json()
    const { uni_id } = body

    if (!uni_id) {
      return new Response(JSON.stringify({ error: 'Missing uni_id in body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ดึงข้อมูลจากตาราง address โดยกรองตาม uni_id
    const [rows] = await connection.query(
      'SELECT id, fname, lname, posiphoto_1, posiphoto_2, posiphoto_3, posiphoto_4, posiphoto_5, posiphoto_6, posiphoto_7, posiphoto_8, posiphoto_9, film_no, update_date, update_by FROM address WHERE uni_id = ?',
      [uni_id]
    )

    // ปิดการเชื่อมต่อหลังจากดึงข้อมูลเสร็จ
    await connection.end()

    // ส่งข้อมูลกลับเป็น JSON
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching address:', error.message)

    // ปิดการเชื่อมต่อในกรณีที่เกิดข้อผิดพลาด
    if (connection) await connection.end()

    return new Response(JSON.stringify({ error: 'Failed to fetch addresses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
