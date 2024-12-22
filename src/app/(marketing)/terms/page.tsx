import Markdown from "markdown-to-jsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eliza.gg - Terms of Service",
};

export default function Page() {
  const termsOfService = `
**Terms of Service**
============================================

**Effective Date:** December 10th, 2024

These Terms of Use ("Terms") govern your access to and use of documentation and related resources for the Eliza.gg project. Cogend, Inc. ("Cogend", "we," "our," or "us") provides these resources as a reference for developers and other interested parties. We are not affiliated with the Eliza project or its trademarks, including ElizaOS. By using these resources ("Resources"), you agree to comply with these Terms. If you do not agree to these Terms, do not access or use the Resources.

**1. Scope and Purpose**
------------------------

1.1 **Informational Use**
The Resources provided here are intended solely for informational purposes to assist developers in understanding and implementing the Eliza framework.

1.2 **No Ownership or Affiliation**
Cogend does not claim ownership of or affiliation with the Eliza framework or ElizaOS, its trademarks, or any associated intellectual property.

1.3 **No Affiliation with a16z**
The information presented on this website is for informational purposes only. Cogend and its affiliates is in no way affiliated with, endorsed by, or officially connected to a16z, its creators, developers, or any of its subsidiaries, partners, or associated entities. Any references to a16z or its trademarks, logos, products, or services on this website are used solely for descriptive or informational purposes and do not imply any partnership, sponsorship, or endorsement by or with a16z or its associated organizations. All trademarks, service marks, and logos related to a16z are the property of their respective owners and are used herein under fair use for identification and reference purposes only. We do not claim any ownership or rights over these intellectual properties, nor do we intend to infringe upon the rights of any trademark holders.

**2. User Responsibility**
---------------------------

2.1 **Compliance with Licenses**
It is your responsibility to ensure compliance with the open-source license under which the Eliza framework is provided. The Resources do not alter or replace any licensing obligations associated with the Eliza project.

2.2 **Accuracy of Information**
While we strive to provide accurate and up-to-date information, we do not guarantee the completeness, accuracy, or reliability of the Resources.

**3. Content Usage and AI Interactions**
--------------------

3.1 **Permitted Use**
You may use the Resources to develop, deploy, and manage projects based on the Eliza framework. You may not use the Resources to misrepresent affiliation with the Eliza project or Cogend.

3.2 **AI-Generated Content**
Our services may utilize AI technologies to generate responses and assist users. Due to the nature of AI products, responses may not be unique to you and may be similar to output provided to other users. You acknowledge that AI-generated content should be reviewed for accuracy and appropriateness before use.

3.3 **Prohibited Use**
You agree not to use the Resources or our AI features to:
- Develop content or projects that violate any applicable laws or third-party rights
- Misrepresent the purpose or functionality of the Eliza framework
- Create or disseminate misinformation, deepfakes, or deceptive content
- Generate hate speech, harmful content, or content that promotes violence
- Attempt prompt injection or discovery of our system prompts
- Create age-inappropriate or harmful content relating to minors
- Develop facial recognition databases or make inferences about personal characteristics
- Submit personal information that violates privacy laws
- Engage in spam, content-farming, or click-bait activities
- Represent AI-generated content as human-generated without disclosure

**4. Intellectual Property**
----------------------------

4.1 **Open-Source Framework**
The Eliza framework is provided under its respective open-source license. Cogend makes no claims to the framework or its associated trademarks.

4.2 **Documentation Content**
The content of these Resources, including explanations, examples, and related materials, is provided by Cogend and is protected under applicable intellectual property laws. You may not redistribute or sell the Resources without explicit permission.

4.3 **Accuracy of Information**
Cogend cannot assure the accuracy, completeness, or reliability of the information provided in these Resources, as it is collected from third-party sources. Users are encouraged to verify critical details independently.


**5. Disclaimers**
------------------

5.1 **No Warranty**
The Resources are provided "as-is" and "as-available" without any warranties of any kind, express or implied. Cogend does not warrant that the Resources will meet your requirements or that they will be free of errors or interruptions.

5.2 **Third-Party Framework**
The Eliza framework is an independent project. Cogend is not responsible for any issues, defects, or limitations in the framework itself.

**6. Limitation of Liability**
------------------------------

6.1 **Use at Your Own Risk**
Your use of the Resources is at your own risk. Cogend is not liable for any damages, direct or indirect, resulting from your use of the Resources or the Eliza framework.

6.2 **Limit of Liability**
To the fullest extent permitted by law, Cogend’s liability is limited to the extent of any fees paid (if applicable) for access to these Resources.

**7. AI Data Usage and Privacy**
------------------------------

7.1 **Data Collection**
We may collect and process user interactions, including prompts, queries, and feedback, to improve our services and AI models. This data collection is governed by our Privacy Policy.

7.2 **Third-Party AI Services**
Our platform may utilize third-party AI services and models. Your use of our services is also subject to the applicable terms and policies of these providers.

7.3 **AI Output Disclaimer**
The AI models we use are trained on various data sources that may contain inaccuracies or biases. We recommend exercising discretion when using AI-generated content and reviewing all outputs before implementation or public use.

**8. Security and Safety**
-------------------------

8.1 **AI Safety Measures**
We implement reasonable measures to maintain user safety and prevent harm. However, you are responsible for reviewing and validating any AI-generated content or code before implementation.

8.2 **Code Review**
Any code generated through our AI features should undergo appropriate human review before commercial use to ensure suitability and mitigate risks of intellectual property infringement, bugs, or disclosure of proprietary information.

**9. Changes to Terms**
-----------------------

We may update these Terms at any time. Changes will be effective upon posting to this page. Your continued use of the Resources constitutes acceptance of the updated Terms.

**10. Payment Processing**
--------------------------------------------

When you make a purchase, payments are processed by a third-party provider (e.g., Stripe). We do not store your credit card details. You are responsible for ensuring that your payment information is accurate and up to date.

We reserve the right to cancel any order if there is an issue with payment processing or fraud detection.

**11. Pricing and Billing**
----------------------------------

Prices are displayed in USD and may be subject to applicable taxes based on your location. The total price, including any applicable taxes, will be displayed at checkout.

**12. No Refunds Policy**
-----------------------------------------

All purchases are final and non-refundable. By making a purchase, you acknowledge and agree to this no-refund policy.

**13. Financial Disclaimers**
-----------------------------

13.1 **No Financial Advice**
Nothing contained in our Services or Resources constitutes financial, investment, legal, or tax advice. We do not provide any recommendations or guidance concerning investments, cryptocurrencies, tokens, securities, or any other financial instruments.

13.2 **Investment Risks**
Any references to investments, digital assets, or financial products are for informational purposes only. All investments carry risk, and past performance is not indicative of future results. You should conduct your own research and consult with qualified financial advisors before making any investment decisions.

13.3 **Cryptocurrency and Token Disclaimer**
We do not endorse, recommend, or provide any guidance regarding any cryptocurrencies, tokens, or digital assets. We are not responsible for any losses you may incur through cryptocurrency or token investments. You acknowledge that cryptocurrency and token trading is highly speculative and risky.

**14. Changes to Terms**
-----------------------

We may update these Terms at any time. Changes will be effective upon posting to this page. Your continued use of the Services constitutes acceptance of the updated Terms.
  `;

  return (
    <div
      className="prose prose-zinc dark:prose-invert mx-auto p-4 lg:max-w-2xl"
      suppressHydrationWarning
    >
      <Markdown>{termsOfService}</Markdown>
    </div>
  );
}
