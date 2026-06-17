import { Resend } from 'resend'

type SendEmailArgs = {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Sends a transactional email via Resend. Degrades gracefully: if
 * RESEND_API_KEY / EMAIL_FROM are not configured it logs a warning and
 * returns false instead of throwing, so the app stays functional in
 * environments without email set up.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY/EMAIL_FROM not set — skipping email to ${to} ("${subject}")`
    )
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({ from, to, subject, html, text })
    if (error) {
      console.error('[email] send failed:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] send threw:', err)
    return false
  }
}
