'use client'
import React, { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  styled,
  Pagination
} from '@mui/material'

// สร้างธีมสำหรับตาราง
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.1rem',
  padding: '4px 8px'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '4px 8px'
}))

const RecordParcelNumber = () => {
  const [rows, setRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    filmNo: '',
    parcelNumber: '',
    customerName: '',
    boxCount: '',
    orderNumber: '',
    carrier: '',
    weight: '',
    price: '',
    status: 'จัดส่งเรียบร้อย',
    dateSent: new Date().toISOString().substring(0, 10)
  })

  const [bookingNos, setBookingNos] = useState([])

  useEffect(() => {
    if (bookingNos.length > 0) {
      setFormData(prevFormData => ({
        ...prevFormData,
        orderNumber: bookingNos[0] // กำหนดค่าเริ่มต้นเป็นรายการแรก
      }))
    }
  }, [bookingNos])

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const uni_id = JSON.parse(sessionStorage.getItem('selectedUniversity')).uni_id
        const response = await fetch('/api/fetch-bookingsend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uni_id, film_no: formData.filmNo }) // ส่ง film_no ด้วยเพื่อดึงข้อมูลที่ต้องการ
        })

        if (response.ok) {
          const data = await response.json()

          // อัปเดตค่า formData โดยใช้ค่า numberSend จาก backend โดยตรง
          setFormData(prevFormData => ({
            ...prevFormData,
            customerName: data.customerName || '',
            boxCount: data.numberSend, // ใช้ค่า numberSend ที่ได้จาก backend ตรงๆ
            orderNumber: data.bookingNos && data.bookingNos.length > 0 ? data.bookingNos[0] : ''
          }))

          setRows(data.data)
        } else {
          console.error('Failed to fetch booking data')
        }
      } catch (error) {
        console.error('Error fetching booking data:', error)
      }
    }

    fetchBookingData()
  }, [])

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  const handleInputChange = async e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'filmNo' && value) {
      try {
        const uni_id = JSON.parse(sessionStorage.getItem('selectedUniversity')).uni_id
        const response = await fetch('/api/find-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ film_no: value, uni_id })
        })

        if (response.ok) {
          const data = await response.json()
          setFormData(prevFormData => ({
            ...prevFormData,
            customerName: data.customerName,
            boxCount: data.numberSend, // ใช้ค่า numberSend ที่ได้จาก backend ตรงๆ
            orderNumber: data.bookingNos && data.bookingNos.length > 0 ? data.bookingNos[0] : ''
          }))
          setBookingNos(data.bookingNos || [])
        } else {
          console.error('Failed to fetch customerName and bookingNos')
        }
      } catch (error) {
        console.error('Error fetching customerName and bookingNos:', error)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const session = await getSession()
      const uni_id = JSON.parse(sessionStorage.getItem('selectedUniversity')).uni_id

      const response = await fetch('/api/save-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          user_id: session?.user?.id,
          uni_id
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(result.message)

        // เรียก fetchBookingData เพื่อดึงข้อมูลใหม่ทั้งหมด
        fetchBookingData()

        // รีเซ็ตฟอร์ม
        setFormData({
          filmNo: '',
          parcelNumber: '',
          customerName: '',
          boxCount: '',
          orderNumber: '',
          carrier: formData.carrier,
          weight: '',
          price: '',
          status: 'จัดส่งเรียบร้อย',
          dateSent: new Date().toISOString().substring(0, 10)
        })
      } else {
        console.error('Failed to save data')
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleDelete = async id => {
    try {
      const response = await fetch('/api/delete-parcel-number', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id }) // ส่ง id ใน body
      })

      if (response.ok) {
        setRows(rows.filter(row => row.id !== id))
      } else {
        console.error('Failed to delete data')
      }
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div>
      <Typography variant='h5' gutterBottom>
        บันทึกเลขพัสดุ
      </Typography>

      {/* ฟิลด์ input สำหรับ carrier และวันที่ส่ง */}
      <Box display='flex' justifyContent='right' alignItems='center' mb={2}>
        <TextField
          label='เลข ปณ.'
          name='carrier'
          value={formData.carrier}
          onChange={handleInputChange}
          variant='outlined'
          size='small'
          fullWidth
          sx={{ maxWidth: '250px', mr: 2 }} // ขนาดและระยะห่างของ input
        />

        <TextField
          label='วันที่ส่ง'
          name='dateSent'
          type='date'
          value={formData.dateSent}
          onChange={handleInputChange}
          variant='outlined'
          size='small'
          sx={{ maxWidth: '200px' }} // ขนาดของช่องวันที่จัดส่ง
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderSpacing: '0', borderCollapse: 'collapse' }}>
        <Table sx={{ '& th': { padding: '20px 0' } }}>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>&nbsp;&nbsp;&nbsp;&nbsp;เลขที่ ฟิล์ม</StyledTableHeadCell>
              <StyledTableHeadCell>ชื่อ-สกุล</StyledTableHeadCell>
              <StyledTableHeadCell>ครั้งที่ส่ง</StyledTableHeadCell>
              <StyledTableHeadCell>เลขใบจอง</StyledTableHeadCell>
              <StyledTableHeadCell>เลข ปณ.</StyledTableHeadCell>
              <StyledTableHeadCell>เลขพัสดุ</StyledTableHeadCell>
              <StyledTableHeadCell>วันที่ส่ง</StyledTableHeadCell>
              <StyledTableHeadCell>น้ำหนัก</StyledTableHeadCell>
              <StyledTableHeadCell>ราคา</StyledTableHeadCell>
              <StyledTableHeadCell>สถานะ</StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
            </TableRow>
            <TableRow>
              {/* ช่อง input ที่ย้ายไปอยู่ในตาราง */}
              <StyledTableCell sx={{ paddingRight: '10px' }}>
                <TextField
                  label='เลขที่ฟิล์ม'
                  name='filmNo'
                  value={formData.filmNo}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  label='ชื่อ-สกุล'
                  name='customerName'
                  value={formData.customerName}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  label='ครั้งที่ส่ง'
                  name='boxCount'
                  type='number'
                  value={formData.boxCount}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </StyledTableCell>
              {/* Drop-down สำหรับเลขใบจอง */}
              <StyledTableCell>
                <Select
                  name='orderNumber'
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                >
                  {bookingNos.map((bookingNo, index) => (
                    <MenuItem key={index} value={bookingNo}>
                      {bookingNo}
                    </MenuItem>
                  ))}
                </Select>
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  label='เลข ปณ.'
                  name='carrier'
                  value={formData.carrier}
                  variant='outlined'
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                />
              </StyledTableCell>
              <StyledTableCell className='p-0'>
                <TextField
                  label='เลขพัสดุ'
                  name='parcelNumber'
                  value={formData.parcelNumber}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                />
              </StyledTableCell>

              <StyledTableCell>
                <TextField
                  label='วันที่ส่ง'
                  name='dateSent'
                  type='date'
                  value={formData.dateSent}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ maxWidth: { xs: '100%', md: '200px' }, mr: 2 }} // ขนาดของช่องวันที่จัดส่ง (สำหรับมือถือขนาดเต็ม)
                  InputProps={{
                    readOnly: true
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  label='น้ำหนัก (กก.)'
                  name='weight'
                  value={formData.weight}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  label='ราคา (บาท)'
                  name='price'
                  value={formData.price}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                  sx={{ margin: 0, padding: 0, width: '100%' }}
                />
              </StyledTableCell>
              <StyledTableCell>
                <Select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  variant='outlined'
                  fullWidth
                  size='small'
                >
                  <MenuItem value='จัดส่งเรียบร้อย'>จัดส่งเรียบร้อย</MenuItem>
                </Select>
              </StyledTableCell>
              <StyledTableCell>
                <Button variant='contained' color='primary' onClick={handleSubmit}>
                  เพิ่ม
                </Button>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((row, index) => (
              <TableRow key={index}>
                <StyledTableCell>{row.film_no}</StyledTableCell>
                <StyledTableCell>{row.customerName}</StyledTableCell>
                <StyledTableCell>{row.number_send}</StyledTableCell>
                <StyledTableCell>{row.booking_no}</StyledTableCell>
                <StyledTableCell>{row.tacking_first}</StyledTableCell>
                <StyledTableCell>{row.tacking_no}</StyledTableCell>
                <StyledTableCell>{row.senddate}</StyledTableCell>
                <StyledTableCell>{row.weight}</StyledTableCell>
                <StyledTableCell>{row.send_price}</StyledTableCell>
                <StyledTableCell>{row.send_status === 1 ? 'จัดส่งเรียบร้อย' : 'ยังไม่จัดส่ง'}</StyledTableCell>
                <StyledTableCell>
                  <Button variant='contained' color='secondary' onClick={() => handleDelete(row.id)}>
                    ลบใบจอง
                  </Button>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      <Box display='flex' justifyContent='center' mt={2}>
        <Pagination
          count={Math.ceil(rows.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color='primary'
        />
      </Box>
    </div>
  )
}

export default RecordParcelNumber
