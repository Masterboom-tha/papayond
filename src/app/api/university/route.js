import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// GET All universities
export async function GET(request) {
  const connection = await dbConnect()

  try {
    if (request.method === 'GET') {
      // ดึงข้อมูลทั้งหมดจากตาราง m_univercities
      const [universities] = await connection.execute('SELECT * FROM m_univercities')

      return new Response(JSON.stringify({ universities }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Error fetching universities:', error)

    return new Response(JSON.stringify({ error: 'Universities could not be fetched', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}
