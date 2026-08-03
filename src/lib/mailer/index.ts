import { Resend } from 'resend'
import { passwordResetEmail, verifyEmail } from './templates'

export interface Mailer {
  send(message: { to: string; subject: string; html: string; text: string }): Promise<void>
}

class ResendMailer implements Mailer {
  constructor(
    private readonly client: Resend,
    private readonly from: string,
  ) {}

  async send(message: { to: string; subject: string; html: string; text: string }) {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    })
    if (error) throw new Error(`Resend: ${error.message}`)
  }
}

/** Fallback без ключа: письмо уходит в лог, флоу не ломается на локальной машине. */
class ConsoleMailer implements Mailer {
  async send(message: { to: string; subject: string; text: string }) {
    console.info(`\n--- EMAIL -> ${message.to} ---\n${message.subject}\n${message.text}\n---\n`)
  }
}

function createMailer(): Mailer {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'Marafon <noreply@example.com>'
  return key ? new ResendMailer(new Resend(key), from) : new ConsoleMailer()
}

export const mailer = createMailer()

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`
  await mailer.send({ to, ...passwordResetEmail(url) })
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.APP_URL ?? 'http://localhost:3000'}/verify-email?token=${token}`
  await mailer.send({ to, ...verifyEmail(url) })
}
