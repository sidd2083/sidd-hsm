import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useCreateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PredicLogo } from "@/components/logo";
import { CheckCircle, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STREAMS = [
  { value: "Class 11 - Science", label: "Class 11 — Science" },
  { value: "Class 11 - Management", label: "Class 11 — Management" },
  { value: "Class 12 - Science", label: "Class 12 — Science" },
  { value: "Class 12 - Management", label: "Class 12 — Management" },
  { value: "Bachelor", label: "Bachelor (BBA / BCA)" },
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
  terms: z.boolean().refine((v) => v === true, { message: "Please accept to continue" }),
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
    defaultValues: { displayName: user?.displayName ?? "", terms: false },
  });

  const displayName = watch("displayName");
  const academicStream = watch("academicStream");

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading]);

  const onSubmit = (data: FormData) => {
    createProfile.mutate(
      { data: { displayName: data.displayName, academicStream: data.academicStream, section: "" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          navigate("/");
        },
      }
    );
  };

  const canProceedStep1 = (displayName?.length ?? 0) >= 2 && !!academicStream;

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      <div className="hidden lg:flex flex-col justify-between w-[380px] bg-indigo-600 p-10 text-white shrink-0 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-700 rounded-full translate-x-1/3 translate-y-1/3 opacity-60" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <PredicLogo size={20} />
            </div>
            <span className="font-bold text-[15px]">Predic HSM</span>
          </div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-3">HSM College</p>
          <h2 className="text-2xl font-bold leading-snug">Predict. Compete.<br />Win bragging rights.</h2>
          <p className="text-indigo-200 text-sm leading-relaxed mt-3 max-w-[260px]">
            Trade virtual currency on college and national events. Zero real money, all the fun.
          </p>
        </div>
        <div className="relative z-10 space-y-2.5">
          {[
            "₹1,00,000 starting balance",
            "₹100 daily bonus",
            "100% virtual — no real money",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-indigo-100 text-sm">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <PredicLogo size={16} />
            </div>
            <span className="font-bold text-sm text-gray-900">Predic <span className="text-indigo-600">HSM</span></span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex gap-1">
                <div className={cn("h-0.5 w-5 rounded-full transition-all", step === 1 ? "bg-indigo-600" : "bg-indigo-200")} />
                <div className={cn("h-0.5 w-5 rounded-full transition-all", step === 2 ? "bg-indigo-600" : "bg-indigo-200")} />
              </div>
              <span className="text-xs text-gray-400">{step} / 2</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {step === 1 ? "Set up your profile" : "Review & confirm"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 1 ? "Tell us about yourself to personalise your experience." : "Claim your starting balance and get trading."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    {...register("displayName")}
                    placeholder="Your name"
                    autoFocus
                    className={cn(
                      "w-full h-10 px-3.5 rounded-lg border text-sm outline-none bg-white transition-all",
                      "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15",
                      errors.displayName ? "border-red-400" : "border-gray-200"
                    )}
                  />
                  {errors.displayName && <p className="text-xs text-red-500">{errors.displayName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">College Stream</label>
                  <Controller
                    name="academicStream"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-1.5">
                        {STREAMS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => field.onChange(s.value)}
                            className={cn(
                              "flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
                              field.value === s.value
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                            )}
                          >
                            {s.label}
                            {field.value === s.value && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.academicStream && <p className="text-xs text-red-500">{errors.academicStream.message}</p>}
                </div>

                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className={cn(
                    "w-full h-10 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all",
                    canProceedStep1
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Welcome Gift</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-700 font-mono">₹1,00,000</p>
                  <p className="text-xs text-indigo-500 mt-0.5">Virtual credits added instantly when you join.</p>
                </div>

                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                          field.value ? "bg-indigo-600 border-indigo-600" : "border-gray-300 hover:border-indigo-400"
                        )}
                      >
                        {field.value && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                      </button>
                      <span className="text-sm text-gray-500 leading-relaxed">
                        I understand this platform uses virtual currency only. No real money involved. I accept the{" "}
                        <a href="/terms" target="_blank" className="text-indigo-600 underline underline-offset-2">Terms & Conditions</a>.
                      </span>
                    </label>
                  )}
                />
                {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

                {createProfile.isError && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">
                    Failed to create profile. Please try again.
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={createProfile.isPending}
                    className="flex-[2] h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {createProfile.isPending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Start Trading <ChevronRight className="w-3.5 h-3.5" /></>
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
