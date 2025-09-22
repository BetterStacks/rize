import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ClaimProfileEmailProps {
  name: string
  claimUrl: string
  resumeFilename: string
}

export const ClaimProfileEmail = ({
  name = 'John Doe',
  claimUrl = 'https://app.rize.com/claim-profile?token=example',
  resumeFilename = 'resume.pdf',
}: ClaimProfileEmailProps) => (
  <Html>
    <Head />
    <Preview>Claim your profile on Rize and get started!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Img
            src="https://res.cloudinary.com/djvbs5a8x/image/upload/v1758255774/logo-dark_stw21z.png"
            width="60"
            height="60"
            alt="Rize"
            style={logo}
          />
        </Section>

        {/* Main Content */}
        <Section style={contentSection}>
          <Text style={heading}>Welcome to Rize, {name}!</Text>
          
          <Text style={paragraph}>
            We've created a profile for you on Rize based on your resume. 
            You're one step away from joining our community of creators and innovators.
          </Text>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={claimUrl}>
              Claim Your Profile
            </Button>
          </Section>

          <Text style={benefitsHeading}>
            Once you claim your profile, you'll be able to:
          </Text>

          <ul style={list}>
            <li style={listItem}>✨ Set your password and secure your account</li>
            <li style={listItem}>🚀 Complete your profile with your resume data</li>
            <li style={listItem}>💼 Showcase your work and connect with others</li>
            <li style={listItem}>📈 Share your journey and build your personal brand</li>
          </ul>
        </Section>

        {/* Footer */}
        <Section style={footerSection}>
          <Text style={footerText}>
            We're excited to have you join the Rize community! This secure link will remain active for 7 days to give you time to claim your profile at your convenience.
          </Text>
          
          <Text style={footerText}>
            Questions? Simply reply to this email and we'll be happy to help you get started.
          </Text>
          
          <Text style={footerText}>
            Welcome aboard,<br />
            The Rize Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ClaimProfileEmail

// Styles
const main = {
  backgroundColor: '#fafafa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 0',
  marginBottom: '32px',
  maxWidth: '500px',
  borderRadius: '12px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
}

const headerSection = {
  padding: '0 40px 24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  borderRadius: '6px',
}

const contentSection = {
  padding: '0 40px',
}

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 32px',
  textAlign: 'center' as const,
}


const buttonSection = {
  textAlign: 'center' as const,
  margin: '0 0 32px',
}

const button = {
  backgroundColor: '#111827',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
}

const benefitsHeading = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0 0 16px',
  textAlign: 'left' as const,
}

const list = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 24px',
  paddingLeft: '0',
  listStyleType: 'none',
}

const listItem = {
  margin: '10px 0',
  paddingLeft: '0',
}


const footerSection = {
  padding: '24px 40px 0',
  borderTop: '1px solid #f3f4f6',
  marginTop: '24px',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#9ca3af',
  margin: '0 0 12px',
}