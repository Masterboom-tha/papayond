// api/addresses.js
import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล MySQL
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// API สำหรับดึงข้อมูลที่อยู่ตาม uni_id
export async function POST(request) {
  const body = await request.json() // รับค่า body จาก request
  const { uni_id } = body // ดึงค่า uni_id จาก body

  if (!uni_id) {
    return NextResponse.json({ error: 'Missing uni_id' }, { status: 400 })
  }

  let connection
  try {
    connection = await dbConnect()

    // ดึงข้อมูลจากตาราง address_booking, address_print และ address โดยใช้ uni_id
    const [rows] = await connection.execute(
      `
  SELECT ab.id, ab.booking_no, ab.signs_id, ab.fname, ab.lname, ab.uni_id, ab.addno, ab.moo, ab.soi, ab.road, ab.tumbol, ab.amphur, ab.province, ab.zip, ab.tel, ab.name_for_rec, ab.address_id,
         ad.film_no, -- ดึง film_no จากตาราง address โดยใช้ address_id
         m_district.district_name AS tumbol_name,
         m_amphur.amphur_name AS amphur_name,
         m_province.province_name AS province_name,
         ap.pstatus, ap.pprint
  FROM address_booking ab
  LEFT JOIN m_p_district m_district ON ab.tumbol = m_district.district_id
  LEFT JOIN m_p_amphur m_amphur ON ab.amphur = m_amphur.amphur_id
  LEFT JOIN m_p_province m_province ON ab.province = m_province.province_id
  LEFT JOIN address_print ap ON ab.booking_no = ap.booking_no AND ab.uni_id = ap.uni_id
  LEFT JOIN address ad ON ab.address_id = ad.id -- เชื่อมกับ address โดยใช้ address_id
  WHERE ab.uni_id = ?
  `,
      [uni_id]
    )

    // เลือกเฉพาะฟิลด์ที่ต้องการจากแต่ละ row
    const filteredRows = rows.map(row => ({
      id: row.id,
      signs_id: row.signs_id,
      fname: row.fname,
      lname: row.lname,
      uni_id: row.uni_id,
      addno: row.addno,
      moo: row.moo,
      soi: row.soi,
      road: row.road,
      tumbol: row.tumbol_name, // ใช้ชื่อของตำบลจากการค้นหา
      amphur: row.amphur_name, // ใช้ชื่อของอำเภอจากการค้นหา
      province: row.province_name, // ใช้ชื่อของจังหวัดจากการค้นหา
      zip: row.zip,
      tel: row.tel,
      booking_no: row.booking_no,
      film_no: row.film_no, // ดึง film_no จาก address
      name_for_rec: row.name_for_rec,
      address_id: row.address_id, // เพิ่ม address_id
      print_status: row.pstatus || '-', // สถานะการพิมพ์จาก address_print
      print_date: row.pprint || '-' // วันที่พิมพ์จาก address_print
    }))

    // ส่งผลลัพธ์เฉพาะฟิลด์ที่เลือกกลับไปยัง client
    return NextResponse.json(filteredRows, { status: 200 })

    // ส่งผลลัพธ์เฉพาะฟิลด์ที่เลือกกลับไปยัง client
    return NextResponse.json(filteredRows, { status: 200 })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end() // ปิดการเชื่อมต่อฐานข้อมูล
    }
  }
}

// API สำหรับอัพเดตสถานะการพิมพ์
export async function PATCH(request) {
  const body = await request.json() // รับค่า body จาก request
  const { uni_id, booking_no } = body // ดึงค่าจาก body

  if (!uni_id || !booking_no) {
    return NextResponse.json({ error: 'Missing uni_id or booking_no' }, { status: 400 })
  }

  let connection
  try {
    connection = await dbConnect()

    // อัพเดตสถานะการพิมพ์
    await connection.execute(
      `UPDATE address_print SET pstatus = 'Y', pprint = NOW() WHERE uni_id = ? AND booking_no = ?`,
      [uni_id, booking_no]
    )
    return NextResponse.json({ success: true, message: 'Print status updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating print status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end() // ปิดการเชื่อมต่อฐานข้อมูล
    }
  }
}
