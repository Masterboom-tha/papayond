'use client'
import React, { useState, useEffect } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import { green } from '@mui/material/colors'

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [product, setproduct] = useState([])

  const itemsPerPage = 8

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        const response = await axios.get('/api/product')

        setproduct(response.data.products)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchproduct()
  }, [])

  const totalPages = Math.ceil(product.length / itemsPerPage)

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  const paginatedProduct = product.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    status === 'authenticated' &&
    session.user && (
      <div className='container mx-auto p-4'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl font-bold'>หน้าจัดการรายการสินค้า</h2>

            <p className='text-gray-600'>
              A list of all the users in your account including their name, title, email and role.
            </p>
          </div>
          <Button variant='contained'>
            <Link href={'product/newproducts'}>Add product</Link>
          </Button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className=''>
                <th className='p-3 text-left'>Name</th>
                <th className='p-3 text-left hidden md:table-cell'>description</th>
                <th className='p-3 text-left hidden md:table-cell'>quantity</th>
                <th className='p-3 text-left hidden md:table-cell'>price</th>
                <th className='p-3 text-left'>image</th>
                <th className='p-3 text-left'>ตัวเลือก</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProduct.map((product, index) => (
                <tr key={index} className='border-b'>
                  <td className='p-3'>
                    <div>{product.name}</div>
                  </td>
                  <td className='p-3 hidden md:table-cell'>{product.description}</td>
                  <td className='p-3 hidden md:table-cell'>{product.quantity}</td>
                  <td className='p-3 hidden md:table-cell'>{product.price}</td>
                  <td className='p-3'>{product.image}</td>
                  <td className='p-3'>
                    <IconButton>
                      <SettingsIcon sx={{ color: green[500] }}>
                        <a href=''></a>
                      </SettingsIcon>
                    </IconButton>

                    <IconButton aria-label='delete'>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex justify-center mt-4'>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              variant='contained'
              key={index}
              className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    )
  )
}
