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

export async function POST(request) {
  const connection = await dbConnect()

  try {
    const { email, password, name, username } = await request.json()

    // Check if user with this email or username already exists
    const [existingUserRows] = await connection.execute('SELECT * FROM `users` WHERE `email` = ? OR `username` = ?', [
      email,
      username
    ])

    if (existingUserRows.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Email or username already exists', code: 'EMAIL_OR_USERNAME_EXISTS' }),
        { status: 409 } // 409 Conflict
      )
    }

    // Create new user without specifying created_at and updated_at
    const [result] = await connection.execute(
      'INSERT INTO `users` (`email`, `password`, `name`, `username`) VALUES (?, ?, ?, ?)',
      [email, password, name, username]
    )

    // Fetch permissions and create UserPermission records
    try {
      const [permissionsRows] = await connection.execute('SELECT * FROM `permission`')

      const userPermissions = permissionsRows.map(permission => ({
        userId: result.insertId,
        permissionId: permission.id
      }))

      const values = userPermissions.map(up => `(?, ?)`).join(',')
      const flattenValues = userPermissions.flatMap(up => [up.userId, up.permissionId])

      await connection.execute(
        `INSERT INTO \`user_permission\` (\`user_id\`, \`permission_id\`) VALUES ${values}`,
        flattenValues
      )
    } catch (permissionsError) {
      console.error('Error fetching permissions:', permissionsError)
    }

    return new Response(
      JSON.stringify({ message: 'User created', user: { email, name, username, id: result.insertId } }),
      { status: 201 } // 201 Created
    )
  } catch (error) {
    console.error('Error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return new Response(
        JSON.stringify({ error: 'Email or username already exists', code: 'EMAIL_OR_USERNAME_EXISTS' }),
        { status: 409 } // 409 Conflict
      )
    }

    return new Response(JSON.stringify({ error: 'User could not be created', code: 'CREATE_FAILED' }), { status: 500 })
  } finally {
    await connection.end()
  }
}
