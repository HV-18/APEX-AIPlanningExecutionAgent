import * as React from 'https://esm.sh/react@18.3.1';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.22';

interface LoginNotificationEmailProps {
  userName: string;
  aiGreeting: string;
  aiRecommendations: string;
  aiMotivation: string;
  loginTime: string;
}

export const LoginNotificationEmail = ({
  userName,
  aiGreeting,
  aiRecommendations,
  aiMotivation,
  loginTime,
}: LoginNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome back to your learning journey! 🎓</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome Back, {userName}! 🎓</Heading>
        
        <Text style={text}>
          You logged in at {loginTime}
        </Text>

        <Section style={section}>
          <Heading style={h2}>Your Personalized Message</Heading>
          <Text style={text}>{aiGreeting}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>📚 Today's Study Recommendations</Heading>
          <Text style={text}>{aiRecommendations}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>💪 Motivation Boost</Heading>
          <Text style={text}>{aiMotivation}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Keep up the great work! Your AI Study Assistant is here to help you succeed.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default LoginNotificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const section = {
  padding: '0 40px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '32px',
};
