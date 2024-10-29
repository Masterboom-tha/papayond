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
  styled
} from '@mui/material'

// สร้างธีมสำหรับตาราง
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.1rem'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer'
}))

const RecordParcelNumber = () => {
  const [rows, setRows] = useState([])

  const [formData, setFormData] = useState({
    filmNo: '',
    parcelNumber: '',
    customerName: '',
    boxCount: 1,
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
            customerName: data.customerName
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
      const session = await getSession() // ดึง session จาก next-auth
      const uni_id = JSON.parse(sessionStorage.getItem('selectedUniversity')).uni_id // ดึง uni_id จาก sessionStorage

      const response = await fetch('/api/save-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          user_id: session?.user?.id, // ส่ง user_id จาก session
          uni_id // ส่ง uni_id จาก sessionStorage
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(result.message) // บันทึกสำเร็จ
        setRows([...rows, formData])

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
            {rows.map((row, index) => (
              <TableRow key={index}>
                <StyledTableCell>{row.filmNo}</StyledTableCell>
                <StyledTableCell>{row.customerName}</StyledTableCell>
                <StyledTableCell>{row.boxCount}</StyledTableCell>
                <StyledTableCell>{row.orderNumber}</StyledTableCell>
                <StyledTableCell>{row.carrier}</StyledTableCell>
                <StyledTableCell>{row.parcelNumber}</StyledTableCell>
                <StyledTableCell>{row.dateSent}</StyledTableCell>
                <StyledTableCell>{row.weight}</StyledTableCell>
                <StyledTableCell>{row.price}</StyledTableCell>
                <StyledTableCell>{row.status}</StyledTableCell>
                <StyledTableCell>ลบใบจอง</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default RecordParcelNumber
