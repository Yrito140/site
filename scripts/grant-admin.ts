/**
 * Выдаёт права администратора по email. Идемпотентно, ничего не удаляет —
 * в отличие от seed, безопасно запускать на продакшене.
 *
 * Локально:  npx tsx scripts/grant-admin.ts yritoq@gmail.com
 * На Vercel: DATABASE_URL="postgres://…" npx tsx scripts/grant-admin.ts yritoq@gmail.com
 *
 * Пользователь должен существовать — сначала зарегистрируйтесь на сайте.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Укажите email: npx tsx scripts/grant-admin.ts user@example.com')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`Пользователя ${email} нет в базе. Сначала зарегистрируйтесь на сайте.`)
    const all = await prisma.user.findMany({ select: { email: true, role: true } })
    console.error('\nЕсть такие пользователи:')
    for (const u of all) console.error(`  ${u.email} (${u.role})`)
    process.exit(1)
  }

  const updated = await prisma.user.update({
    where: { email },
    // Почту подтверждаем заодно: админ, который не может войти, бесполезен.
    data: { role: 'ADMIN', emailVerified: user.emailVerified ?? new Date() },
  })

  console.log(`${updated.email} -> ${updated.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
