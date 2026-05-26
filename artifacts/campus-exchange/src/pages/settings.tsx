import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGetMe, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { LogOut, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STREAMS = [
  "Class 11 - Science",
  "Class 11 - Management",
  "Class 12 - Science",
  "Class 12 - Management",
  "Bachelor",
];

export default function Settings() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({ displayName: "", stream: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me) {
      setForm({
        displayName: me.displayName ?? "",
        stream: me.stream ?? "",
      });
    }
  }, [me]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { data: { displayName: form.displayName, stream: form.stream } },
      {
        onSuccess: () => {
          toast.success("Profile saved successfully");
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
        onError: () => toast.error("Failed to save profile"),
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-5 py-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your Predic HSM profile</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-700">Profile Information</p>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-600">Display Name</label>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 transition-all bg-white"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-600">Academic Stream</label>
                <select
                  value={form.stream}
                  onChange={(e) => setForm((f) => ({ ...f, stream: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 transition-all bg-white appearance-none"
                >
                  <option value="">Select your stream</option>
                  {STREAMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-600">Email Address</label>
                <input
                  value={me?.email ?? ""}
                  disabled
                  className="w-full h-10 px-3.5 rounded-lg border border-gray-100 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">Linked to your Google account — cannot be changed.</p>
              </div>

              <button
                type="submit"
                disabled={updateProfile.isPending}
                className={cn(
                  "w-full h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  saved
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
                )}
              >
                {updateProfile.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 card-shadow">
          <p className="text-sm font-semibold text-gray-700 mb-0.5">Sign Out</p>
          <p className="text-xs text-gray-400 mb-4">You will be signed out of your Predic HSM account.</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-red-100 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
