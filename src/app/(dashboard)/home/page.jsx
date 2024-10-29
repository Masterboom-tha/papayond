'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Pagination from '@mui/material/Pagination'
import { useRouter } from 'next/navigation'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import IconButton from '@mui/material/IconButton'

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

const FacultyCell = styled(TableCell)(({ theme }) => ({
  maxWidth: '150px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}))

const UniversityPage = () => {
  const router = useRouter()
  const [universities, setUniversities] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUniversities, setFilteredUniversities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [sortOrder, setSortOrder] = useState('asc')
  const itemsPerPage = 8

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const response = await axios.get('/api/university')
        setUniversities(response.data.universities)
        const uniqueYears = [...new Set(response.data.universities.map(uni => uni.uni_year))].sort()
        setYears(uniqueYears)
      } catch (error) {
        console.error('Error fetching universities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let results = universities.filter(
      university =>
        university.uniname.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedYear === '' || university.uni_year === selectedYear)
    )

    // Apply sorting
    results.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.uni_year - b.uni_year
      } else {
        return b.uni_year - a.uni_year
      }
    })

    setFilteredUniversities(results)
    setTotalPages(Math.ceil(results.length / itemsPerPage))
    setPage(1) // Reset to first page when filter or sort changes
  }, [searchQuery, selectedYear, universities, sortOrder])

  const handleYearChange = event => {
    setSelectedYear(event.target.value)
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleViewDetails = university => {
    sessionStorage.setItem(
      'selectedUniversity',
      JSON.stringify({
        uni_id: university.id,
        uniname: university.uniname,
        uni_year: university.uni_year
      })
    )

    const params = new URLSearchParams({
      uni_id: university.id,
      uniname: university.uniname,
      uni_year: university.uni_year
    })
    router.push(`/order_list?${params.toString()}`)
  }

  const handleSortChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'))
  }

  const paginatedUniversities = filteredUniversities.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const renderSkeleton = () => (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant='rectangular' width={300} height={56} sx={{ borderRadius: 1 }} />
        <Skeleton variant='rectangular' width={200} height={56} sx={{ borderRadius: 1 }} />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='university table'>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>
                <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
              </StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(8)].map((_, index) => (
              <TableRow key={index}>
                <StyledTableCell>
                  <Skeleton variant='text' sx={{ fontSize: '1.1rem' }} />
                </StyledTableCell>
                <StyledTableCell>
                  <Skeleton variant='text' sx={{ fontSize: '1.1rem' }} />
                </StyledTableCell>
                <StyledTableCell>
                  <Skeleton variant='rectangular' width={150} height={36} sx={{ borderRadius: 1 }} />
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Skeleton variant='rectangular' width={300} height={36} sx={{ borderRadius: 16 }} />
      </Box>
    </Box>
  )

  if (isLoading) {
    return renderSkeleton()
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <form>
          <label htmlFor='search' style={{ display: 'none' }}>
            Search
          </label>
          <Box sx={{ position: 'relative' }}>
            <input
              type='search'
              id='search'
              placeholder='ค้นหารายชื่อมหาวิทยาลัย'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 16px',
                fontSize: '1rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </Box>
        </form>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id='year-select-label'>กำหนดปีที่ต้องการค้นหา</InputLabel>
          <Select
            labelId='year-select-label'
            id='year-select'
            value={selectedYear}
            label='Filter by Year'
            onChange={handleYearChange}
          >
            <MenuItem value=''>
              <em>All Years</em>
            </MenuItem>
            {years.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='university table'>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>รายชื่อมหาวิทยาลัย</StyledTableHeadCell>
              <StyledTableHeadCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleSortChange}>
                  ปีการศึกษา
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell>จัดการ</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUniversities.map(university => (
              <TableRow key={university.id}>
                <StyledTableCell>{university.uniname}</StyledTableCell>
                <FacultyCell>{university.uni_year}</FacultyCell>
                <TableCell>
                  <Button variant='contained' color='primary' onClick={() => handleViewDetails(university)}>
                    ดูรายละเอียด
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color='primary' />
      </Box>
    </Box>
  )
}

export default UniversityPage
