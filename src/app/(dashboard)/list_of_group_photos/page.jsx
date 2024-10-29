'use client'
import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  styled,
  TableCell
} from '@mui/material'
import axios from 'axios'

// Styled table cell for the body, without adjusting font size
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  fontWeight: 'bold'
}))

// Styled table cell for the header, maintaining the theme's primary color
const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white
}))

const FileDataTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [currentPage, setCurrentPage] = useState(1) // สำหรับการควบคุมหน้า
  const rowsPerPage = 10 // จำนวนรายการต่อหน้า

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูล selectedUniversity จาก sessionStorage
        const storedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
        setSelectedUniversity(storedUniversity) // กำหนดค่าให้ selectedUniversity

        if (!storedUniversity || !storedUniversity.uni_id) {
          console.error('Missing selectedUniversity or uni_id in sessionStorage')
          return
        }

        // ส่ง uni_id ในการเรียก API
        const response = await axios.post('/api/groupphoto', { uni_id: storedUniversity.uni_id })
        setData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ฟังก์ชันคำนวณรายการในแต่ละหน้า
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow)

  // ฟังก์ชันเปลี่ยนหน้า
  const handleNextPage = () => {
    if (currentPage * rowsPerPage < data.length) {
      setCurrentPage(prevPage => prevPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1)
    }
  }

  // ฟังก์ชันอัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลงใน input fields
  const handleInputChange = (rowId, field, value) => {
    setData(prevData =>
      prevData.map(row =>
        row.id === rowId
          ? {
              ...row,
              [field]: value // อัปเดตฟิลด์ที่เปลี่ยน
            }
          : row
      )
    )
  }

  if (loading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <div>
      <Typography variant='h4' gutterBottom>
        {selectedUniversity?.uniname} ปีการศึกษา {selectedUniversity?.uni_year}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell></StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
              <StyledTableHeadCell align='center' colSpan={3}>
                รอบที่ 1
              </StyledTableHeadCell>
              <StyledTableHeadCell align='center' colSpan={3}>
                รอบที่ 2
              </StyledTableHeadCell>
              <StyledTableHeadCell align='center' colSpan={3}>
                รอบที่ 3
              </StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
            </TableRow>
            <TableRow>
              <StyledTableHeadCell align='center'>รหัส</StyledTableHeadCell>
              <StyledTableHeadCell>ชื่อ</StyledTableHeadCell>
              {/* ช่องของ รอบที่ 1 */}
              <StyledTableHeadCell align='center'>หมู่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>แถวที่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>ลำดับ</StyledTableHeadCell>
              {/* ช่องของ รอบที่ 2 */}
              <StyledTableHeadCell align='center'>หมู่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>แถวที่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>ลำดับ</StyledTableHeadCell>
              {/* ช่องของ รอบที่ 3 */}
              <StyledTableHeadCell align='center'>หมู่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>แถวที่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>ลำดับ</StyledTableHeadCell>
              <StyledTableHeadCell>เลขฟิล์ม</StyledTableHeadCell>
              <StyledTableHeadCell>update</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map(row => {
              return (
                <TableRow key={row.id}>
                  <StyledTableCell>{row.id}</StyledTableCell>
                  <StyledTableCell>{`${row.fname} ${row.lname}`}</StyledTableCell>

                  {/* รอบที่ 1 */}
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_1 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_1', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_2 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_2', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_3 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_3', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>

                  {/* รอบที่ 2 */}
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_4 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_4', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_5 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_5', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_6 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_6', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>

                  {/* รอบที่ 3 */}
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_7 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_7', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_8 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_8', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <TextField
                      value={row.posiphoto_9 || ''}
                      onChange={e => handleInputChange(row.id, 'posiphoto_9', e.target.value)}
                      variant='outlined'
                      size='small'
                    />
                  </StyledTableCell>

                  <StyledTableCell>{row.film_no}</StyledTableCell>
                  <StyledTableCell>{`${row.update_by} ${new Date(row.update_date).toLocaleString()}`}</StyledTableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ปุ่มเปลี่ยนหน้า */}
      <Box mt={2} display='flex' justifyContent='center'>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          ก่อนหน้า
        </Button>
        <Typography variant='body1' sx={{ mx: 2 }}>
          หน้าที่ {currentPage} จาก {Math.ceil(data.length / rowsPerPage)}
        </Typography>
        <Button onClick={handleNextPage} disabled={currentPage * rowsPerPage >= data.length}>
          ถัดไป
        </Button>
      </Box>
    </div>
  )
}

export default FileDataTable
