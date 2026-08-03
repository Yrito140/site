import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // standalone нужен только для Docker-образа. На Vercel он лишний,
  // поэтому включается через переменную сборки.
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' as const } : {}),
  images: {
    // Локальные загрузки отдаются как есть; оптимизация не нужна для /uploads.
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
}

export default withNextIntl(nextConfig)
