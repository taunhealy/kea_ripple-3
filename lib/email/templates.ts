interface EmailTemplateProps {
  name: string
  activityTitle?: string
  bookingDate?: string
  bookingTime?: string
  participants?: number
  totalPrice?: number
  planName?: string
  planPrice?: number
  nextBillingDate?: string
}

export const emailTemplates = {
  bookingConfirmation: ({
    name,
    activityTitle,
    bookingDate,
    bookingTime,
    participants,
    totalPrice
  }: EmailTemplateProps) => ({
    subject: `Booking Confirmed: ${activityTitle}`,
    html: `
      <h1>Thanks for your booking, ${name}!</h1>
      <p>Your booking for ${activityTitle} has been confirmed.</p>
      <div style="margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 5px;">
        <h2>Booking Details</h2>
        <p><strong>Activity:</strong> ${activityTitle}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
        <p><strong>Participants:</strong> ${participants}</p>
        <p><strong>Total Price:</strong> R${totalPrice}</p>
      </div>
      <p>Need to make changes? Contact the provider or visit your booking dashboard.</p>
    `
  }),

  bookingCancellation: ({
    name,
    activityTitle,
    bookingDate
  }: EmailTemplateProps) => ({
    subject: `Booking Cancelled: ${activityTitle}`,
    html: `
      <h1>Booking Cancellation</h1>
      <p>Hi ${name},</p>
      <p>Your booking for ${activityTitle} on ${bookingDate} has been cancelled.</p>
      <p>If you didn't request this cancellation, please contact us immediately.</p>
    `
  }),

  subscriptionConfirmation: ({
    name,
    planName,
    planPrice,
    nextBillingDate
  }: EmailTemplateProps) => ({
    subject: 'Subscription Confirmed',
    html: `
      <h1>Welcome to Your New Subscription!</h1>
      <p>Hi ${name},</p>
      <p>Your subscription to the ${planName} plan has been activated.</p>
      <div style="margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 5px;">
        <h2>Subscription Details</h2>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Price:</strong> R${planPrice}/month</p>
        <p><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
      </div>
      <p>Thank you for choosing our platform!</p>
    `
  }),

  subscriptionCancellation: ({
    name,
    planName
  }: EmailTemplateProps) => ({
    subject: 'Subscription Cancelled',
    html: `
      <h1>Subscription Cancelled</h1>
      <p>Hi ${name},</p>
      <p>Your ${planName} subscription has been cancelled.</p>
      <p>You'll continue to have access until the end of your current billing period.</p>
      <p>We're sorry to see you go. If you'd like to reactivate your subscription, you can do so at any time.</p>
    `
  }),

  bookingReminder: ({
    name,
    activityTitle,
    bookingDate,
    bookingTime
  }: EmailTemplateProps) => ({
    subject: `Reminder: ${activityTitle} Tomorrow`,
    html: `
      <h1>Your Activity is Tomorrow!</h1>
      <p>Hi ${name},</p>
      <p>This is a friendly reminder about your upcoming activity:</p>
      <div style="margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 5px;">
        <p><strong>Activity:</strong> ${activityTitle}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
      </div>
      <p>We look forward to seeing you!</p>
    `
  })
} 