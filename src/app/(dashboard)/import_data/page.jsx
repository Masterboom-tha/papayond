'use client'
import React, { useState } from 'react'
import Papa from 'papaparse'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import { getSession } from 'next-auth/react'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.1rem',
  padding: '16px',
  fontWeight: 'bold'
}))

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '1.2rem'
}))

const CsvImportComponent = () => {
  const [csvData, setCsvData] = useState(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('ยังไม่ได้อัพโหลด')
  const [loading, setLoading] = useState(false) // สถานะการโหลด
  const [alertMessage, setAlertMessage] = useState('') // ข้อความแจ้งเตือน
  const [alertType, setAlertType] = useState('success') // ประเภทของการแจ้งเตือน
  const [alertOpen, setAlertOpen] = useState(false) // สถานะของ Snackbar
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const tableHeaders = ['คำนำหน้าชื่อ', 'ชื่อ', 'นามสกุล', 'รหัส', 'คณะ', 'สถานะ']

  const handleFileUpload = event => {
    const file = event.target.files[0]
    Papa.parse(file, {
      complete: results => {
        const updatedData = results.data
          .filter(row => row.some(cell => cell !== '')) // กรองบรรทัดที่ว่างออก
          .map(row => {
            const [, ...rowData] = row
            return rowData
          })

        const formattedData = updatedData.map(row => {
          return tableHeaders.reduce((obj, key, i) => ({ ...obj, [key]: row[i] }), {})
        })

        setCsvData(formattedData)
        setIsDataLoaded(true)
        setCurrentPage(1) // รีเซ็ตหน้าเป็นหน้าแรกเมื่ออัปโหลดไฟล์ใหม่
      },
      error: error => {
        console.error('Error parsing CSV file:', error)
      }
    })
  }

  const handleSaveData = async () => {
    try {
      setLoading(true) // เริ่มโหลด
      const sessionData = await getSession()

      if (!sessionData) {
        console.error('No session found, please log in.')
        setLoading(false)
        setAlertMessage('กรุณาเข้าสู่ระบบ')
        setAlertType('error')
        setAlertOpen(true)
        return
      }

      const user_id = sessionData.user.id // ดึง user_id จาก session
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))

      const response = await fetch('/api/save-csv-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          csvData,
          selectedUniversity,
          user_id
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setUploadStatus('อัพโหลดข้อมูลสำเร็จ')
      setAlertMessage('อัพโหลดข้อมูลสำเร็จ')
      setAlertType('success')
    } catch (error) {
      console.error('Error saving data:', error)
      setUploadStatus('อัพโหลดข้อมูลล้มเหลว')
      setAlertMessage('อัพโหลดข้อมูลล้มเหลว')
      setAlertType('error')
    } finally {
      setLoading(false) // หยุดโหลดเมื่อเสร็จสิ้น
      setAlertOpen(true) // เปิด Snackbar
    }
  }

  const handleCloseAlert = () => {
    setAlertOpen(false)
  }

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = csvData ? Math.ceil(csvData.length / itemsPerPage) : 1

  // เลือกข้อมูลที่จะแสดงในหน้าปัจจุบัน
  const currentData = csvData ? csvData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : []

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 2 }}>
      <h2>นำเข้าไฟล์ CSV</h2>
      <Button variant='contained' component='label' sx={{ mb: 2 }}>
        เลือกไฟล์
        <input type='file' accept='.csv' hidden onChange={handleFileUpload} />
      </Button>
      <br />
      <br />
      <Button
        variant='contained'
        color='primary'
        onClick={handleSaveData}
        disabled={!isDataLoaded || loading} // ปิดการใช้งานปุ่มเมื่อโหลด
        startIcon={loading && <CircularProgress size={24} />} // แสดงการโหลด
      >
        บันทึกข้อมูลลงฐานข้อมูล
      </Button>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // ตำแหน่งเดิมที่ top right
        sx={{ mt: 14 }} // เพิ่ม margin-top
      >
        <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label='csv data table'>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header, index) => (
                <StyledTableHeadCell key={index}>{header}</StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {tableHeaders.map((header, cellIndex) => (
                    <StyledTableCell key={cellIndex}>{header === 'สถานะ' ? uploadStatus : row[header]}</StyledTableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableCell colSpan={tableHeaders.length} align='center'>
                  ยังไม่มีข้อมูล
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            variant={index + 1 === currentPage ? 'contained' : 'outlined'}
            onClick={() => handlePageChange(index + 1)}
            sx={{
              mx: 1,
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '50%',
              padding: 0,
              textAlign: 'center'
            }}
          >
            {index + 1}
          </Button>
        ))}
      </Box>
    </Box>
  )
}

export default CsvImportComponent
