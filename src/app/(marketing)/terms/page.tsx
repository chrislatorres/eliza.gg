import Markdown from "markdown-to-jsx";

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

**2. User Responsibility**
---------------------------

2.1 **Compliance with Licenses**
It is your responsibility to ensure compliance with the open-source license under which the Eliza framework is provided. The Resources do not alter or replace any licensing obligations associated with the Eliza project.

2.2 **Accuracy of Information**
While we strive to provide accurate and up-to-date information, we do not guarantee the completeness, accuracy, or reliability of the Resources.

**3. Content Usage**
--------------------

3.1 **Permitted Use**
You may use the Resources to develop, deploy, and manage projects based on the Eliza framework. You may not use the Resources to misrepresent affiliation with the Eliza project or Cogend.

3.2 **Prohibited Use**
You agree not to use the Resources to:
- Develop content or projects that violate any applicable laws or third-party rights.
- Misrepresent the purpose or functionality of the Eliza framework.

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

**7. Changes to Terms**
-----------------------

We may update these Terms at any time. Changes will be effective upon posting to this page. Your continued use of the Resources constitutes acceptance of the updated Terms.
  `;

  return (
    <div
      className="prose prose-slate dark:prose-invert mx-auto p-4 lg:max-w-2xl"
      suppressHydrationWarning
    >
      <Markdown>{termsOfService}</Markdown>
    </div>
  );
}
