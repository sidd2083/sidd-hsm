import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { TrendingUp, Shield, Zap, Users, BookOpen, Trophy } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-8">
            <div className="flex items-start gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">About Predic Hsm</h1>
                <p className="text-sm text-indigo-600 font-semibold mt-1">Hetauda School of Management</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Predic Hsm is a campus-exclusive prediction market platform built for students and faculty of
              <strong className="text-gray-800"> Hetauda School of Management (HSM)</strong>. It's a fun, 
              educational project that lets you predict outcomes of real events — from college sports to 
              national headlines — using virtual currency. No real money. Pure skill and foresight.
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">What You Can Do</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Zap, color: "text-amber-600 bg-amber-50", title: "Start with Rs. 1,00,000", desc: "Every account gets ₹1 lakh in virtual currency instantly. No deposit, no credit card." },
              { icon: Trophy, color: "text-indigo-600 bg-indigo-50", title: "Climb the Leaderboard", desc: "Compete with classmates. The best predictor at HSM earns bragging rights." },
              { icon: BookOpen, color: "text-emerald-600 bg-emerald-50", title: "Campus-Relevant Markets", desc: "From football matches to canteen menus — markets that actually matter to you." },
              { icon: Shield, color: "text-rose-600 bg-rose-50", title: "100% Safe & Virtual", desc: "No real money at stake. All payouts are in virtual currency. Completely risk-free fun." },
              { icon: Users, color: "text-blue-600 bg-blue-50", title: "Daily Bonus", desc: "Claim ₹100 every day just for logging in. Stay active and keep your portfolio growing." },
              { icon: TrendingUp, color: "text-purple-600 bg-purple-50", title: "Portfolio Tracking", desc: "Track your P&L, win rate, and bet history. See exactly how good your instincts are." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-[#E8EAF0] p-5 flex gap-4 card-shadow">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color.split(" ")[1]}`}>
                  <item.icon className={`w-4.5 h-4.5 ${item.color.split(" ")[0]}`} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How payouts work */}
        <div className="bg-white rounded-2xl border border-[#E8EAF0] p-6 space-y-4 card-shadow">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">How Payouts Work</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We use a <strong className="text-gray-700">parimutuel pool system</strong> — all bets go into 
            a shared pool. When the market resolves, winners split the entire pool proportional to their stake.
          </p>
          <div className="bg-slate-50 rounded-xl border border-[#E8EAF0] p-4 font-mono text-sm text-gray-600">
            <p>your_payout = (your_stake ÷ winning_pool) × total_pool</p>
            <div className="mt-3 pt-3 border-t border-[#E8EAF0] text-xs text-gray-400 space-y-1 font-sans">
              <p><strong className="text-gray-500">Example:</strong> You bet Rs. 1,000 on YES.</p>
              <p>Total pool = Rs. 10,000 · YES pool = Rs. 4,000</p>
              <p>If YES wins → (1,000 ÷ 4,000) × 10,000 = <strong className="text-emerald-600">Rs. 2,500</strong></p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Higher bets on one side reduce that side's multiplier. Betting on unpopular outcomes is riskier but 
            pays more.
          </p>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl border border-[#E8EAF0] p-6 space-y-4 card-shadow">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Rules</h2>
          <ul className="space-y-3">
            {[
              "100% virtual — no real money involved at any point.",
              "Minimum bet is Rs. 100 per prediction.",
              "Daily bonus of Rs. 100 resets each day after 6 AM.",
              "Markets are created and resolved by HSM administrators only.",
              "Betting closes at the scheduled lock time — no exceptions.",
              "Payouts are distributed automatically when a market is resolved.",
              "Attempting to exploit bugs or manipulate outcomes will result in a ban.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">FAQ</h2>
          {[
            { q: "Is real money involved?", a: "No. Predic Hsm is 100% virtual. You start with ₹1,00,000 and earn more through correct predictions and daily bonuses. Nothing is real currency." },
            { q: "Who can use this platform?", a: "Predic Hsm is designed for students and faculty of Hetauda School of Management. Anyone can sign up with a Google account." },
            { q: "How are markets resolved?", a: "HSM administrators resolve markets once the real-world event outcome is confirmed. Payouts are automatic and immediate." },
            { q: "What happens if no one wins?", a: "If a market has zero bets on the winning side, no payouts are made (there's nobody to pay). The pool stays at zero." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl border border-[#E8EAF0] p-5 card-shadow">
              <p className="font-bold text-gray-800 text-sm mb-1.5">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-6 space-y-4">
          <p className="text-gray-500 font-medium">Made with love for HSM students</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth">
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-indigo-200">
                Get Started Free
              </button>
            </Link>
            <Link href="/">
              <button className="px-6 py-2.5 bg-white hover:bg-slate-50 text-gray-700 text-sm font-semibold rounded-xl border border-[#E8EAF0] transition-colors card-shadow">
                Browse Markets
              </button>
            </Link>
          </div>
          <p className="text-xs text-gray-300">Virtual currency only · No real money · For campus fun only</p>
        </div>
      </div>
    </Layout>
  );
}
