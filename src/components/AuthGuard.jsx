// src/components/AuthGuard.jsx
'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

const AuthGuard = ({ children }) => {
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      router.push('/login')
    }
  }, [session, router])

  if (session.status === 'loading') {
    return <div>Loading...</div> // You can replace this with a loading spinner if you want
  }

  return children
}

export default AuthGuard
