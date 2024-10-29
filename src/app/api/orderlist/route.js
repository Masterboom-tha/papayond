import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function GET(request) {
  let connection

  try {
    connection = await dbConnect()

    const { searchParams } = new URL(request.url)
    const uni_id = searchParams.get('uni_id')

    if (!uni_id) {
      return new Response(JSON.stringify({ error: 'Parameter uni_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // คำสั่ง SQL เพื่อดึงข้อมูลจากตาราง address โดยมี uni_id ตรงกับพารามิเตอร์
    const query = `
    SELECT
      id,
      no_imported,
      film_no,
      fname,
      lname,
      facid,
      update_date,
      update_by
    FROM
      address
    WHERE
      uni_id = ?
    `

    // ดึงข้อมูลจากตาราง address
    const [rows] = await connection.execute(query, [uni_id])

    // ดึง facid และ address id ทั้งหมดที่ได้จาก query แรก
    const facidArray = rows.map(row => row.facid)
    const addressIdArray = rows.map(row => row.id)

    if (facidArray.length === 0) {
      // หากไม่มี facid ที่ต้องการ
      return new Response(JSON.stringify({ data: rows }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // สร้างคำสั่ง SQL สำหรับการค้นหา facuname โดยใช้ facid
    const facidPlaceholders = facidArray.map(() => '?').join(', ')
    const query2 = `
    SELECT
      id AS facid,
      facuname
    FROM
      m_faculties
    WHERE
      id IN (${facidPlaceholders})
    `
    const [faculties] = await connection.execute(query2, facidArray)

    // สร้างคำสั่ง SQL สำหรับการค้นหา booking_no โดยใช้ orderid
    const bookingPlaceholders = addressIdArray.map(() => '?').join(', ')
    const query3 = `
    SELECT
      booking_no,
      orderid
    FROM
      b_bookingfw
    WHERE
      orderid IN (${bookingPlaceholders})
    `
    const [bookings] = await connection.execute(query3, addressIdArray)

    // สร้าง Map สำหรับการจับคู่ facid กับ facuname
    const facultyMap = new Map(faculties.map(faculty => [faculty.facid, faculty.facuname]))

    // สร้าง Map สำหรับการจับคู่ orderid กับ booking_no
    const bookingMap = new Map(bookings.map(booking => [booking.orderid, booking.booking_no]))

    // ผสานข้อมูล facuname และ booking_no กับข้อมูล address
    const result = rows.map(row => ({
      ...row,
      facuname: facultyMap.get(row.facid) || '',
      booking_no: bookingMap.get(row.id) || ''
    }))

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching addresses:', error.message)
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch addresses',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export async function PUT(request) {
  let connection

  try {
    connection = await dbConnect()
    const body = await request.json()
    let { id, film_no, booking_no, update_by, uni_id } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'Parameter id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เปลี่ยน undefined เป็น null
    film_no = film_no !== undefined ? film_no : null
    booking_no = booking_no !== undefined ? booking_no : null
    update_by = update_by !== undefined ? update_by : null
    uni_id = uni_id !== undefined ? uni_id : null

    // เริ่ม transaction
    await connection.beginTransaction()

    // อัปเดตในตาราง address
    const updateAddressQuery = `
      UPDATE address
      SET film_no = ?, booking_no = ?, update_date = NOW(), update_by = ?
      WHERE id = ?
    `
    await connection.execute(updateAddressQuery, [film_no, booking_no, update_by, id])

    // ตรวจสอบว่ามีข้อมูลในตาราง b_bookingfw แล้วหรือยัง
    const checkBookingQuery = `
      SELECT id FROM b_bookingfw WHERE orderid = ?
    `
    const [existingBooking] = await connection.execute(checkBookingQuery, [id])

    if (existingBooking.length > 0) {
      // หากมีข้อมูลอยู่แล้ว ให้ทำการอัปเดต
      const updateBookingQuery = `
        UPDATE b_bookingfw
        SET booking_no = ?, film_no = ?, uni_id = ?
        WHERE orderid = ?
      `
      await connection.execute(updateBookingQuery, [booking_no, film_no, uni_id, id])
    } else {
      // หากยังไม่มีข้อมูล ให้ทำการ insert
      const insertBookingQuery = `
        INSERT INTO b_bookingfw (booking_no, uni_id, orderid, film_no)
        VALUES (?, ?, ?, ?)
      `
      await connection.execute(insertBookingQuery, [booking_no, uni_id, id, film_no])
    }

    // เช็คในตาราง address_booking ว่ามี address_id ที่ตรงกันอยู่หรือไม่
    const checkAddressBookingQuery = `
      SELECT * FROM address_booking WHERE address_id = ?
    `
    const [existingAddressBooking] = await connection.execute(checkAddressBookingQuery, [id])

    if (existingAddressBooking.length > 0) {
      // หากมีข้อมูลอยู่แล้ว ให้ทำการอัปเดต
      const updateAddressBookingQuery = `
        UPDATE address_booking
        SET booking_no = ?, film_no = ?, uni_id = ?
        WHERE address_id = ?
      `
      const [updateResult] = await connection.execute(updateAddressBookingQuery, [booking_no, film_no, uni_id, id])
      console.log('Updated address_booking:', updateResult)
    } else {
      // หากยังไม่มีข้อมูล ให้ทำการ insert
      const insertAddressBookingQuery = `
        INSERT INTO address_booking (booking_no, address_id, film_no, uni_id)
        VALUES (?, ?, ?, ?)
      `
      const [insertResult] = await connection.execute(insertAddressBookingQuery, [booking_no, id, film_no, uni_id])
      console.log('Inserted into address_booking:', insertResult)
    }

    // ยืนยันการเปลี่ยนแปลง
    await connection.commit()

    return new Response(JSON.stringify({ message: 'Reservation updated/inserted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // ยกเลิก transaction หากเกิดข้อผิดพลาด
    if (connection) {
      await connection.rollback()
    }
    console.error('Error updating/inserting reservation:', error.message)
    return new Response(
      JSON.stringify({
        error: 'Failed to update/insert reservation',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
