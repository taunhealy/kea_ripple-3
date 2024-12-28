import { createTransport } from 'nodemailer'
import { render } from '@react-email/render'
import { SubscriptionUpgradeEmail } from '@/emails/SubscriptionUpgradeEmail'
import { SubscriptionCancelledEmail } from '@/emails/SubscriptionCancelledEmail'
import { PaymentConfirmationEmail } from '@/emails/PaymentConfirmationEmail'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

export class EmailService {
  async sendSubscriptionUpgrade(to: string, data: {
    name: string
    plan: string
    amount: number
    nextBillingDate: Date
  }) {
    const html = render(SubscriptionUpgradeEmail(data))
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Subscription Upgraded Successfully',
      html
    })
  }

  async sendSubscriptionCancelled(to: string, data: {
    name: string
    plan: string
    endDate: Date
  }) {
    const html = render(SubscriptionCancelledEmail(data))
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Subscription Cancellation Confirmation',
      html
    })
  }

  async sendPaymentConfirmation(to: string, data: {
    name: string
    amount: number
    description: string
    invoiceUrl?: string
  }) {
    const html = render(PaymentConfirmationEmail(data))
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Payment Confirmation',
      html
    })
  }
}

export const emailService = new EmailService() 