import crypto from 'crypto'

interface PayfastConfig {
  merchantId: string
  merchantKey: string
  passPhrase: string
  sandbox: boolean
}

export class PayfastService {
  private config: PayfastConfig
  private baseUrl: string

  constructor(config: PayfastConfig) {
    this.config = config
    this.baseUrl = config.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'
  }

  generateSignature(data: Record<string, string>): string {
    const signatureString = Object.entries(data)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
      .join('&')

    return crypto
      .createHash('md5')
      .update(signatureString + this.config.passPhrase)
      .digest('hex')
  }

  createPaymentRequest(payment: {
    amount: number
    itemName: string
    merchantReference: string
    email: string
    returnUrl: string
    cancelUrl: string
    notifyUrl: string
  }) {
    const data = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: payment.returnUrl,
      cancel_url: payment.cancelUrl,
      notify_url: payment.notifyUrl,
      email_address: payment.email,
      m_payment_id: payment.merchantReference,
      amount: payment.amount.toFixed(2),
      item_name: payment.itemName
    }

    const signature = this.generateSignature(data)

    return {
      url: this.baseUrl,
      data: {
        ...data,
        signature
      }
    }
  }

  validateCallback(data: Record<string, string>): boolean {
    const receivedSignature = data.signature
    delete data.signature
    const calculatedSignature = this.generateSignature(data)
    return receivedSignature === calculatedSignature
  }
}

export const payfast = new PayfastService({
  merchantId: process.env.PAYFAST_MERCHANT_ID!,
  merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
  passPhrase: process.env.PAYFAST_PASSPHRASE!,
  sandbox: process.env.NODE_ENV !== 'production'
})