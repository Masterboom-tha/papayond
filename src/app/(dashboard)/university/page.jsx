'use client'
import React, { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import { green } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.1rem',
  padding: '16px'
}))

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '1.2rem'
}))

const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: '1rem',
  padding: '8px 16px'
}))

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [universities, setUniversities] = useState([])

  const itemsPerPage = 8

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('/api/university')

        setUniversities(response.data.university)
      } catch (error) {
        console.error('Error fetching universities:', error)
      }
    }

    fetchUniversities()
  }, [])

  const totalPages = Math.ceil(universities.length / itemsPerPage)

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const paginatedUniversities = universities.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    status === 'authenticated' &&
    session.user && (
      <Box className='container mx-auto p-4'>
        <Box className='flex justify-between items-center mb-4'>
          <div>
            <Typography variant='h4' component='h2' gutterBottom>
              หน้าจัดการรายชื่อมหาวิทยาลัย
            </Typography>
            <Typography variant='body1' className='text-gray-600'>
              เพิ่ม ลบ แก้ไข รายชื่อมหาวิทยาลัยรวมไปถึง คณะ และ สาขา
            </Typography>
          </div>
          <StyledButton variant='contained' component={Link} href='product/newproducts'>
            Add University
          </StyledButton>
        </Box>

        <TableContainer component={Paper} className='shadow-lg rounded-lg'>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Name</StyledTableHeadCell>
                <StyledTableHeadCell className='hidden md:table-cell'>คณะ</StyledTableHeadCell>
                <StyledTableHeadCell className='hidden md:table-cell'>สาขา</StyledTableHeadCell>
                <StyledTableHeadCell className='hidden md:table-cell'>ปี</StyledTableHeadCell>
                <StyledTableHeadCell>ตัวเลือก</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUniversities.map((university, index) => (
                <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <StyledTableCell>{university.name}</StyledTableCell>
                  <StyledTableCell className='hidden md:table-cell'>{university.major}</StyledTableCell>
                  <StyledTableCell className='hidden md:table-cell'>{university.minor}</StyledTableCell>
                  <StyledTableCell className='hidden md:table-cell'>{university.years}</StyledTableCell>
                  <StyledTableCell>
                    <IconButton>
                      <SettingsIcon sx={{ color: green[500] }} />
                    </IconButton>
                    <IconButton aria-label='delete'>
                      <DeleteIcon color='error' />
                    </IconButton>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color='primary' size='large' />
        </Box>
      </Box>
    )
  )
}
