import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { getLocale } from '@/lib/i18n/locale'
import { ToastProvider } from '@/components/ui/Toast'
import { CookieBanner } from '@/components/layout/CookieBanner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marafon — питание и тренировки',
  description:
    'Персональный расчёт калорий и БЖУ, недельное меню под вашу цель, трекинг веса и тренировок.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ToastProvider>
              {children}
              <CookieBanner />
            </ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
