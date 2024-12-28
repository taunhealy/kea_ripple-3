import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text
} from '@react-email/components'
import { format } from 'date-fns'

interface SubscriptionUpgradeEmailProps {
  name: string
  plan: string
  amount: number
  nextBillingDate: Date
}

export function SubscriptionUpgradeEmail({
  name,
  plan,
  amount,
  nextBillingDate
}: SubscriptionUpgradeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been upgraded</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Subscription Upgraded</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Your subscription has been successfully upgraded to the {plan} Plan.
          </Text>

          <Text style={text}>
            Amount charged: R{amount.toFixed(2)}
          </Text>

          <Text style={text}>
            Next billing date: {format(nextBillingDate, 'MMMM dd, yyyy')}
          </Text>

          <Text style={text}>
            View your subscription details in your{' '}
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription`}>
              account settings
            </Link>
            .
          </Text>

          <Text style={text}>
            Thank you for your continued support!
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
} 