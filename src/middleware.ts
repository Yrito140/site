import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth/config'

const { auth } = NextAuth(authConfig)

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = Boolean(req.auth?.user)
  const isPublic = PUBLIC_PATHS.includes(pathname)

  if (!isLoggedIn && !isPublic) {
    const url = new URL('/login', req.nextUrl.origin)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Авторизованному незачем видеть формы входа и регистрации.
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin))
  }

  if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  // Файлы с расширением (иконки, манифест, загрузки) middleware не трогает:
  // иначе они уходят в редирект на /login и не отдаются браузеру.
  matcher: ['/((?!api|_next/static|_next/image|uploads|.*\\.[\\w]+$).*)'],
}
