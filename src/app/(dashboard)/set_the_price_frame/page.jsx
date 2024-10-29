'use client'

import React, { useState, useEffect } from 'react'

import axios from 'axios'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import SettingsIcon from '@mui/icons-material/Settings'

// Styled components
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
  padding: '8px 16px',
  minWidth: 'auto'
}))

export default function SetFramePrice() {
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [categories, setCategories] = useState([])
  const [sets, setSets] = useState([])
  const [activeSection, setActiveSection] = useState('size')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const sizeResponse = await axios.get('/api/frame-sizes')
      const colorResponse = await axios.get('/api/frame-colors')
      const categoryResponse = await axios.get('/api/frame-categories')
      const setsResponse = await axios.get('/api/frame-sets')

      setSizes(sizeResponse.data.frameSize || [])
      setColors(colorResponse.data.FrameColor || [])
      setCategories(categoryResponse.data.FrameCategory || [])
      setSets(setsResponse.data.FrameSet || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNameById = (array, id) => {
    const item = array.find(item => item.id === id)

    return item ? item.name : 'Unknown'
  }

  const handleAdd = type => {
    console.log(`Add new ${type}`)
  }

  const handleEdit = id => {
    console.log(`Edit item with id: ${id}`)
  }

  const handleDelete = id => {
    console.log(`Delete item with id: ${id}`)
  }

  const renderActionButtons = id => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <StyledButton variant='contained' color='primary' onClick={() => handleEdit(id)}>
        <SettingsIcon />
      </StyledButton>
      <StyledButton variant='contained' color='error' onClick={() => handleDelete(id)}>
        Delete
      </StyledButton>
    </Box>
  )

  const renderSkeletonRows = count => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <TableRow key={index}>
          <StyledTableCell>
            <Skeleton animation='wave' />
          </StyledTableCell>
          <StyledTableCell>
            <Skeleton animation='wave' />
          </StyledTableCell>
          <StyledTableCell align='right'>
            <Skeleton animation='wave' width={100} />
          </StyledTableCell>
        </TableRow>
      ))
  }

  const renderSection = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton variant='rectangular' width={120} height={36} style={{ marginBottom: '20px' }} />
          <TableContainer component={Paper} className='shadow-lg rounded-lg'>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
                  <StyledTableHeadCell align='right'>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderSkeletonRows(5)}</TableBody>
            </Table>
          </TableContainer>
        </>
      )
    }

    switch (activeSection) {
      case 'size':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('size')}
              style={{ marginBottom: '20px' }}
            >
              Add Size
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Size</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sizes.map((size, index) => (
                    <TableRow key={size.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{size.name}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(size.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      case 'color':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('color')}
              style={{ marginBottom: '20px' }}
            >
              Add Color
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Color</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colors.map((color, index) => (
                    <TableRow key={color.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{color.name}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(color.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      case 'category':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('category')}
              style={{ marginBottom: '20px' }}
            >
              Add Category
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Category</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow key={category.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{category.name}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(categories.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      case 'sets':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('set')}
              style={{ marginBottom: '20px' }}
            >
              Add Set
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Size</StyledTableHeadCell>
                    <StyledTableHeadCell>Color</StyledTableHeadCell>
                    <StyledTableHeadCell>Category</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets.map((set, index) => (
                    <TableRow key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{getNameById(sizes, set.frameSizeId)}</StyledTableCell>
                      <StyledTableCell>{getNameById(colors, set.frameColorId)}</StyledTableCell>
                      <StyledTableCell>{getNameById(categories, set.frameCategoryId)}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(set.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Box p={4}>
      <Typography variant='h3' component='h1' gutterBottom>
        {isLoading ? <Skeleton width='50%' /> : 'กำหนดค่า'}
      </Typography>
      <Typography variant='h6' className='text-gray-600 mb-6'>
        {isLoading ? <Skeleton width='70%' /> : 'เพิ่ม ลบ แก้ไข รายการ กรอบ สี ขนาด และ ราคาชุดภาพ'}
      </Typography>
      <Box mb={4} display='flex' gap={2}>
        {isLoading ? (
          <>
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
          </>
        ) : (
          <>
            <StyledButton
              variant={activeSection === 'size' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('size')}
            >
              Sizes
            </StyledButton>
            <StyledButton
              variant={activeSection === 'color' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('color')}
            >
              Colors
            </StyledButton>
            <StyledButton
              variant={activeSection === 'category' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('category')}
            >
              Categories
            </StyledButton>
            <StyledButton
              variant={activeSection === 'sets' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('sets')}
            >
              Sets
            </StyledButton>
          </>
        )}
      </Box>
      {renderSection()}
    </Box>
  )
}
