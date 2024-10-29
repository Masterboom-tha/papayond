'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress
} from '@mui/material'
import { jsPDF } from 'jspdf'

// ฟังก์ชันแปลงวันที่
const formatDate = isoDateString => {
  if (!isoDateString) return '' // ถ้าไม่มีข้อมูล ส่งค่าว่างกลับ
  const date = new Date(isoDateString)
  if (isNaN(date.getTime())) return '' // ตรวจสอบว่าวันที่ที่ได้รับคือวันที่ที่ถูกต้องหรือไม่

  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

// สร้างธีมสำหรับตาราง
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1rem'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '1rem',
  fontWeight: 'bold'
}))

export default function Page() {
  const [formData, setFormData] = useState({
    filmNo: '',
    orderNumber: '',
    customerName: '',
    parcelSet: 'ทุกชุด',
    status: 'ยังไม่ได้พิมพ์',
    address: 'เฉพาะมีที่อยู่'
  })

  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([]) // ข้อมูลที่กรองแล้ว
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // จำนวนรายการต่อหน้า
  const [isLoading, setIsLoading] = useState(false) // สถานะการโหลด
  const [printLimit, setPrintLimit] = useState(500) // เก็บจำนวนรายการที่จะพิมพ์

  // ฟังก์ชันสำหรับดึง uni_id จาก sessionStorage
  const getUniIdFromSession = () => {
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    return selectedUniversity ? selectedUniversity.uni_id : null
  }

  // ดึงข้อมูลทันทีที่หน้าโหลด
  useEffect(() => {
    const uni_id = getUniIdFromSession() // ดึง uni_id จาก sessionStorage

    if (uni_id) {
      setIsLoading(true) // เริ่มการโหลด
      axios
        .post('/api/address', { uni_id }) // ส่ง uni_id ใน body
        .then(response => {
          setRows(response.data)
          setFilteredRows(response.data) // ตั้งค่า filteredRows เป็นข้อมูลที่ได้จาก API
        })
        .catch(error => {
          console.error('Error fetching data:', error)
        })
        .finally(() => {
          setIsLoading(false) // เสร็จสิ้นการโหลด
        })
    }
  }, []) // [] ทำให้ useEffect ทำงานเพียงครั้งเดียวตอนที่คอมโพเนนต์ถูกโหลด

  // ฟังก์ชันการค้นหาในตาราง
  const handleSearch = () => {
    const filtered = rows.filter(row => {
      const matchesFilmNo = formData.filmNo ? row.film_no.includes(formData.filmNo) : true
      const matchesOrderNumber = formData.orderNumber ? row.booking_no.includes(formData.orderNumber) : true
      const matchesCustomerName = formData.customerName ? row.name_for_rec.includes(formData.customerName) : true
      const matchesParcelSet = formData.parcelSet !== 'ทุกชุด' ? row.set == formData.parcelSet : true

      // กรองสถานะตามการเลือกในฟิลด์ 'status'
      const matchesStatus =
        formData.status === 'พิมพ์แล้ว'
          ? row.print_status === 'Y'
          : formData.status === 'ยังไม่ได้พิมพ์'
            ? row.print_status !== 'Y'
            : true // กรณี "ทั้งหมด" หรือไม่ได้เลือก จะคืนค่าทั้งหมด

      return matchesFilmNo && matchesOrderNumber && matchesCustomerName && matchesParcelSet && matchesStatus
    })

    setFilteredRows(filtered) // ตั้งค่า filteredRows เป็นข้อมูลที่กรองแล้ว
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePrintLimitChange = e => {
    setPrintLimit(parseInt(e.target.value, 10)) // อัพเดตค่าจำนวนรายการที่จะพิมพ์
  }

  const handlePrint = async () => {
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const uniname = selectedUniversity ? selectedUniversity.uniname : ''
    const uni_id = selectedUniversity ? selectedUniversity.uni_id : null

    // กำหนดให้ "ทั้งหมด" เป็นการพิมพ์ 10000 รายการ
    const printItems = printLimit === 10000 ? filteredRows.slice(0, 10000) : filteredRows.slice(0, printLimit)

    // ตรวจสอบว่ามีข้อมูลที่จะพิมพ์
    if (printItems.length === 0) {
      console.error('ไม่มีข้อมูลที่จะพิมพ์')
      return
    }

    // อัปเดตสถานะการพิมพ์ผ่านการเรียก PATCH API

    // สร้างเนื้อหาที่จะพิมพ์
    const printContent = printItems
      .map(row => {
        return `
          <div style="margin-bottom: 20px; page-break-inside: avoid; border-bottom: 1px dashed #000;">
            <p><strong>ชื่อที่อยู่ผู้รับ:</strong> ${row.name_for_rec || '-'}</p>
            <p><strong>บ้านเลขที่:</strong> ${row.addno || '-'}</p>
            <p><strong>หมู่:</strong> ${row.moo || '-'}</p>
            <p><strong>ซอย:</strong> ${row.soi || '-'}</p>
            <p><strong>ตำบล/แขวง:</strong> ${row.tumbol || '-'}</p>
            <p><strong>อำเภอ/เขต:</strong> ${row.amphur || '-'}</p>
            <p><strong>จังหวัด:</strong> ${row.province || '-'}</p>
            <p><strong>รหัสไปรษณีย์:</strong> ${row.zip || '-'}</p>
            <p><strong>โทร:</strong> ${row.tel || '-'}</p>
            <br>
            <p>${uniname || '-'}</p>
            <p><strong>เลขที่ฟิล์ม:</strong> ${row.film_no || '-'}</p>
          </div>
        `
      })
      .join('')

    // ตรวจสอบว่าเนื้อหาที่จะพิมพ์ถูกสร้างหรือไม่
    if (!printContent) {
      console.error('ไม่มีเนื้อหาที่พิมพ์ได้')
      return
    }

    // เปิดหน้าต่างใหม่เพื่อแสดงเนื้อหาสำหรับพิมพ์
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>ที่อยู่พัสดุ</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            div {
              margin: 0 auto;
              border-bottom: 1px solid #000;
              width: 60%;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
              page-break-inside: avoid;
            }
            p {
              margin: 0;
              padding: 2px 0;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)

    // ปิดการแก้ไขเอกสารและเรียกพิมพ์
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  // คำนวณรายการที่จะต้องแสดงในแต่ละหน้า
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem)

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  return (
    <div>
      <Typography variant='h5' gutterBottom>
        พิมพ์ที่อยู่พัสดุ
      </Typography>

      {/* ฟิลด์ค้นหา */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <TextField
          label='เลขฟิล์ม'
          name='filmNo'
          value={formData.filmNo}
          onChange={handleInputChange}
          variant='outlined'
          size='small'
          sx={{ maxWidth: '200px', mr: 2 }}
        />

        <TextField
          label='เลขใบจอง'
          name='orderNumber'
          value={formData.orderNumber}
          onChange={handleInputChange}
          variant='outlined'
          size='small'
          sx={{ maxWidth: '200px', mr: 2 }}
        />

        <TextField
          label='ชื่อผู้รับปริญญา'
          name='customerName'
          value={formData.customerName}
          onChange={handleInputChange}
          variant='outlined'
          size='small'
          sx={{ maxWidth: '200px', mr: 2 }}
        />

        <FormControl sx={{ maxWidth: '150px', mr: 2 }}>
          <InputLabel id='parcel-set-label'>ชุด</InputLabel>
          <Select
            labelId='parcel-set-label'
            name='parcelSet'
            value={formData.parcelSet}
            onChange={handleInputChange}
            size='small'
            label='ชุด'
          >
            <MenuItem value='ทุกชุด'>ทุกชุด</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ maxWidth: '150px', mr: 2 }}>
          <InputLabel id='status-label'>สถานะ</InputLabel>
          <Select
            labelId='status-label'
            name='status'
            value={formData.status}
            onChange={handleInputChange}
            size='small'
            label='สถานะ'
          >
            <MenuItem value='ทั้งหมด'>ทั้งหมด</MenuItem> {/* ตัวเลือกทั้งหมด */}
            <MenuItem value='ยังไม่ได้พิมพ์'>ยังไม่ได้พิมพ์</MenuItem>
            <MenuItem value='พิมพ์แล้ว'>พิมพ์แล้ว</MenuItem>
          </Select>
        </FormControl>

        <Button variant='contained' color='primary' onClick={handleSearch} sx={{ mb: 2 }}>
          ค้นหา
        </Button>
      </Box>

      {/* Dropdown สำหรับเลือกจำนวนรายการที่ต้องการพิมพ์ */}
      <FormControl sx={{ maxWidth: '150px', mb: 2 }}>
        <InputLabel id='print-limit-label'>จำนวนที่ต้องการพิมพ์</InputLabel>
        <Select
          className='mr-3'
          labelId='print-limit-label'
          value={printLimit}
          onChange={handlePrintLimitChange}
          size='small'
          label='จำนวนที่ต้องการพิมพ์'
        >
          <MenuItem value={10}>10 รายการ</MenuItem>
          <MenuItem value={100}>100 รายการ</MenuItem>
          <MenuItem value={500}>500 รายการ</MenuItem>
          <MenuItem value={10000}>ทั้งหมด</MenuItem> {/* เปลี่ยนค่าของ "ทั้งหมด" เป็น 10000 */}
        </Select>
      </FormControl>

      {/* ปุ่มพิมพ์ */}
      <Button variant='contained' color='primary' onClick={handlePrint} sx={{ mb: 2 }}>
        Print ที่อยู่
      </Button>

      {/* Loading Spinner */}
      {isLoading ? (
        <Box display='flex' justifyContent='center'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ตารางแสดงข้อมูล */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขฟิล์ม</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขใบจอง</StyledTableHeadCell>
                  <StyledTableHeadCell>ชื่อผู้รับปริญญา</StyledTableHeadCell>
                  <StyledTableHeadCell>ชื่อผู้รับของ</StyledTableHeadCell>
                  <StyledTableHeadCell>ที่อยู่</StyledTableHeadCell>
                  <StyledTableHeadCell>เบอร์โทร</StyledTableHeadCell>
                  <StyledTableHeadCell>ชุด</StyledTableHeadCell>
                  <StyledTableHeadCell>วันที่พิมพ์</StyledTableHeadCell>
                  <StyledTableHeadCell>สถานะ</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(currentItems) && currentItems.length > 0 ? (
                  currentItems.map((row, index) => (
                    <TableRow key={index}>
                      <StyledTableCell>{indexOfFirstItem + index + 1}</StyledTableCell>
                      <StyledTableCell>{row.film_no || '-'}</StyledTableCell>
                      <StyledTableCell>{row.booking_no}</StyledTableCell>
                      <StyledTableCell>{row.name_for_rec}</StyledTableCell>
                      <StyledTableCell>{row.name_for_rec}</StyledTableCell>
                      <StyledTableCell>
                        {`${row.addno || ''} หมู่ ${row.moo || ''} ซอย ${row.soi || ''} ถนน ${row.road || ''} ตำบล ${row.tumbol || ''} อำเภอ ${row.amphur || ''} จังหวัด ${row.province || ''} รหัสไปรษณีย์ ${row.zip || ''}`}
                      </StyledTableCell>
                      <StyledTableCell>{row.tel || '-'}</StyledTableCell>
                      <StyledTableCell>{row.set || '-'}</StyledTableCell>
                      <StyledTableCell>{formatDate(row.print_date || '-')}</StyledTableCell>
                      <StyledTableCell>
                        {row.print_status === 'Y' ? 'พิมพ์แล้ว' : 'ยังไม่ได้พิมพ์' || '-'}
                      </StyledTableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <StyledTableCell colSpan={10} align='center'>
                      ไม่มีข้อมูล
                    </StyledTableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display='flex' justifyContent='center' mt={2}>
            <Pagination
              count={Math.ceil(filteredRows.length / itemsPerPage)} // จำนวนหน้าทั้งหมด
              page={currentPage} // หน้าปัจจุบัน
              onChange={handlePageChange} // เปลี่ยนหน้า
              color='primary'
            />
          </Box>
        </>
      )}

      {/* สไตล์พิเศษสำหรับการพิมพ์ */}
      <style jsx>{`
        @media print {
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
