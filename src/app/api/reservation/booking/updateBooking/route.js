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

    const data = await request.json()
    const {
      signs_id,
      fname,
      lname,
      uni_id,
      addno,
      moo,
      soi,
      road,
      tumbol,
      amphur,
      province,
      zip,
      tel,
      booking_no,
      film_no,
      typeofsend,
      name_for_rec,
      email,
      lineid,
      id, // ใช้ `id` เป็น `address_id`
      update_by
    } = data

    const address_id = id // กำหนดให้ `address_id` เท่ากับ `id`
    const update_date = new Date().toISOString() // เวลาปัจจุบัน

    // SQL สำหรับการอัปเดตข้อมูลในตาราง address_booking โดยใช้ booking_no และ address_id เป็นตัวระบุ
    const query = `
      UPDATE address_booking
      SET
        signs_id = ?,
        fname = ?,
        lname = ?,
        uni_id = ?,
        addno = ?,
        moo = ?,
        soi = ?,
        road = ?,
        tumbol = ?,
        amphur = ?,
        province = ?,
        zip = ?,
        tel = ?,
        film_no = ?,
        typeofsend = ?,
        name_for_rec = ?,
        email = ?,
        lineid = ?,
        update_by = ?,
        update_date = ?
      WHERE booking_no = ? AND address_id = ?
    `

    const values = [
      signs_id,
      fname,
      lname,
      uni_id,
      addno,
      moo,
      soi,
      road,
      tumbol,
      amphur,
      province,
      zip,
      tel,
      film_no,
      typeofsend,
      name_for_rec,
      email,
      lineid,
      update_by,
      update_date,
      booking_no, // ใช้ booking_no ใน WHERE
      address_id // ใช้ address_id ใน WHERE
    ]

    const [result] = await connection.execute(query, values)

    return NextResponse.json({ success: true, message: 'Booking data updated successfully' })
  } catch (error) {
    console.error('Error updating booking data:', error)
    return NextResponse.json({ success: false, error: 'Failed to update booking data' }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}
