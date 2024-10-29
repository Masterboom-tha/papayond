// src/app/layout.jsx

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Import SessionProvider and getServerSession
import { getServerSession } from 'next-auth'

import SessionProvider from '../components/SessionProvider'

// Import AuthGuard component
import AuthGuard from '../components/AuthGuard'

export const metadata = {
  title: 'Vuexy - MUI Next.js Admin Dashboard Template',
  description:
    'Vuexy - MUI Next.js Admin Dashboard Template - is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.'
}

const RootLayout = async ({ children }) => {
  // Vars
  const direction = 'ltr'
  const session = await getServerSession()

  return (
    <html id='__next' lang='en' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <SessionProvider session={session}>
          <AuthGuard>{children}</AuthGuard>
        </SessionProvider>
      </body>
    </html>
  )
}

export default RootLayout
