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
  let connection

  try {
    connection = await dbConnect()

    const body = await request.json()
    const { filmNo, boxCount, orderNumber, parcelNumber, carrier, dateSent, weight, price, status, user_id, uni_id } =
      body

    if (
      !filmNo ||
      !boxCount ||
      !orderNumber ||
      !parcelNumber ||
      !carrier ||
      !dateSent ||
      !weight ||
      !price ||
      !status ||
      !user_id ||
      !uni_id
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ตรวจสอบว่า status คือ "จัดส่งเรียบร้อย" หรือไม่
    const send_status = status === 'จัดส่งเรียบร้อย' ? 1 : status

    const query = `
      INSERT INTO b_bookingsend
      (number_send, booking_no, tacking_no, tacking_first, senddate, weight, send_price, send_status, createdate, uni_id, user_id, film_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `

    await connection.execute(query, [
      boxCount,
      orderNumber,
      parcelNumber,
      carrier,
      dateSent,
      weight,
      price,
      send_status, // ใช้ send_status ที่แปลงแล้ว
      uni_id,
      user_id,
      filmNo
    ])

    return NextResponse.json({ message: 'Data saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
