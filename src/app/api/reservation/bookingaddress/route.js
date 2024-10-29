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

// API สำหรับดึงข้อมูลแบบไดนามิก
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // ประเภทของข้อมูลที่ต้องการดึง เช่น 'province', 'amphur', 'district', 'postcode'
    const id = searchParams.get('id') // ใช้ id สำหรับ provinceId หรือ amphurId

    const connection = await dbConnect()
    let data = []

    switch (type) {
      case 'province':
        // ดึงข้อมูลจังหวัดทั้งหมด
        ;[data] = await connection.execute('SELECT PROVINCE_ID, PROVINCE_NAME FROM m_p_province')
        break
      case 'amphur':
        // ดึงข้อมูลอำเภอเฉพาะที่มี PROVINCE_ID ตรงกับ id
        if (!id) throw new Error('Province ID is required for fetching amphurs')
        ;[data] = await connection.execute('SELECT AMPHUR_ID, AMPHUR_NAME FROM m_p_amphur WHERE PROVINCE_ID = ?', [id])
        break
      case 'district':
        // ดึงข้อมูลตำบลเฉพาะที่มี AMPHUR_ID ตรงกับ id
        if (!id) throw new Error('Amphur ID is required for fetching districts')
        ;[data] = await connection.execute('SELECT DISTRICT_ID, DISTRICT_NAME FROM m_p_district WHERE AMPHUR_ID = ?', [
          id
        ])
        break
      case 'postcode':
        // ดึงรหัสไปรษณีย์เฉพาะที่มี AMPHUR_ID ตรงกับ id
        if (!id) throw new Error('Amphur ID is required for fetching postcode')
        ;[data] = await connection.execute('SELECT POST_CODE FROM m_p_amphur_postcode WHERE AMPHUR_ID = ?', [id])
        break
      default:
        throw new Error('Invalid request type')
    }

    await connection.end()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error details:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
