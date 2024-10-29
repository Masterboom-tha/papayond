// /pages/api/conncet.js
import mysql from 'mysql2/promise'

export default async function handler(req, res) {
  const connection = await mysql.createConnection({
    host: '203.146.170.155',
    user: 'zpansawut_admin',
    password: 'ZpEtCc9qvevr6FAx8SKD',
    database: 'zpansawut_papayonddb'
  })

  try {
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution')
    console.log('Connect success') // เพิ่มข้อความ log เมื่อเชื่อมต่อสำเร็จ
    res.status(200).json({ message: 'Connect success', solution: rows[0].solution })
  } catch (error) {
    console.log("Can't connect", error.message) // เพิ่มข้อความ log เมื่อเชื่อมต่อไม่สำเร็จ
    res.status(500).json({ message: "Can't connect", error: error.message })
  } finally {
    await connection.end()
  }
}
