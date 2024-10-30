// ตัวอย่างโค้ดหลังบ้านที่ปรับให้บันทึกค่า `update_by` และ `update_date`

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
      id,
      signs_id,
      fname,
      lname,
      film_no,
      educ1,
      educ2,
      educ3,
      educ4,
      facid,
      tel,
      uni_id,
      update_by, // ดึงค่าจาก session ฝั่ง frontend
      update_date, // เวลาปัจจุบันที่ถูกกำหนดจาก frontend
      posiphoto_1,
      posiphoto_2,
      posiphoto_3,
      posiphoto_4,
      posiphoto_5,
      posiphoto_6,
      posiphoto_7,
      posiphoto_8,
      posiphoto_9
    } = data

    // คำสั่ง SQL สำหรับการอัปเดตข้อมูลตาม `id`
    const query = `
      UPDATE address
      SET
        signs_id = ?,
        fname = ?,
        lname = ?,
        film_no = ?,
        educ1 = ?,
        educ2 = ?,
        educ3 = ?,
        educ4 = ?,
        facid = ?,
        tel = ?,
        uni_id = ?,
        update_by = ?,
        update_date = ?,
        posiphoto_1 = ?,
        posiphoto_2 = ?,
        posiphoto_3 = ?,
        posiphoto_4 = ?,
        posiphoto_5 = ?,
        posiphoto_6 = ?,
        posiphoto_7 = ?,
        posiphoto_8 = ?,
        posiphoto_9 = ?
      WHERE id = ?
    `

    const values = [
      signs_id,
      fname,
      lname,
      film_no,
      educ1,
      educ2,
      educ3,
      educ4,
      facid,
      tel,
      uni_id,
      update_by, // ส่งค่าจาก frontend มาเพื่อบันทึกในฐานข้อมูล
      update_date, // ส่งค่าเวลาปัจจุบันจาก frontend มาเพื่อบันทึก
      posiphoto_1,
      posiphoto_2,
      posiphoto_3,
      posiphoto_4,
      posiphoto_5,
      posiphoto_6,
      posiphoto_7,
      posiphoto_8,
      posiphoto_9,
      id // ใช้ id ใน WHERE สำหรับการอัปเดต
    ]

    // รันคำสั่ง SQL
    const [result] = await connection.execute(query, values)

    return NextResponse.json({ success: true, message: 'Data updated successfully' })
  } catch (error) {
    console.error('Error updating data:', error)
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}
