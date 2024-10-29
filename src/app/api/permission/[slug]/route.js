import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function PUT(request, { params }) {
  const connection = await dbConnect()

  try {
    const userId = parseInt(params.slug, 10)
    const { permissions } = await request.json()

    // ดึงข้อมูล menu_id ที่ตรงกับชื่อเมนูที่ได้รับมา
    const [menuRows] = await connection.execute(
      `SELECT id FROM menu_role WHERE menu_name IN (${permissions.map(() => '?').join(',')})`,
      [...permissions]
    )

    const menuIdsToAdd = menuRows.map(row => row.id)

    // ดึงสิทธิ์ปัจจุบันของผู้ใช้
    const [currentPermissions] = await connection.execute('SELECT menu_id FROM users_role WHERE users_id = ?', [userId])

    const currentMenuIds = currentPermissions.map(p => p.menu_id)

    // หาสิทธิ์ที่ต้องลบ
    const menuIdsToRemove = currentMenuIds.filter(id => !menuIdsToAdd.includes(id))

    await connection.beginTransaction()

    // ลบสิทธิ์ที่ไม่ต้องการ
    if (menuIdsToRemove.length > 0) {
      const placeholders = menuIdsToRemove.map(() => '?').join(',')
      await connection.execute(`DELETE FROM users_role WHERE users_id = ? AND menu_id IN (${placeholders})`, [
        userId,
        ...menuIdsToRemove
      ])
    }

    // เพิ่มสิทธิ์ใหม่
    if (menuIdsToAdd.length > 0) {
      const values = menuIdsToAdd.map(menuId => [userId, menuId])
      await connection.query('INSERT INTO users_role (users_id, menu_id) VALUES ?', [values])
    }

    await connection.commit()

    // ดึงข้อมูลผู้ใช้ที่อัปเดตแล้ว
    const [updatedUser] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId])

    // ดึงข้อมูลสิทธิ์ที่อัปเดตแล้วของผู้ใช้
    const [updatedPermissions] = await connection.execute(
      `
      SELECT mr.id, mr.menu_name
      FROM users_role ur
      JOIN menu_role mr ON ur.menu_id = mr.id
      WHERE ur.users_id = ?
    `,
      [userId]
    )

    const response = {
      user: updatedUser[0],
      permissions: updatedPermissions
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating user permissions:', error)
    await connection.rollback()

    return new Response(JSON.stringify({ error: 'Failed to update user permissions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}
