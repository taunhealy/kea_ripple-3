import { createTransport } from 'nodemailer'
import { emailTemplates } from './templates'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

interface SendEmailProps {
  to: string
  template: keyof typeof emailTemplates
  data: Parameters<typeof emailTemplates[keyof typeof emailTemplates]>[0]
}

export async function sendEmail({ to, template, data }: SendEmailProps) {
  try {
    const { subject, html } = emailTemplates[template](data)

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
} 