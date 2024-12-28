import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { format, subDays } from 'date-fns'

interface WeeklyReportEmailProps {
  name: string
  startDate: Date
  endDate: Date
  stats: {
    totalBookings: number
    totalRevenue: number
    avgParticipants: number
    usagePercentage: number
    topActivities: Array<{
      name: string
      bookings: number
      revenue: number
    }>
  }
}

export function WeeklyReportEmail({
  name,
  startDate,
  endDate,
  stats
}: WeeklyReportEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your weekly booking summary</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Weekly Activity Report</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Here's your booking summary for {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}:
          </Text>

          <Section style={statsContainer}>
            <div style={statBox}>
              <div style={statLabel}>Total Bookings</div>
              <div style={statValue}>{stats.totalBookings}</div>
            </div>
            <div style={statBox}>
              <div style={statLabel}>Revenue</div>
              <div style={statValue}>R{stats.totalRevenue.toFixed(2)}</div>
            </div>
            <div style={statBox}>
              <div style={statLabel}>Avg. Participants</div>
              <div style={statValue}>{stats.avgParticipants.toFixed(1)}</div>
            </div>
            <div style={statBox}>
              <div style={statLabel}>Usage</div>
              <div style={statValue}>{stats.usagePercentage.toFixed(1)}%</div>
            </div>
          </Section>

          <Heading as="h2" style={h2}>Top Activities</Heading>
          
          {stats.topActivities.map((activity, index) => (
            <div key={index} style={activityRow}>
              <div style={activityName}>{activity.name}</div>
              <div style={activityStats}>
                {activity.bookings} bookings • R{activity.revenue.toFixed(2)}
              </div>
            </div>
          ))}

          <Text style={text}>
            <Link 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/admin/subscription`}
              style={button}
            >
              View Full Analytics
            </Link>
          </Text>

          <Text style={footer}>
            You're receiving this email because you've enabled weekly reports.
            You can update your notification preferences in your account settings.
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
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginTop: '32px',
  marginBottom: '16px',
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const statsContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  margin: '24px 0',
}

const statBox = {
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
}

const statLabel = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '4px',
}

const statValue = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
}

const activityRow = {
  padding: '12px 0',
  borderBottom: '1px solid #e5e7eb',
}

const activityName = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#1a1a1a',
  marginBottom: '4px',
}

const activityStats = {
  fontSize: '14px',
  color: '#6b7280',
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
  textDecoration: 'none',
  textAlign: 'center' as const,
  marginTop: '8px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
} 