import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      return token?.user?.role === 'admin'
    }
  },
  pages: {
    signIn: '/admin/auth'
  }
})

export const config = { matcher: ['/admin((?!admin/auth).*)'] }
