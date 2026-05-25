import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 py-2">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">
          <div className="h-1 bg-indigo-600" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
                <p className="text-xs text-gray-400 mt-0.5">Last updated: June 2025 · Predic HSM</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Welcome to <strong className="text-gray-800">Predic HSM</strong> ("the Platform"), a virtual prediction market platform built for students of Hetauda School of Management. By creating an account or using the Platform, you agree to these Terms & Conditions. Please read them carefully.
            </p>
          </div>
        </div>

        {[
          {
            title: "1. Nature of the Platform",
            content: `Predic HSM is a student-built educational and entertainment project. The Platform uses exclusively virtual currency — there is no real money, no deposits, no withdrawals, and no financial transactions of any kind. Virtual currency has no monetary value and cannot be exchanged for real money or goods. This platform is not a gambling platform. It is a prediction game designed for campus fun and learning.`,
          },
          {
            title: "2. Eligibility",
            content: `The Platform is designed for students and staff of Hetauda School of Management. However, any person with a valid Google account may register. By registering, you confirm that you are at least 13 years of age and agree to use the Platform only for lawful, non-commercial purposes.`,
          },
          {
            title: "3. Virtual Currency",
            content: `Upon registration, you receive ₹1,00,000 in virtual credits. You may also earn a daily bonus of ₹100. These are in-game credits only and hold absolutely no real-world monetary value. The Platform administrators reserve the right to adjust, reset, or modify virtual balances at any time for any operational reason.`,
          },
          {
            title: "4. Prediction Markets",
            content: `Markets are created and resolved solely by authorised HSM administrators. The Platform uses a parimutuel pool system where winnings are distributed from the pool of all bets on a market. All market outcomes are determined based on real-world events. Administrators' decisions on market resolution are final and binding. There is no guarantee of uptime or market availability.`,
          },
          {
            title: "5. Prohibited Conduct",
            content: `You agree not to: exploit bugs or glitches to gain unfair advantages; create multiple accounts to manipulate markets; harass or abuse other users; attempt to reverse-engineer, scrape, or otherwise compromise the Platform's security; use the Platform for any commercial purpose; impersonate any individual or institution.`,
          },
          {
            title: "6. Account Termination",
            content: `We reserve the right to suspend or permanently terminate any account that violates these Terms without prior notice. All virtual currency and history associated with a terminated account will be forfeited.`,
          },
          {
            title: "7. Limitation of Liability",
            content: `Predic HSM is provided "as is" without warranties of any kind. The Platform operators are not liable for any data loss, downtime, inaccuracies, or any other issues arising from use of the Platform. Since no real money is involved, there is no financial liability at any point.`,
          },
          {
            title: "8. Changes to Terms",
            content: `These Terms may be updated at any time. Continued use of the Platform after changes have been posted constitutes acceptance of the revised Terms.`,
          },
          {
            title: "9. Disclaimer for School Administration",
            content: `Predic HSM is an independent student initiative and is not officially affiliated with, endorsed by, or operated by Hetauda School of Management or its administration. If the school administration or any authority has concerns about this platform, please contact us directly. We will promptly remove the site from the internet upon any legitimate administrative request. We hold complete respect for the institution and its policies.`,
          },
        ].map((section) => (
          <div key={section.title} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 card-shadow">
            <h2 className="text-sm font-bold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="text-center py-4 space-y-3">
          <p className="text-xs text-gray-400">Questions? Contact us through the About page.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/privacy">
              <button className="px-4 py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                Privacy Policy
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
