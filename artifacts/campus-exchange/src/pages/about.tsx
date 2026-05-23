import { Layout } from "@/components/layout";
import { TrendingUp, Shield, Zap, Users } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Real Prediction Markets",
    description: "Trade on outcomes that matter to your campus — sports, events, exams, and more. Parimutuel pools ensure fair payouts every time.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Zap,
    title: "Virtual Economy",
    description: "Start with ₹1,00,000 in virtual currency. No real money — just the thrill of being right. Daily bonuses keep you in the game.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Users,
    title: "Compete with Classmates",
    description: "Climb the leaderboard, flex your net worth, and prove you have the sharpest instincts in your school.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Safe & Fair",
    description: "Completely virtual — no financial risk. Every market is resolved transparently. Admin-verified outcomes only.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

const faqs = [
  {
    q: "Is real money involved?",
    a: "No. Predic Hsm uses 100% virtual currency. You start with ₹1,00,000 and earn more through correct predictions and daily bonuses.",
  },
  {
    q: "How does betting work?",
    a: "We use a parimutuel pool system. All bets go into a shared pool, and winners split the total pool proportionally based on how much they staked.",
  },
  {
    q: "How are markets resolved?",
    a: "Markets are created and resolved by admins once the real-world event outcome is known. Winnings are automatically distributed.",
  },
  {
    q: "What is the daily bonus?",
    a: "Log in each day after 6 AM to claim ₹100 in free virtual currency. It resets every 24 hours.",
  },
];

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-20 py-8">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            🎓 Built for Students
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Predict. Win. <span className="text-violet-600">Repeat.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Predic Hsm is a campus prediction market where your knowledge and instincts are your greatest assets.
            No real money, infinite bragging rights.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${f.bg}`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-card border border-border/60 rounded-2xl p-6 space-y-2">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-10 text-center space-y-4 text-white">
          <h2 className="text-3xl font-bold">Ready to start predicting?</h2>
          <p className="text-violet-100 text-lg">Sign in with Google and get ₹1,00,000 to begin your journey.</p>
        </section>
      </div>
    </Layout>
  );
}
