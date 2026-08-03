import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-совместимая часть конфига: без Prisma и bcrypt, поэтому её можно
 * импортировать в middleware. Провайдеры добавляются в Node-части.
 */
export const authConfig = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'USER'
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = (token.role as 'USER' | 'ADMIN') ?? 'USER'
      }
      return session
    },
  },
} satisfies NextAuthConfig
