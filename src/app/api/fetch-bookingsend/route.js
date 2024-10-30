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

export async function POST(request) {
  const { uni_id } = await request.json() // รับค่า uni_id จาก body ของ request
  console.log('Received uni_id:', uni_id) // เพิ่มการแสดงผล uni_id

  let connection

  try {
    connection = await dbConnect()

    const query = `
      SELECT
        b.id,
        b.number_send,
        b.booking_no,
        b.tacking_no,
        b.tacking_first,
        b.senddate,
        b.weight,
        b.send_price,
        b.send_status,
        b.createdate,
        b.uni_id,
        b.user_id,
        b.film_no,
        ab.name_for_rec AS customerName
      FROM
        b_bookingsend AS b
      LEFT JOIN
        address_booking AS ab ON b.booking_no = ab.booking_no
      WHERE
        b.uni_id = ?
    `
    const [rows] = await connection.execute(query, [uni_id])

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch booking data' }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}
