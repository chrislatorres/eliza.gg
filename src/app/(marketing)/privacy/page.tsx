import Markdown from "markdown-to-jsx";

export default function Page() {
  const privacy = `
**Cogend Privacy Policy**
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

**9. Changes to This Policy**
-------------------

We will notify you of material changes to this policy.

**10. Order Fulfillment and Payment Processing**
--------------------------------------------

When you make a purchase, payments are processed by a third-party provider (e.g., Stripe). We do not store your credit card details. You are responsible for ensuring that your payment information is accurate and up to date.

We reserve the right to cancel any order if there is an issue with payment processing, fraud detection, or product availability.

**11. Shipping and Delivery**
---------------------------

We work with trusted third-party carriers to ship your orders. Shipping costs and estimated delivery times will be displayed at checkout. Delivery times may vary based on your location, and we cannot guarantee specific delivery dates.

**12. Refunds, Cancellations, and Exchanges**
-----------------------------------------

We do not offer refunds for purchased products. In case of defective or damaged products, you may contact our customer support team to request an exchange or store credit, subject to our discretion and our returns policy.

**13. Product Availability and Accuracy**
-------------------------------------

We strive to provide accurate product descriptions and availability, but we cannot guarantee that products will always be in stock. In the event that a product is unavailable, we reserve the right to cancel or modify your order, and we will notify you of such changes.

**14. Tax and Currency Information**
----------------------------------

Prices are displayed in USD and may be subject to applicable sales tax based on your location. The total price, including tax and shipping, will be displayed at checkout.

**1. Promotions and Discounts**
-----------------------------

We may offer promotional codes or discounts from time to time. These offers are subject to availability and may have an expiration date. Discount codes cannot be applied to certain products or combined with other offers unless stated otherwise.
    `.trim();

  return (
    <div
      className="prose prose-slate dark:prose-invert mx-auto p-4 lg:max-w-2xl"
      suppressHydrationWarning
    >
      <Markdown>{privacy}</Markdown>
    </div>
  );
}
