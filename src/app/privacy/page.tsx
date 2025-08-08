import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Rize',
  description: 'Privacy Policy for Rize - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: January 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to Rize ("we," "our," or "us"). This Privacy Policy explains how BetterStacks India Pvt Ltd 
                collects, uses, discloses, and safeguards your information when you use our Rize platform and services. 
                We take seriously the protection of your privacy and confidentiality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                2.1 Information You Provide Directly
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Account information (name, email address, username)</li>
                <li>Profile information (bio, location, age, pronouns, profile images)</li>
                <li>Content you create (posts, projects, gallery items, writings, experience, education)</li>
                <li>Social media links and professional information</li>
                <li>Communications with us (support requests, feedback)</li>
                <li>Payment information (for premium features, if applicable)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
                2.2 Information Collected Automatically
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, interactions)</li>
                <li>Log files and analytics data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
                2.3 Third-Party Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>OAuth providers (Google, GitHub, Discord) - when you sign in through these services</li>
                <li>Public information from social media platforms you link to your profile</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Provide, operate, and maintain the Rize platform</li>
                <li>Create and manage your profile and account</li>
                <li>Enable social features (posts, comments, likes, following)</li>
                <li>Personalize your experience and improve our services</li>
                <li>Send you important updates and communications</li>
                <li>Respond to your questions and provide customer support</li>
                <li>Analyze usage patterns and improve platform functionality</li>
                <li>Ensure platform security and prevent misuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Information Sharing and Disclosure
              </h2>
              
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                4.1 Public Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                By design, Rize is a platform for sharing professional profiles. Information you choose to include 
                in your public profile (name, bio, projects, experience, gallery, etc.) will be visible to other users 
                and may be indexed by search engines.
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                4.2 Service Providers
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We may share your information with trusted third-party service providers who assist us in operating 
                our platform, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Cloud hosting and storage providers (Supabase)</li>
                <li>Analytics services</li>
                <li>Authentication providers</li>
                <li>Email communication services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
                4.3 Legal Requirements
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may disclose your information if required by law, court order, or governmental authority, 
                or to protect our rights, safety, or the safety of others.
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4 font-medium">
                We do not sell customer lists or personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Restricted access to personal information on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We retain your personal information only as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-4">
                <li>Provide you with our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Protect against potential legal claims</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                When you delete your account, we will remove your personal information from our active systems, 
                though some information may remain in backup systems for a limited period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                To exercise these rights, please contact us at tanay@betterstacks.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your personal information in accordance 
                with applicable data protection laws, including GDPR for European Economic Area residents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Rize is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected information from a child 
                under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and provide personalized content. You can control cookie preferences through your browser settings, 
                though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                Your continued use of Rize after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Contact Information
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Company:</strong> BetterStacks India Pvt Ltd</p>
                  <p><strong>Email:</strong> tanay@betterstacks.com</p>
                  <p><strong>Phone:</strong> +91-98672-64365</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}