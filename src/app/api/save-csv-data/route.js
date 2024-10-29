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
  const { csvData, selectedUniversity, user_id } = await request.json()

  if (!csvData || !Array.isArray(csvData)) {
    return new Response(JSON.stringify({ message: 'Invalid data format' }), { status: 400 })
  }

  try {
    const connection = await dbConnect()

    const facidMap = {} // แผนที่สำหรับเก็บ facname กับ facid
    let facidCounter = 1 // ตัวนับสำหรับ facid

    const unt_id = selectedUniversity.uni_id

    const importQuery = `
      INSERT INTO address_import
      (no, sname, fname, lname, facid, facname, unt_id, user_id, status_import)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const addressQuery = `
      INSERT INTO address (no_imported, signs_id, fname, lname, typeofbooking, uni_id, facid, educ1, educ2, educ3, educ4, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      let facid

      if (facidMap[row['คณะ']]) {
        facid = facidMap[row['คณะ']] // ใช้ facid เดิมถ้า facname เหมือนกัน
      } else {
        facid = facidCounter.toString().padStart(3, '0') // สร้าง facid ใหม่
        facidMap[row['คณะ']] = facid
        facidCounter++
      }

      // บันทึกลง address_import
      const [result] = await connection.execute(importQuery, [
        i + 1,
        row['คำนำหน้าชื่อ'],
        row['ชื่อ'],
        row['นามสกุล'],
        facid,
        row['คณะ'],
        unt_id,
        user_id,
        1 // ตั้งค่า status_import เป็น 1 ทุกครั้ง
      ])

      const importedId = result.insertId // เก็บ ID ที่ได้จาก address_import

      // ค้นหา signs_id จาก m_signs โดยใช้ sname
      const [signRows] = await connection.execute('SELECT id FROM m_signs WHERE title = ?', [row['คำนำหน้าชื่อ']])
      const signs_id = signRows.length > 0 ? signRows[0].id : null

      // บันทึกลง address โดยใช้ importedId, signs_id, fname, lname, typeofbooking, uni_id, facid, educ1, educ2, educ3, educ4 และ user_id
      await connection.execute(addressQuery, [
        importedId,
        signs_id,
        row['ชื่อ'],
        row['นามสกุล'],
        'offline', // typeofbooking ตั้งค่าเป็น 'offline'
        unt_id, // uni_id จาก selectedUniversity
        facid, // facid เดียวกับที่บันทึกใน address_import
        'N', // educ1 ตั้งค่าเป็น 'N'
        'N', // educ2 ตั้งค่าเป็น 'N'
        'N', // educ3 ตั้งค่าเป็น 'N'
        'N', // educ4 ตั้งค่าเป็น 'N'
        user_id // user_id เพิ่มเข้ามาใน address
      ])
    }

    await connection.end()

    return new Response(JSON.stringify({ message: 'Data saved successfully' }), { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ message: 'Failed to save data' }), { status: 500 })
  }
}
