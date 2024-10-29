import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

const sanitizeData = data => (data === '' ? null : data)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' })
  }

  try {
    const { addressData } = req.body

    if (!addressData) {
      return res.status(400).json({ message: 'Address data is required' })
    }

    const connection = await dbConnect()

    let query = ''
    let values = []

    if (addressData.address_id) {
      // ถ้ามี ID อยู่แล้ว ให้ทำการอัปเดตข้อมูล
      query = `
        UPDATE address
        SET
          signs_id = ?,
          fname = ?,
          lname = ?,
          facid = ?,
          tel = ?,
          posiphoto_1 = ?,
          posiphoto_2 = ?,
          posiphoto_3 = ?,
          posiphoto_4 = ?,
          posiphoto_5 = ?,
          posiphoto_6 = ?,
          posiphoto_7 = ?,
          posiphoto_8 = ?,
          posiphoto_9 = ?,
          update_by = ?,
          update_date = ?
        WHERE address_id = ?
      `
      values = [
        sanitizeData(addressData.signs_id),
        sanitizeData(addressData.fname),
        sanitizeData(addressData.lname),
        sanitizeData(addressData.facid),
        sanitizeData(addressData.tel),
        sanitizeData(addressData.posiphoto_1),
        sanitizeData(addressData.posiphoto_2),
        sanitizeData(addressData.posiphoto_3),
        sanitizeData(addressData.posiphoto_4),
        sanitizeData(addressData.posiphoto_5),
        sanitizeData(addressData.posiphoto_6),
        sanitizeData(addressData.posiphoto_7),
        sanitizeData(addressData.posiphoto_8),
        sanitizeData(addressData.posiphoto_9),
        sanitizeData(addressData.update_by),
        sanitizeData(new Date().toISOString()), // อัปเดตวันที่เป็นปัจจุบัน
        addressData.address_id
      ]
    } else {
      // ถ้าไม่มี ID ให้บันทึกใหม่
      query = `
        INSERT INTO address (
          signs_id,
          fname,
          lname,
          facid,
          tel,
          posiphoto_1,
          posiphoto_2,
          posiphoto_3,
          posiphoto_4,
          posiphoto_5,
          posiphoto_6,
          posiphoto_7,
          posiphoto_8,
          posiphoto_9,
          update_by,
          update_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      values = [
        sanitizeData(addressData.signs_id),
        sanitizeData(addressData.fname),
        sanitizeData(addressData.lname),
        sanitizeData(addressData.facid),
        sanitizeData(addressData.tel),
        sanitizeData(addressData.posiphoto_1),
        sanitizeData(addressData.posiphoto_2),
        sanitizeData(addressData.posiphoto_3),
        sanitizeData(addressData.posiphoto_4),
        sanitizeData(addressData.posiphoto_5),
        sanitizeData(addressData.posiphoto_6),
        sanitizeData(addressData.posiphoto_7),
        sanitizeData(addressData.posiphoto_8),
        sanitizeData(addressData.posiphoto_9),
        sanitizeData(addressData.update_by),
        sanitizeData(new Date().toISOString()) // วันที่ปัจจุบัน
      ]
    }

    const [result] = await connection.execute(query, values)
    await connection.end()

    return res.status(200).json({ success: true, result })
  } catch (error) {
    console.error('Error updating or adding address:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
