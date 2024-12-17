import Markdown from "markdown-to-jsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eliza.gg - Privacy Policy",
};

export default function Page() {
  const privacy = `
**Privacy Policy**
=======================

**Effective Date:** December 10th, 2024

Cogend, Inc. ("Cogend", "Company," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services ("Services"). By accessing or using the Services, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use the Services.

**1. Information We Collect**
-------------------

1.1 **Personal Information.** When you create an account or use the Services, we may collect personally identifiable information such as:
- Name and email address
- Authentication information through our identity provider
- Payment information and transaction history
- Usage data and interaction with our Services
- Communications with our support team
- IP addresses and device information

1.2 **Service Usage Data.** We collect data about how you interact with our Services, including:
- AI-generated content and prompts
- Application usage patterns
- Performance metrics and error logs
- API usage and integration data

1.3 **Cookies and Tracking Technologies.** We use cookies and similar tracking technologies to track activity on our Services and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

**2. How We Use Your Information**
-------------------

2.1 **Provide and Maintain Services.** We use your information to:
- Authenticate and maintain your account
- Process payments and transactions
- Provide AI-powered features and functionality
- Deliver customer support and communications
- Monitor and improve service performance

2.2 **Analytics and Service Improvement.** We analyze usage patterns to:
- Improve our AI models and algorithms
- Enhance user experience and interface
- Debug technical issues
- Prevent fraud and abuse
- Generate aggregate insights about service usage

2.3 **Communications.** We may contact you regarding:
- Service updates and maintenance
- Security alerts
- Marketing communications (with consent)
- Billing and account management

**3. Service Providers and Data Processing**
-------------------

We use the following third-party service providers to operate our Services:

3.1 **Core Infrastructure:**
- Xata, Turso (Database hosting and management)
- Fly.io, Cloudflare, and Vercel (Compute and hosting services)
- Clerk (Authentication and user management)
- Stripe (Payment processing)
- Resend (Email communications)

3.2 **AI Services:**
- OpenAI (AI API services)
- Anthropic (AI API services)
- OpenRouter (AI API services)

3.3 **Analytics and Monitoring:**
- PostHog (Product analytics)
- Braintrust (Analytics)
- Slack (Internal analytics and monitoring)
- Sentry (Error tracking and performance monitoring)

Each of these service providers has been selected for their robust security practices and compliance with relevant data protection regulations. These providers process your data according to their respective privacy policies and our data processing agreements with them.

**4. Data Security and Storage**
-------------------

4.1 **Security Measures.** We implement industry-standard security measures including:
- Encryption of data in transit and at rest
- Regular security audits and penetration testing
- Access controls and authentication
- Monitoring for suspicious activities
- Regular security updates and patches

4.2 **Data Storage Locations.** Your data may be stored and processed in:
- United States
- European Union
- Other locations where our service providers operate

**5. Data Retention**
-------------------

5.1 We retain your data for as long as:
- Your account is active
- Required by law
- Necessary for fraud prevention
- Needed for legitimate business purposes

**6. Your Rights and Choices**
-------------------

6.1 **Access and Control.** You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Export your data
- Opt-out of marketing communications
- Restrict processing of your data

6.2 **AI Data Usage.** You can:
- Control AI feature settings
- Request removal of AI training data
- Opt-out of certain AI features

**7. International Data Transfers**
-------------------

We transfer data internationally in compliance with:
- EU-US Data Privacy Framework
- Standard Contractual Clauses
- Other applicable data transfer mechanisms

**8. Children's Privacy**
-------------------

Our Services are not intended for children under 13. We do not knowingly collect data from children under 13.

**9. Changes to Privacy Policy**
-------------------

We will notify you of material changes to this Privacy Policy. Your continued use of the Services after such modifications constitutes acceptance of the updated Privacy Policy.
    `.trim();

  return (
    <div
      className="prose prose-zinc dark:prose-invert mx-auto p-4 lg:max-w-2xl"
      suppressHydrationWarning
    >
      <Markdown>{privacy}</Markdown>
    </div>
  );
}
