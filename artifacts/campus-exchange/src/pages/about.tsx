import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { TrendingUp, Shield, Zap, Users, BookOpen, Trophy, AlertTriangle } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5 py-2">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">
          <div className="h-1 bg-indigo-600" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">About Predic HSM</h1>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">Hetauda School of Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Predic HSM is a campus prediction market built exclusively for students of{" "}
              <strong className="text-gray-800">Hetauda School of Management (HSM)</strong>. It is a fun, educational project where you predict outcomes of real campus and national events using virtual currency. No real money — pure skill and instinct.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-amber-800">Note to School Administration</p>
              <p className="text-[13px] text-amber-700 leading-relaxed">
                Predic HSM is an independent student project and is not affiliated with the school administration. It does not involve real money and does not promote betting or gambling in any form. This is purely an educational prediction game. If school administration has any concerns or objections about this platform,{" "}
                <strong>please contact us and we will immediately and completely remove this site from the internet</strong>. We have full respect for HSM and its policies.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">What You Can Do</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Zap, color: "text-amber-600 bg-amber-50", title: "Start with ₹1,00,000", desc: "Every account gets ₹1 lakh in virtual currency. No deposit or credit card needed." },
              { icon: Trophy, color: "text-indigo-600 bg-indigo-50", title: "Climb the Leaderboard", desc: "Compete with classmates. The sharpest predictor at HSM earns bragging rights." },
              { icon: BookOpen, color: "text-emerald-600 bg-emerald-50", title: "Campus-Relevant Markets", desc: "Football results, college events, national news — markets that matter to you." },
              { icon: Shield, color: "text-rose-600 bg-rose-50", title: "100% Safe & Virtual", desc: "No real money at stake, ever. Completely safe and risk-free entertainment." },
              { icon: Users, color: "text-blue-600 bg-blue-50", title: "Daily Bonus", desc: "Claim ₹100 every day just for logging in. Stay active and grow your portfolio." },
              { icon: TrendingUp, color: "text-purple-600 bg-purple-50", title: "Portfolio Tracking", desc: "Track your P&L, win rate, and history. See exactly how sharp your instincts are." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3 card-shadow">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color.split(" ")[1]}`}>
                  <item.icon className={`w-4 h-4 ${item.color.split(" ")[0]}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-[13px]">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 card-shadow">
          <h2 className="text-base font-bold text-gray-900 mb-3">How Payouts Work</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            We use a <strong className="text-gray-700">parimutuel pool system</strong> — all bets go into a shared pool. When the market resolves, winners split the entire pool proportionally to their stake.
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 font-mono text-sm text-gray-600">
            <p>your_payout = (your_stake ÷ winning_pool) × total_pool</p>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-0.5 font-sans">
              <p className="font-medium text-gray-500 mb-1">Example:</p>
              <p>You bet ₹1,000 on YES · Total pool = ₹10,000 · YES pool = ₹4,000</p>
              <p>If YES wins → (1,000 ÷ 4,000) × 10,000 = <strong className="text-emerald-600">₹2,500</strong></p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 card-shadow">
          <h2 className="text-base font-bold text-gray-900 mb-3">Rules</h2>
          <ul className="space-y-2.5">
            {[
              "100% virtual — no real money involved at any point.",
              "Minimum bet is ₹100 per prediction.",
              "Daily bonus of ₹100 resets each day.",
              "Markets are created and resolved by HSM administrators only.",
              "Betting closes at the scheduled lock time — no exceptions.",
              "Payouts are distributed automatically when a market is resolved.",
              "Attempting to exploit bugs or manipulate outcomes will result in a ban.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="mt-0.5 w-4.5 h-4.5 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-base font-bold text-gray-900">FAQ</h2>
          {[
            { q: "Is real money involved?", a: "No. Predic HSM is 100% virtual. You start with ₹1,00,000 and earn more through correct predictions and daily bonuses. Nothing is real currency." },
            { q: "Who can use this platform?", a: "Predic HSM is designed for students and staff of Hetauda School of Management. Anyone with a Google account can sign up." },
            { q: "How are markets resolved?", a: "HSM administrators resolve markets once the real-world event outcome is confirmed. Payouts are automatic and immediate." },
            { q: "Is this affiliated with the school?", a: "No. This is an independent student project and is not officially affiliated with or endorsed by HSM administration." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-100 rounded-xl p-4 card-shadow">
              <p className="font-semibold text-gray-800 text-sm mb-1">{q}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="text-center py-4 space-y-4">
          <p className="text-sm text-gray-400 font-medium">Made with care for HSM students</p>
          <div className="flex items-center justify-center gap-2.5">
            <Link href="/auth">
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Get Started
              </button>
            </Link>
            <Link href="/">
              <button className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-colors card-shadow">
                Browse Markets
              </button>
            </Link>
          </div>
          <p className="text-xs text-gray-300">Virtual currency only · No real money · For campus entertainment only</p>
        </div>
      </div>
    </Layout>
  );
}
