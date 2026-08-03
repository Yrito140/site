const layout = (title: string, body: string, cta: { url: string; label: string }) => `
<!doctype html>
<html><body style="margin:0;padding:32px;background:#f6f8f6;font-family:Inter,Roboto,Arial,sans-serif;color:#1a1c1a">
  <table role="presentation" style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <tr><td>
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:600">${title}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#43483f">${body}</p>
      <a href="${cta.url}" style="display:inline-block;background:#3d6b35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;font-weight:500">${cta.label}</a>
      <p style="margin:24px 0 0;font-size:13px;color:#73796e">Если кнопка не работает, откройте ссылку: <br>${cta.url}</p>
    </td></tr>
  </table>
</body></html>`

export function passwordResetEmail(url: string) {
  return {
    subject: 'Восстановление пароля — Marafon',
    html: layout(
      'Сброс пароля',
      'Мы получили запрос на смену пароля. Ссылка действует 1 час. Если это были не вы — просто проигнорируйте письмо.',
      { url, label: 'Задать новый пароль' },
    ),
    text: `Сброс пароля. Ссылка действует 1 час: ${url}`,
  }
}

export function verifyEmail(url: string) {
  return {
    subject: 'Подтвердите email — Marafon',
    html: layout('Подтверждение email', 'Остался один шаг — подтвердите адрес, чтобы защитить аккаунт.', {
      url,
      label: 'Подтвердить email',
    }),
    text: `Подтвердите email: ${url}`,
  }
}
