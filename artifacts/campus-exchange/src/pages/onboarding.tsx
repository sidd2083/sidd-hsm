import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useCreateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, ChevronRight, Gift } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] bg-slate-900 p-12 text-white shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-black text-base">P</span>
            </div>
            <span className="font-bold text-[16px]">Predic HSM</span>
          </div>
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">HSM College</p>
          <h2 className="text-3xl font-black leading-tight">
            Predict.<br />Compete.<br />
            <span className="text-indigo-400">Win.</span>
          </h2>
          <p className="text-slate-400 text-[14px] leading-relaxed mt-4 max-w-[260px]">
            Trade virtual currency on college and national events. Zero real money, all the fun.
          </p>
        </div>

        <div className="relative z-10 divide-y divide-slate-800">
          {[
            "₹10,000 starting balance",
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="font-bold text-[15px] text-gray-900">Predic <span className="text-indigo-600">HSM</span></span>
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
              {step === 1 ? "Set up your profile" : "Claim your balance"}
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
              {step === 1 ? "Tell us about yourself to personalise your experience." : "Review and confirm to start trading."}
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
                  {errors.displayName && <p className="text-[12px] text-red-500">{errors.displayName.message}</p>}
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
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                            )}
                          >
                            {s.label}
                            {field.value === s.value && <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.academicStream && <p className="text-[12px] text-red-500">{errors.academicStream.message}</p>}
                </div>

                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className={cn(
                    "w-full h-11 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all",
                    canProceedStep1
                      ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  )}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Welcome gift card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-indigo-300" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">Welcome Gift</span>
                  </div>
                  <p className="text-4xl font-black tracking-tight">₹10,000</p>
                  <p className="text-[13px] text-indigo-200 mt-1.5">Virtual credits added instantly when you join.</p>
                </div>

                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-start gap-3 cursor-pointer bg-white border border-gray-200 rounded-xl p-4">
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
                        <a href="/terms" target="_blank" className="text-indigo-600 font-semibold underline underline-offset-2">Terms & Conditions</a>.
                      </span>
                    </label>
                  )}
                />
                {errors.terms && <p className="text-[12px] text-red-500">{errors.terms.message}</p>}

                {createProfile.isError && (
                  <p className="text-[13px] text-red-500 bg-red-50 rounded-xl px-4 py-3 text-center border border-red-100">
                    Failed to create profile. Please try again.
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
                    className="flex-[2] h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
                  >
                    {createProfile.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Start Trading <ChevronRight className="w-4 h-4" /></>
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
