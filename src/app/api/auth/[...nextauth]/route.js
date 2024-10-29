import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import mysql from 'mysql2/promise'

// สร้างฟังก์ชันสำหรับเชื่อมต่อกับ MySQL
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials) return null

        const conn = await dbConnect()
        try {
          const [rows] = await conn.execute('SELECT * FROM users WHERE username = ?', [credentials.username])
          const user = rows[0]
          console.log('User found:', user)

          if (user && credentials.password === user.password) {
            // ไม่แนะนำให้เก็บรหัสผ่านแบบ plaintext ในการใช้งานจริง
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              username: user.username
            }
          } else {
            throw new Error('Invalid username or password')
          }
        } finally {
          await conn.end()
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 10 * 60 * 60
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
        token.username = user.username
        token.email = user.email
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.role = token.role
        session.user.username = token.username
        session.user.email = token.email
      }
      return session
    }
  },
  pages: {
    signIn: '/login' // ถ้าคุณมีหน้า login ที่กำหนดเอง
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
