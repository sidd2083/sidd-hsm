import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGetMe, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

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

  const [form, setForm] = useState({ displayName: "", academicStream: "", section: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me) {
      setForm({
        displayName: me.displayName ?? "",
        academicStream: me.academicStream ?? "",
        section: me.section ?? "",
      });
    }
  }, [me]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { data: { displayName: form.displayName, academicStream: form.academicStream as never, section: form.section } },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: () => toast.error("Failed to update profile"),
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your profile information</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background"
                placeholder="Your name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Academic Stream</label>
              <select
                value={form.academicStream}
                onChange={(e) => setForm((f) => ({ ...f, academicStream: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background appearance-none"
              >
                <option value="">Select stream</option>
                {STREAMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Section</label>
              <input
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border border-border text-sm outline-none focus:border-foreground transition-colors bg-background uppercase"
                placeholder="e.g. A"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                value={me?.email ?? ""}
                disabled
                className="w-full h-11 px-3 rounded-lg border border-border text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email is tied to your Google account and cannot be changed.</p>
            </div>

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {updateProfile.isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Danger Zone</h3>
            <p className="text-xs text-muted-foreground">Sign out of your account</p>
          </div>
          <button
            onClick={signOut}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
