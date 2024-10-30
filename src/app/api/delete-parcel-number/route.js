import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function DELETE(request) {
  const { id } = await request.json() // รับค่า id จาก body ของ request

  let connection

  try {
    connection = await dbConnect()

    const query = 'DELETE FROM b_bookingsend WHERE id = ?'
    const [result] = await connection.execute(query, [id])

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Record deleted successfully' })
    } else {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete record' }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}
