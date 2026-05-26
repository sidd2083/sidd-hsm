import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useCreateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, ChevronRight, TrendingUp } from "lucide-react";
import { PredicLogo } from "@/components/logo";
import { cn } from "@/lib/utils";

const STREAMS = [
  { value: "Class 11 - Science",    label: "Class 11 — Science" },
  { value: "Class 11 - Management", label: "Class 11 — Management" },
  { value: "Class 12 - Science",    label: "Class 12 — Science" },
  { value: "Class 12 - Management", label: "Class 12 — Management" },
  { value: "Bachelor",              label: "Bachelor (BBA / BCA)" },
];

const schema = z.object({
  displayName:    z.string().min(2, "Name must be at least 2 characters"),
  academicStream: z.enum([
    "Class 11 - Science",
    "Class 11 - Management",
    "Class 12 - Science",
    "Class 12 - Management",
    "Bachelor",
  ]),
  terms: z.boolean().refine((v) => v === true, { message: "Please accept to continue" }),
});

type FormData = z.infer<typeof schema>;

/* ─── Celebration confetti squares ─── */
const CONFETTI_COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#8b5cf6"];
function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[60]">
      {Array.from({ length: 56 }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const left  = `${(i * 31 + 7) % 100}%`;
        const delay = `${(i * 0.07).toFixed(2)}s`;
        const dur   = `${1.2 + (i % 7) * 0.18}s`;
        const size  = `${6 + (i % 5) * 2}px`;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: "-12px",
              width: size,
              height: size,
              background: color,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              animationName: "confettiFall",
              animationDuration: dur,
              animationDelay: delay,
              animationTimingFunction: "linear",
              animationIterationCount: "3",
              animationFillMode: "both",
              transform: `rotate(${i * 37}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Animated number counter ─── */
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1600;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span>
      {new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(count)}
    </span>
  );
}

/* ─── Welcome modal ─── */
function WelcomeModal({ name, onClose }: { name: string; onClose: () => void }) {
  const quickStats = [
    { label: "Bet on markets",   icon: TrendingUp },
    { label: "Win leaderboard",  icon: CheckCircle },
    { label: "+₹100 daily",      icon: ChevronRight },
  ];

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scaleX(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scaleX(-1); opacity: 0; }
        }
        @keyframes modalPop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes badgeBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .modal-pop    { animation: modalPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .badge-bounce { animation: badgeBounce 1.2s ease-in-out 0.5s infinite; }
      `}</style>
      <Confetti />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="modal-pop bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="badge-bounce inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <PredicLogo size={20} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">
            Welcome, {name.split(" ")[0]}!
          </h2>
          <p className="text-[14px] text-gray-500 mb-6">
            Your account is ready. Here's your starting balance:
          </p>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-1">Virtual Balance</p>
            <p className="text-4xl font-black text-white tracking-tight">
              <AnimatedCounter target={100000} />
            </p>
            <p className="text-[12px] text-indigo-300 mt-1.5">100% virtual — no real money</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            {quickStats.map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl py-3 px-1">
                <div className="flex items-center justify-center mb-1.5">
                  <item.icon className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <TrendingUp className="w-4 h-4" /> Start Trading
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main onboarding page ─── */
export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient  = useQueryClient();
  const createProfile = useCreateProfile();
  const [step, setStep] = useState<1 | 2>(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: user?.displayName ?? "", terms: false },
  });

  const displayName    = watch("displayName");
  const academicStream = watch("academicStream");

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading]);

  const onSubmit = (data: FormData) => {
    setSubmittedName(data.displayName);
    createProfile.mutate(
      { data: { displayName: data.displayName, stream: data.academicStream, username: "" } },
      {
        onSuccess: () => {
          if (user) localStorage.removeItem(`needs_onboarding_${user.uid}`);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setShowWelcome(true);
        },
      }
    );
  };

  const canProceedStep1 = (displayName?.length ?? 0) >= 2 && !!academicStream;

  if (loading) return null;

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          name={submittedName}
          onClose={() => { setShowWelcome(false); navigate("/"); }}
        />
      )}

      <div className="min-h-screen bg-slate-50 flex">
        {/* ── Left branding panel ── */}
        <div className="hidden lg:flex flex-col w-[380px] bg-slate-900 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/10" />

          <div className="relative z-10 flex flex-col flex-1 p-12">
            <div className="flex items-center gap-3 mb-14">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <PredicLogo size={18} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-[17px] text-white tracking-tight">Predic</span>
                <span className="font-black text-[17px] text-indigo-400 tracking-tight">HSM</span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.18em] mb-5">HSM College</p>
              <h2 className="text-3xl font-black text-white leading-tight mb-4">
                Predict.<br />Compete.<br />
                <span className="text-indigo-400">Win.</span>
              </h2>
              <p className="text-slate-400 text-[14px] leading-relaxed max-w-[260px]">
                Trade virtual currency on college and national events. Zero real money, all the fun.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-0">
              {[
                "₹1,00,000 starting balance",
                "₹100 daily bonus",
                "100% virtual — no real money",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 py-3.5 text-slate-300 text-[14px]">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[400px]">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                <PredicLogo size={16} />
              </div>
              <span className="font-bold text-[15px] text-gray-900">
                Predic <span className="text-indigo-600">HSM</span>
              </span>
            </div>

            {/* Step indicator */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1.5">
                  <div className={cn("h-1 w-8 rounded-full transition-all", step >= 1 ? "bg-indigo-600" : "bg-gray-200")} />
                  <div className={cn("h-1 w-8 rounded-full transition-all", step >= 2 ? "bg-indigo-600" : "bg-gray-200")} />
                </div>
                <span className="text-[12px] text-gray-400 font-medium">Step {step} of 2</span>
              </div>
              <h1 className="text-[22px] font-black text-gray-900">
                {step === 1 ? "Set up your profile" : "Claim your ₹1,00,000"}
              </h1>
              <p className="text-[14px] text-gray-500 mt-1">
                {step === 1
                  ? "Tell us about yourself to personalise your experience."
                  : "Review and confirm to start trading."}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">Display Name</label>
                    <input
                      {...register("displayName")}
                      placeholder="Your name"
                      autoFocus
                      className={cn(
                        "w-full h-11 px-4 rounded-xl border text-[14px] outline-none bg-white transition-all font-medium",
                        "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15",
                        errors.displayName ? "border-red-400" : "border-gray-200"
                      )}
                    />
                    {errors.displayName && (
                      <p className="text-[12px] text-red-500">{errors.displayName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-gray-700">College Stream</label>
                    <Controller
                      name="academicStream"
                      control={control}
                      render={({ field }) => (
                        <div className="grid gap-2">
                          {STREAMS.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => field.onChange(s.value)}
                              className={cn(
                                "flex items-center justify-between w-full px-4 py-3 rounded-xl border text-[14px] font-medium transition-all text-left",
                                field.value === s.value
                                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                              )}
                            >
                              {s.label}
                              {field.value === s.value && (
                                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                    {errors.academicStream && (
                      <p className="text-[12px] text-red-500">{errors.academicStream.message}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                    className={cn(
                      "w-full h-11 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all",
                      canProceedStep1
                        ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-md"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Balance preview */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-4 text-[60px] leading-none select-none">₹</div>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-2">Your Welcome Gift</p>
                    <p className="text-4xl font-black text-white tracking-tight">₹1,00,000</p>
                    <p className="text-[13px] text-indigo-200 mt-2">Virtual credits · Added instantly when you join</p>
                  </div>

                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-start gap-3 cursor-pointer bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                            field.value ? "bg-indigo-600 border-indigo-600" : "border-gray-300 hover:border-indigo-400"
                          )}
                        >
                          {field.value && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                        </button>
                        <span className="text-[13px] text-gray-600 leading-relaxed">
                          I understand this is virtual currency only. No real money. I accept the{" "}
                          <a href="/terms" target="_blank" className="text-indigo-600 font-semibold underline underline-offset-2">
                            Terms & Conditions
                          </a>.
                        </span>
                      </label>
                    )}
                  />
                  {errors.terms && (
                    <p className="text-[12px] text-red-500">{errors.terms.message}</p>
                  )}

                  {createProfile.isError && (
                    <p className="text-[13px] text-red-500 bg-red-50 rounded-xl px-4 py-3 text-center border border-red-100">
                      Failed to create profile. The server needs to be configured first — ask the admin.
                    </p>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createProfile.isPending}
                      className="flex-[2] h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] shadow-md"
                    >
                      {createProfile.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Claim ₹1,00,000 <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
