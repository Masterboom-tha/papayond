import mysql from 'mysql2/promise'

const dbConnect = async () => {
  console.log('Connecting to the database...')
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
    console.log('Database connection established for GET request')

    const { searchParams } = new URL(request.url)
    const uni_id = searchParams.get('uni_id')

    if (!uni_id) {
      console.log('Missing parameter: uni_id')
      return new Response(JSON.stringify({ error: 'Parameter uni_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Executing query to fetch addresses with uni_id:', uni_id)
    const query = `
      SELECT
        a.id,
        a.no_imported,
        a.film_no,
        a.fname,
        a.lname,
        a.facid,
        a.update_date,
        a.update_by,
        GROUP_CONCAT(ab.booking_no) AS booking_no
      FROM
        address AS a
      LEFT JOIN
        address_booking AS ab ON a.id = ab.address_id
      WHERE
        a.uni_id = ?
      GROUP BY
        a.id
    `

    const [rows] = await connection.execute(query, [uni_id])
    console.log('Fetched rows:', rows)

    const facidArray = rows.map(row => row.facid)
    console.log('Facid array:', facidArray)

    if (facidArray.length === 0) {
      console.log('No facid found, returning rows')
      return new Response(JSON.stringify({ data: rows }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Fetching faculty names for facids:', facidArray)
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
    console.log('Fetched faculties:', faculties)

    const facultyMap = new Map(faculties.map(faculty => [faculty.facid, faculty.facuname]))
    console.log('Faculty map:', facultyMap)

    const result = rows.map(row => ({
      ...row,
      facuname: facultyMap.get(row.facid) || ''
    }))
    console.log('Final result:', result)

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
      console.log('Database connection closed for GET request')
    }
  }
}

export async function PUT(request) {
  let connection

  try {
    connection = await dbConnect()
    console.log('Database connection established for PUT request')
    const body = await request.json()
    let { id, film_no, booking_no, update_by, uni_id } = body

    if (!id) {
      console.log('Missing parameter: id')
      return new Response(JSON.stringify({ error: 'Parameter id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Received body:', body)

    film_no = film_no !== undefined ? film_no : null
    booking_no = booking_no !== undefined ? booking_no : null
    update_by = update_by !== undefined ? update_by : null
    uni_id = uni_id !== undefined ? uni_id : null

    await connection.beginTransaction()
    console.log('Transaction started for PUT request')

    const updateAddressQuery = `
      UPDATE address
      SET film_no = ?, booking_no = ?, update_date = NOW(), update_by = ?
      WHERE id = ?
    `
    await connection.execute(updateAddressQuery, [film_no, booking_no, update_by, id])
    console.log('Updated address table with id:', id)

    const checkBookingQuery = `
      SELECT id FROM b_bookingfw WHERE orderid = ?
    `
    const [existingBooking] = await connection.execute(checkBookingQuery, [id])
    console.log('Existing booking check result:', existingBooking)

    if (existingBooking.length > 0) {
      const updateBookingQuery = `
        UPDATE b_bookingfw
        SET booking_no = ?, film_no = ?, uni_id = ?
        WHERE orderid = ?
      `
      await connection.execute(updateBookingQuery, [booking_no, film_no, uni_id, id])
      console.log('Updated b_bookingfw with orderid:', id)
    } else {
      const insertBookingQuery = `
        INSERT INTO b_bookingfw (booking_no, uni_id, orderid, film_no)
        VALUES (?, ?, ?, ?)
      `
      await connection.execute(insertBookingQuery, [booking_no, uni_id, id, film_no])
      console.log('Inserted into b_bookingfw with orderid:', id)
    }

    const checkAddressBookingQuery = `
      SELECT * FROM address_booking WHERE address_id = ?
    `
    const [existingAddressBooking] = await connection.execute(checkAddressBookingQuery, [id])
    console.log('Existing address booking check result:', existingAddressBooking)

    if (existingAddressBooking.length > 0) {
      const updateAddressBookingQuery = `
        UPDATE address_booking
        SET booking_no = ?, film_no = ?, uni_id = ?
        WHERE address_id = ?
      `
      const [updateResult] = await connection.execute(updateAddressBookingQuery, [booking_no, film_no, uni_id, id])
      console.log('Updated address_booking:', updateResult)
    } else {
      const insertAddressBookingQuery = `
        INSERT INTO address_booking (booking_no, address_id, film_no, uni_id)
        VALUES (?, ?, ?, ?)
      `
      const [insertResult] = await connection.execute(insertAddressBookingQuery, [booking_no, id, film_no, uni_id])
      console.log('Inserted into address_booking:', insertResult)
    }

    await connection.commit()
    console.log('Transaction committed for PUT request')

    return new Response(JSON.stringify({ message: 'Reservation updated/inserted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
      console.log('Transaction rolled back due to error:', error.message)
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
      console.log('Database connection closed for PUT request')
    }
  }
}

export async function DELETE(request) {
  let connection

  try {
    connection = await dbConnect()
    console.log('Database connection established for DELETE request')
    const body = await request.json()
    const { id, booking_no } = body

    if (!id || !booking_no) {
      console.log('Missing parameters: id or booking_no')
      return new Response(JSON.stringify({ error: 'Parameters id and booking_no are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Received body for DELETE:', body)

    await connection.beginTransaction()
    console.log('Transaction started for DELETE request')

    const deleteAddressBookingQuery = `
      DELETE FROM address_booking WHERE address_id = ? AND booking_no = ?
    `
    await connection.execute(deleteAddressBookingQuery, [id, booking_no])
    console.log('Deleted from address_booking with address_id:', id, 'and booking_no:', booking_no)

    await connection.commit()
    console.log('Transaction committed for DELETE request')

    return new Response(JSON.stringify({ message: 'Reservation deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
      console.log('Transaction rolled back due to error:', error.message)
    }
    console.error('Error deleting reservation:', error.message)
    return new Response(
      JSON.stringify({
        error: 'Failed to delete reservation',
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
      console.log('Database connection closed for DELETE request')
    }
  }
}
