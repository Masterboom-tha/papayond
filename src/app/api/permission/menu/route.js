// api/permission/menu/route.js
import mysql from 'mysql2/promise'

// สร้างฟังก์ชันสำหรับเชื่อมต่อกับ MySQL
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function GET(request) {
  const connection = await dbConnect()

  try {
    // ดึงข้อมูลผู้ใช้และสิทธิ์การใช้งานเมนู
    const [rows] = await connection.execute(`
      SELECT
        users.id AS user_id,
        users.name,
        users.email,
        users.role,
        GROUP_CONCAT(DISTINCT menu_role.menu_name) AS permissions
      FROM
        users
      LEFT JOIN
        users_role ON users.id = users_role.users_id
      LEFT JOIN
        menu_role ON users_role.menu_id = menu_role.id
      GROUP BY
        users.id
    `)

    // แปลงข้อมูลให้อยู่ในรูปแบบที่เหมาะสม
    const formattedData = rows.map(user => ({
      ...user,
      permissions: user.permissions ? user.permissions.split(',') : []
    }))

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}
