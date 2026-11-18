import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByUsername } from './db/queries'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      async authorize(input) {
        const username = typeof input?.username === 'string' ? input.username.toLowerCase().trim() : ''
        const password = typeof input?.password === 'string' ? input.password : ''
        const user = username && password ? await getUserByUsername(username) : undefined
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null
        return { id: String(user.id), name: user.name, username: user.username }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.userId = user.id; token.username = user.username }
      return token
    },
    session({ session, token }) {
      if (session.user) { session.user.id = token.userId || ''; session.user.username = token.username || '' }
      return session
    },
  },
})
