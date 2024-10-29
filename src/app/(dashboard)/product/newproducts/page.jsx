'use client'

import { useEffect, useState } from 'react'

import { useRouter, redirect } from 'next/navigation'

import { styled } from '@mui/system'
import { useSession } from 'next-auth/react'
import Button from '@mui/material/Button'

import axios from 'axios'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

export default function Profile() {
  const { data: session, status } = useSession()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const router = useRouter()
  const parsedQuantity = parseInt(quantity, 10)

  async function createProduct(ev) {
    ev.preventDefault()
    const data = { name, description, price, quantity: parsedQuantity, userId: session.user.id }

    await axios.post('/api/product', data)
    router.push('/product')
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const cancelButton = () => {
    router.push('/product')
  }

  // When after loading success and have session, show profile
  return (
    status === 'authenticated' &&
    session.user && (
      <div className='container mx-auto p-4'>
        <div className='bg-white p-6 rounded-md shadow-md'>
          <p>
            Welcome, <b>{session.user.name}</b>
          </p>
          <p>{session.user.role}</p>
          <p>
            Welcome, <b>{session.user.id}</b>
          </p>
          <form onSubmit={createProduct}>
            <div>
              <label htmlFor='product_name' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Product name
              </label>
              <input
                type='text'
                id='product_name'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Product name'
                value={name}
                onChange={ev => setName(ev.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='price' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Price
              </label>
              <input
                type='number'
                id='price'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Price'
                value={price}
                onChange={ev => setPrice(ev.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='quantity' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                quantity
              </label>
              <input
                type='number'
                id='quantity'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='quantity'
                value={quantity}
                onChange={ev => setQuantity(ev.target.value)}
                required
              />
            </div>
            <Button
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Upload file
              <VisuallyHiddenInput type='file' />
            </Button>
            <div>
              <label htmlFor='description' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Detail
              </label>
              <textarea
                id='description'
                rows='4'
                className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='รายละเอียด'
                value={description}
                onChange={ev => setDescription(ev.target.value)}
              ></textarea>
            </div>
            <Button onClick={cancelButton} variant='outlined' type='reset'>
              ยกเลิก
            </Button>
            <Button variant='contained' type='submit'>
              Save
            </Button>
          </form>
        </div>
      </div>
    )
  )
}
