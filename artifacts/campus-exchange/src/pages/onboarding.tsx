import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useCreateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PredicLogo } from "@/components/logo";
import { CheckCircle, ChevronRight, Sparkles, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const STREAMS = [
  { value: "Class 11 - Science", label: "Class 11 — Science" },
  { value: "Class 11 - Management", label: "Class 11 — Management" },
  { value: "Class 12 - Science", label: "Class 12 — Science" },
  { value: "Class 12 - Management", label: "Class 12 — Management" },
  { value: "Bachelor", label: "Bachelor" },
];

const schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  academicStream: z.enum([
    "Class 11 - Science",
    "Class 11 - Management",
    "Class 12 - Science",
    "Class 12 - Management",
    "Bachelor",
  ]),
  section: z.string().min(1, "Section is required"),
  terms: z.boolean().refine((v) => v === true, { message: "You must accept the terms" }),
});

type FormData = z.infer<typeof schema>;

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createProfile = useCreateProfile();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName ?? "",
      terms: false,
    },
  });

  const displayName = watch("displayName");
  const academicStream = watch("academicStream");

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading]);

  const onSubmit = (data: FormData) => {
    createProfile.mutate(
      { data: { displayName: data.displayName, academicStream: data.academicStream, section: data.section } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          navigate("/");
        },
      }
    );
  };

  const canProceedStep1 = displayName?.length >= 2 && !!academicStream;

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40 flex">
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/15 rounded-2xl p-1.5">
              <PredicLogo size={32} />
            </div>
            <span className="font-bold text-xl">Predic Hsm</span>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold leading-tight">
              Predict the<br />
              <span className="text-white/70">future of</span><br />
              your campus.
            </div>
            <p className="text-white/60 text-lg leading-relaxed max-w-xs">
              Trade on events that matter to you. Start with ₹1,00,000 in virtual currency.
            </p>
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: TrendingUp, text: "Real-time prediction markets" },
            { icon: Sparkles, text: "Daily bonuses & rewards" },
            { icon: Shield, text: "100% virtual, zero financial risk" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <PredicLogo size={28} />
            <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Predic Hsm
            </span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className={cn("h-1 rounded-full transition-all", step === 1 ? "w-8 bg-violet-600" : "w-4 bg-violet-200")} />
                <div className={cn("h-1 rounded-full transition-all", step === 2 ? "w-8 bg-violet-600" : "w-4 bg-violet-200")} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Step {step} of 2</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {step === 1 ? "Set up your profile" : "Almost there!"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {step === 1
                ? "Tell us about yourself to personalise your experience."
                : "Review the terms and get your ₹1,00,000 starting balance."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Your Name</label>
                  <input
                    {...register("displayName")}
                    placeholder="e.g. Arjun Sharma"
                    className={cn(
                      "w-full h-12 px-4 rounded-xl border text-sm transition-all outline-none bg-white",
                      "focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
                      errors.displayName ? "border-red-400" : "border-border/60"
                    )}
                  />
                  {errors.displayName && (
                    <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Academic Stream</label>
                  <Controller
                    name="academicStream"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 gap-2">
                        {STREAMS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => field.onChange(s.value)}
                            className={cn(
                              "flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                              field.value === s.value
                                ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20"
                                : "bg-white border-border/60 text-foreground hover:border-violet-300 hover:bg-violet-50"
                            )}
                          >
                            {s.label}
                            {field.value === s.value && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.academicStream && (
                    <p className="text-xs text-red-500">{errors.academicStream.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2",
                    canProceedStep1
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Section</label>
                  <input
                    {...register("section")}
                    placeholder="e.g. A, B, C..."
                    className={cn(
                      "w-full h-12 px-4 rounded-xl border text-sm transition-all outline-none bg-white uppercase",
                      "focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
                      errors.section ? "border-red-400" : "border-border/60"
                    )}
                  />
                  {errors.section && (
                    <p className="text-xs text-red-500">{errors.section.message}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span className="font-semibold text-sm text-violet-800">Welcome gift</span>
                  </div>
                  <p className="text-2xl font-bold text-violet-700">₹1,00,000</p>
                  <p className="text-xs text-violet-600/70">Virtual credits deposited instantly to your wallet upon joining.</p>
                </div>

                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                          field.value
                            ? "bg-violet-600 border-violet-600"
                            : "border-border/60 group-hover:border-violet-400"
                        )}
                      >
                        {field.value && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        I agree that Predic Hsm uses virtual currency only. No real money is involved.
                        I'm here for campus fun and accept the{" "}
                        <span className="text-violet-600 font-semibold">Terms & Conditions</span>.
                      </span>
                    </label>
                  )}
                />
                {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={createProfile.isPending}
                    className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {createProfile.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Start Trading <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
