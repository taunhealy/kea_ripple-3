import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface UsageAlertEmailProps {
  name: string
  usagePercentage: number
  currentBookings: number
  maxBookings: number
  daysRemaining: number
  tier: string
  nextTier?: string
}

export function UsageAlertEmail({
  name,
  usagePercentage,
  currentBookings,
  maxBookings,
  daysRemaining,
  tier,
  nextTier
}: UsageAlertEmailProps) {
  const isHighUsage = usagePercentage >= 90

  return (
    <Html>
      <Head />
      <Preview>
        {isHighUsage 
          ? 'Critical Usage Alert: Action Required'
          : 'Usage Alert: Approaching Limit'}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isHighUsage ? '🚨 Critical Usage Alert' : '⚠️ Usage Warning'}
          </Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            You have used <strong>{usagePercentage.toFixed(1)}%</strong> of your monthly booking limit
            ({currentBookings} of {maxBookings} bookings) on your {tier} plan.
          </Text>

          <Text style={text}>
            You have {daysRemaining} days remaining in your current billing cycle.
          </Text>

          {isHighUsage && nextTier && (
            <Text style={text}>
              To ensure uninterrupted service, we recommend upgrading to the {nextTier} plan.
              This will increase your monthly booking limit and provide additional features.
            </Text>
          )}

          <Text style={text}>
            <Link 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription`}
              style={button}
            >
              {nextTier ? 'Upgrade Now' : 'View Usage Details'}
            </Link>
          </Text>

          <Text style={footer}>
            If you have any questions, please don't hesitate to contact our support team.
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

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
} 