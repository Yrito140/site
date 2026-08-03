# Marafon — фитнес-платформа

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + PostgreSQL + Prisma + NextAuth (Auth.js).

## Быстрый старт (локально)

```bash
npm install
cp .env.example .env
# в .env: DATABASE_URL, AUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev
npm run db:seed
npm run dev
```

Открыть http://localhost:3000. Демо-пользователь: `demo@marafon.dev` / `demo12345`.

## Docker

```bash
cp .env.example .env   # вписать AUTH_SECRET
docker compose up -d --build
```

В контейнере автоматически применяются миграции и выполняется seed.

## Vercel

```bash
# 1. Репозиторий
git init && git add . && git commit -m "initial"
# Импортируй проект на vercel.com (Neon/Postgres в БД)

# 2. Переменные окружения (Dashboard -> Settings -> Environment Variables)
DATABASE_URL         # Neon Postgres URL
AUTH_SECRET          # openssl rand -base64 32
AUTH_URL             # https://<ваш-домен>
AUTH_TRUST_HOST      # true
APP_URL              # https://<ваш-домен>
RESEND_API_KEY       # (необязательно) — без него письма пишутся в лог
EMAIL_FROM           # "Marafon <noreply@example.com>"
STORAGE_DRIVER       # s3  (Vercel ФС read-only, local не сработает)
S3_ENDPOINT          # https://<accountid>.r2.cloudflarestorage.com
S3_REGION            # auto
S3_BUCKET            # имя бакета R2
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_PUBLIC_PREFIX     # /uploads  (публичный URL: свой домен на R2 или /uploads)

# 3. Миграции и данные — выполни один раз локально:
npx prisma migrate deploy --skip-generate
# или на Vercel после деплоя (замени URL):
DATABASE_URL="postgres://..." npx prisma migrate deploy
# Фото/рецепты в БД попадают через seed, см. раздел «Seed данных» ниже.

# 4. Деплой — изменения пушатся в git, Vercel пересобирает сам.
```

## Seed данных

```bash
# Сгенерировать prisma/seed-assets.ts (фото + рецепты) из photos/:
npx tsx scripts/build-seed-assets.ts
# Затем залить в БД (например, пустую прод-базу):
SEED_ALLOW_WIPE=yes npx prisma db seed
# На проде seed снесёт пользовательские данные — поэтому он требует SEED_ALLOW_WIPE.
```

## Администрирование

```bash
# Сделать существующего пользователя админом (сначала он должен зарегистрироваться):
npx tsx scripts/grant-admin.ts user@example.com
```

## Учётные данные

| | |
|---|---|
| Админ | `admin@example.com` / `admin12345` (или из `SEED_ADMIN_*`) |
| Демо | `demo@marafon.dev` / `demo12345` |

## Тесты

```bash
npm test        # vitest: расчёты БЖУ/ИМТ, генератор меню, MET-расход
```

## Структура

```
prisma/            схема, миграции, seed (150 блюд, ~80 ингредиентов)
src/app/           роуты: (auth), (app), admin, onboarding, api/auth
src/app/actions/   server actions (мутации, все валидируются zod)
src/components/    ui/ (дизайн-система), layout/, dashboard/, menu/
src/lib/
  auth/            NextAuth (JWT + Credentials)
  i18n/            next-intl, locale в cookie (ru/en)
  nutrition/       чистый модуль расчётов (Миффлин — Сан Жеор, ИМТ, БЖУ) + тесты
  menu/            генератор недельного меню (детерминированный) + тесты
  mailer/          Resend или консоль-заглушка
  storage/         локальная FS (интерфейс — под S3 позже)
  validators/      zod-схемы
```

## Ключевые решения

- **Калорийность блюда** всегда считается из ингредиентов (не хранится руками).
- **Меню детерминировано**: одно и то же семя даёт одинаковую неделю; «обновить» меняет семя.
- **Письма**: без `RESEND_API_KEY` уходят в лог сервера, флоу не ломается.
- **Фото** — локальная папка + Docker volume; за интерфейсом `Storage`, переезд на S3 не трогает вызывающий код.
