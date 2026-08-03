import { createHash, randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

export interface Storage {
  /** Сохраняет файл и возвращает публичный URL. */
  put(file: { buffer: Buffer; filename: string; contentType: string }): Promise<string>
  remove(publicUrl: string): Promise<void>
}

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

const MAX_BYTES = 4 * 1024 * 1024

class LocalStorage implements Storage {
  constructor(
    private readonly dir: string,
    private readonly prefix: string,
  ) {}

  async put(file: { buffer: Buffer; filename: string; contentType: string }) {
    const ext = ALLOWED.get(file.contentType)
    if (!ext) throw new Error('Поддерживаются только JPEG, PNG и WebP')
    if (file.buffer.byteLength > MAX_BYTES) throw new Error('Файл больше 4 МБ')

    // Имя генерируем сами: имя из браузера может содержать пути и юникод-трюки.
    const name = `${randomUUID()}${ext}`
    await mkdir(this.dir, { recursive: true })
    await writeFile(path.join(this.dir, name), file.buffer)
    return `${this.prefix}/${name}`
  }

  async remove(publicUrl: string) {
    const name = path.basename(publicUrl)
    if (!name || name.includes('..')) return
    await unlink(path.join(this.dir, name)).catch(() => undefined)
  }
}

function createLocalStorage(): Storage {
  const dir = path.resolve(process.env.STORAGE_LOCAL_DIR ?? './public/uploads')
  const prefix = process.env.STORAGE_PUBLIC_PREFIX ?? '/uploads'
  return new LocalStorage(dir, prefix)
}

/**
 * S3-совместимое хранилище (Cloudflare R2, AWS S3, MinIO).
 * Задействуется переменной STORAGE_DRIVER=s3 — на Vercel ФС read-only,
 * локальные загрузки туда не пишутся.
 */
function createS3Storage(): Storage {
  const { S3Client, PutObjectCommand, DeleteObjectCommand } =
    require('@aws-sdk/client-s3') as typeof import('@aws-sdk/client-s3')

  const endpoint = process.env.S3_ENDPOINT
  const region = process.env.S3_REGION ?? 'auto'
  const bucket = process.env.S3_BUCKET
  const prefix = (process.env.S3_PUBLIC_PREFIX ?? '/uploads').replace(/\/$/, '')
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('STORAGE_DRIVER=s3 требует S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY')
  }

  const client = new S3Client({
    region,
    ...(endpoint ? { endpoint } : {}),
    // R2 использует свой endpoint, подпись — стандартная S3.
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  })

  return {
    async put(file) {
      const ext = ALLOWED.get(file.contentType)
      if (!ext) throw new Error('Поддерживаются только JPEG, PNG и WebP')
      if (file.buffer.byteLength > MAX_BYTES) throw new Error('Файл больше 4 МБ')

      const name = `${randomUUID()}${ext}`
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: name,
          Body: file.buffer,
          ContentType: file.contentType,
        }),
      )
      return `${prefix}/${name}`
    },

    async remove(publicUrl) {
      const name = path.basename(publicUrl)
      if (!name || name.includes('..')) return
      await client
        .send(new DeleteObjectCommand({ Bucket: bucket, Key: name }))
        .catch(() => undefined)
    },
  }
}

function createStorage(): Storage {
  if (process.env.STORAGE_DRIVER === 's3') return createS3Storage()
  return createLocalStorage()
}

export const storage = createStorage()

/** Детерминированный плейсхолдер, пока у блюда нет фото. */
export function mealPlaceholderHue(seed: string): number {
  const hash = createHash('sha1').update(seed).digest('hex')
  return Number.parseInt(hash.slice(0, 4), 16) % 360
}
