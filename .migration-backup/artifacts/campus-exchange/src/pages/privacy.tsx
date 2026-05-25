import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 py-2">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">
          <div className="h-1 bg-indigo-600" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-xs text-gray-400 mt-0.5">Last updated: June 2025 · Predic HSM</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your privacy matters to us. This policy explains what information Predic HSM collects, how it is used, and how it is protected.
            </p>
          </div>
        </div>

        {[
          {
            title: "1. Information We Collect",
            content: `When you register, we collect the following information through Google Sign-In: your name, email address, and Google profile picture. We also collect information you voluntarily provide in the app, such as your display name and academic stream. We collect usage data such as bets placed, prediction outcomes, and wallet activity — this data is used solely to operate the platform.`,
          },
          {
            title: "2. How We Use Your Information",
            content: `We use your information exclusively to: operate and personalise your Predic HSM experience; display your profile and rankings on the leaderboard; send in-app notifications relevant to your activity; and improve the platform. We do not use your data for advertising, profiling, or any commercial purpose. We do not sell your data to any third party.`,
          },
          {
            title: "3. Authentication (Google Sign-In)",
            content: `Authentication is handled by Google Firebase Authentication. We do not store your Google password. Firebase handles authentication securely. Your Google account credentials are never accessible to Predic HSM operators. By signing in with Google, you also agree to Google's Privacy Policy.`,
          },
          {
            title: "4. Data Storage",
            content: `Your account data, virtual wallet balance, and betting history are stored in a secure cloud database. Only authorised platform administrators have access to this data for operational purposes such as market resolution.`,
          },
          {
            title: "5. Leaderboard and Public Profiles",
            content: `Your display name, academic stream, and virtual wallet balance are visible to all users on the Leaderboard. Your email address is never publicly displayed. If you prefer not to appear on the leaderboard, you can refrain from placing bets — however, there is no opt-out mechanism for active users.`,
          },
          {
            title: "6. Data Retention",
            content: `Your data is retained for as long as your account is active. If you wish to have your data deleted, contact us and we will remove your account and associated data within 14 days.`,
          },
          {
            title: "7. Third-Party Services",
            content: `Predic HSM uses the following third-party services: Google Firebase (authentication & database), and Google Fonts (typography). These services have their own privacy policies. We do not integrate any advertising networks, analytics trackers, or social media pixels.`,
          },
          {
            title: "8. Children's Privacy",
            content: `Predic HSM is not directed at children under the age of 13. If you believe a child under 13 has registered, please contact us and we will delete the account promptly.`,
          },
          {
            title: "9. Changes to This Policy",
            content: `This Privacy Policy may be updated periodically. We will post the updated policy on this page with a revised date. Continued use of the Platform constitutes acceptance of the updated policy.`,
          },
          {
            title: "10. Contact",
            content: `If you have any questions, concerns, or requests regarding your privacy or this policy — including requests from school administration — please reach out to the platform administrators. We are committed to addressing any concerns promptly and cooperating fully with institutional oversight.`,
          },
        ].map((section) => (
          <div key={section.title} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 card-shadow">
            <h2 className="text-sm font-bold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="text-center py-4 space-y-3">
          <p className="text-xs text-gray-400">We respect your privacy and are transparent about our data practices.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/terms">
              <button className="px-4 py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                Terms & Conditions
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Back to Markets
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
