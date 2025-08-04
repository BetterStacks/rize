import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Rize",
  description: "Terms of Service for Rize - Understanding your rights and responsibilities when using our platform.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: January 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to Rize, a professional profile platform operated by BetterStacks India Pvt Ltd ("Company," "we," "our," or "us"). 
                By accessing or using Rize ("Service," "Platform"), you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Rize is a platform that enables users to create professional profiles that showcase their stories, 
                projects, experiences, and creative work. Our mission is to help individuals "Own Your Story, Not Just Your Resume" 
                by providing tools to present authentic professional identities.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Service includes features such as profile creation, content sharing, social interactions, 
                project showcases, gallery management, and community engagement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. User Accounts and Registration
              </h2>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                3.1 Account Creation
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>You must be at least 13 years old to create an account</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>One person may only maintain one account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
                3.2 Username Policy
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Usernames must be unique and cannot impersonate others</li>
                <li>Usernames cannot contain offensive, misleading, or trademark-infringing content</li>
                <li>We reserve the right to reclaim usernames that violate these guidelines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. User Content and Conduct
              </h2>
              
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                4.1 Content Ownership
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You retain ownership of all content you post on Rize ("User Content"). By posting content, 
                you grant us a non-exclusive, worldwide, royalty-free license to use, display, distribute, 
                and modify your content for the purpose of operating and improving our Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                4.2 Content Guidelines
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">You agree not to post content that:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Is illegal, harmful, threatening, abusive, defamatory, or discriminatory</li>
                <li>Violates intellectual property rights of others</li>
                <li>Contains personal information of others without consent</li>
                <li>Includes spam, malware, or malicious links</li>
                <li>Is sexually explicit or inappropriate</li>
                <li>Promotes violence, hate speech, or illegal activities</li>
                <li>Infringes on trademarks, copyrights, or other proprietary rights</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
                4.3 Professional Conduct
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                As a professional platform, we expect users to maintain professional standards in their 
                interactions and content. Harassment, bullying, or inappropriate behavior may result in 
                account suspension or termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Intellectual Property Rights
              </h2>
              
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                5.1 Platform Rights
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Rize and its original content, features, and functionality are owned by BetterStacks India Pvt Ltd 
                and are protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                5.2 DMCA Policy
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We respect intellectual property rights and will respond to valid DMCA takedown notices. 
                If you believe your copyright has been infringed, please contact us at tanay@betterstacks.com 
                with detailed information about the alleged infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by 
                our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, 
                you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Prohibited Uses
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">You may not use our Service:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>For any unlawful purpose or to solicit others to act unlawfully</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To transmit or procure the sending of advertising or promotional material without our prior written consent</li>
                <li>To impersonate or attempt to impersonate the Company, employees, other users, or any other person or entity</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                <li>To use any robot, spider, or other automatic device to access the Service for any purpose without our express written permission</li>
                <li>To attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Service Availability and Modifications
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We strive to provide reliable service but cannot guarantee 100% uptime. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Modify, suspend, or discontinue any part of the Service at any time</li>
                <li>Impose usage limits or restrictions</li>
                <li>Perform maintenance and upgrades</li>
                <li>Update these Terms as necessary</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                We will provide reasonable notice of significant changes when possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Account Termination
              </h2>
              
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                9.1 Termination by You
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You may terminate your account at any time by contacting us or using account deletion features 
                within the Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                9.2 Termination by Us
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice, for violations of these Terms, 
                including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Breach of these Terms of Service</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Prolonged inactivity</li>
                <li>Violation of intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES 
                OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BETTERSTACKS INDIA PVT LTD BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, 
                DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibent text-gray-900 dark:text-white mb-4">
                12. Indemnification
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You agree to defend, indemnify, and hold harmless BetterStacks India Pvt Ltd and its officers, directors, 
                employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, 
                expenses, or fees arising out of or relating to your violation of these Terms or your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Governing Law and Jurisdiction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
                its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive 
                jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Severability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions 
                shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                15. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by 
                posting the updated Terms on this page and updating the "Last updated" date. Your continued use of 
                the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                16. Contact Information
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Company:</strong> BetterStacks India Pvt Ltd</p>
                  <p><strong>Email:</strong> tanay@betterstacks.com</p>
                  <p><strong>Phone:</strong> +91-98672-64365</p>
                </div>
              </div>
            </section>

            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                By using Rize, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}