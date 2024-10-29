'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
  styled,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Link
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '1.3rem',
  cursor: 'pointer'
}))

const UpdateByCell = styled(TableCell)(({ theme }) => ({
  maxWidth: '150px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontWeight: 'bold',
  fontSize: '1.1rem'
}))

const RecordFilmAndReservation = () => {
  const [universities, setUniversities] = useState([])
  const [filteredUniversities, setFilteredUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const uni_id = searchParams.get('uni_id')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'fname', direction: 'ascending' })
  const router = useRouter()

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true)
      try {
        let response = { data: { data: [] } }

        if (uni_id) {
          response = await axios.get(`/api/orderlist?uni_id=${uni_id}`)
        }

        if (response.data.data.length === 0) {
          const storedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))

          if (storedUniversity && (!uni_id || storedUniversity.uni_id === parseInt(uni_id))) {
            response = await axios.get(`/api/orderlist?uni_id=${storedUniversity.uni_id}`)
          }
        }

        if (response.data.data.length > 0) {
          setUniversities(response.data.data)
          setFilteredUniversities(response.data.data)
          setTotalPages(Math.ceil(response.data.data.length / itemsPerPage))
        } else {
          setUniversities([])
          setFilteredUniversities([])
          setTotalPages(1)
        }

        setLoading(false)
      } catch (err) {
        setError('Failed to fetch universities')
        setLoading(false)
      }
    }

    fetchUniversities()
  }, [uni_id, itemsPerPage])

  useEffect(() => {
    let results = universities.filter(university =>
      Object.values(university).some(
        value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    // Apply sorting
    results.sort((a, b) => {
      if (sortConfig.direction === 'ascending') {
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
      } else {
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
      }
    })

    setFilteredUniversities(results)
    setTotalPages(Math.ceil(results.length / itemsPerPage))
    setPage(1)
  }, [searchTerm, universities, sortConfig])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleItemsPerPageChange = event => {
    setItemsPerPage(event.target.value)
    setPage(1)
  }

  const handleDeleteReservation = async id => {
    try {
      await axios.delete(`/api/orderlist/${id}`)
      console.log('Deleted successfully')
      // หลังจากลบสำเร็จ คุณอาจต้องการอัปเดตสถานะหรือดึงข้อมูลใหม่
    } catch (error) {
      console.error('Error deleting reservation:', error.response ? error.response.data : error.message)
    }
  }

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  const handleSort = key => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }))
  }

  const handleFilmNoChange = (id, value) => {
    setUniversities(prev =>
      prev.map(university => (university.id === id ? { ...university, film_no: value } : university))
    )
  }

  const handleBookingNoChange = (id, value) => {
    setUniversities(prev =>
      prev.map(university => (university.id === id ? { ...university, booking_no: value } : university))
    )
  }

  const handleUpdate = async (id, film_no, booking_no) => {
    try {
      const session = await getSession()
      const update_by = session?.user?.name || 'Unknown'

      // Get uni_id from sessionStorage or searchParams
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = selectedUniversity?.uni_id || searchParams.get('uni_id')

      console.log('Sending data to API:', { id, film_no, booking_no, update_by, uni_id })

      await axios.put('/api/orderlist', { id, film_no, booking_no, update_by, uni_id })
      console.log('Updated successfully')
    } catch (error) {
      console.error('Error updating reservation:', error.response ? error.response.data : error.message)
    }
  }

  const handleKeyPress = (event, id, film_no, booking_no) => {
    if (event.key === 'Enter') {
      handleUpdate(id, film_no, booking_no)
    }
  }

  const handleViewDetails = id => {
    router.push(`/reservation_information?id=${id}`)
  }

  const paginatedUniversities = filteredUniversities.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 2 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Order List
      </Typography>
      {error && (
        <Typography color='error' align='center'>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label='Search'
          variant='outlined'
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '300px' }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id='items-per-page-label'>Items per page</InputLabel>
          <Select
            labelId='items-per-page-label'
            value={itemsPerPage}
            label='Items per page'
            onChange={handleItemsPerPageChange}
          >
            {[...Array(8)].map((_, index) => (
              <MenuItem key={index} value={index + 8}>
                {index + 8}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='university table'>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell onClick={() => handleSort('fname')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  ชื่อ-นามสกุล
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'fname' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell onClick={() => handleSort('film_no')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  เลขฟิล์ม
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'film_no' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell onClick={() => handleSort('booking_no')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  เลขใบจอง
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'booking_no' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell onClick={() => handleSort('update_by')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Update By
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'update_by' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell>จัดการ</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUniversities.length > 0 ? (
              paginatedUniversities.map(university => (
                <TableRow key={university.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <StyledTableCell component='th' scope='row'>
                    <Link
                      href='#'
                      onClick={() => handleViewDetails(university.id)}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {`${university.fname || ''} ${university.lname || ''}`}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TextField
                      variant='outlined'
                      size='small'
                      value={university.film_no || ''}
                      onChange={e => handleFilmNoChange(university.id, e.target.value)}
                      onBlur={e => handleUpdate(university.id, e.target.value, university.booking_no)}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // กำหนดให้ใส่ได้เฉพาะตัวเลข
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <TextField
                      variant='outlined'
                      size='small'
                      value={university.booking_no || ''}
                      onChange={e => handleBookingNoChange(university.id, e.target.value)}
                      onBlur={e => handleUpdate(university.id, university.film_no, e.target.value)}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // กำหนดให้ใส่ได้เฉพาะตัวเลข
                    />
                  </StyledTableCell>

                  <UpdateByCell>{`${university.update_by || ''} ${university.update_date || ''}`}</UpdateByCell>
                  <StyledTableCell>
                    <Button
                      variant='contained'
                      color='secondary'
                      onClick={() => handleDeleteReservation(university.id)}
                    >
                      ลบใบจอง
                    </Button>
                  </StyledTableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color='primary' />
      </Box>
    </Box>
  )
}

export default RecordFilmAndReservation
