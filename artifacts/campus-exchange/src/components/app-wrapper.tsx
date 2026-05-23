import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGetMe, getGetMeQueryKey, useClaimDailyBonus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProfile } from "@workspace/api-client-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  academicStream: z.enum(["Class 11 - Science", "Class 11 - Management", "Class 12 - Science", "Class 12 - Management", "Bachelor"], { required_error: "Select a stream" }),
  section: z.string().min(1, "Section is required"),
});

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: me, isLoading: meLoading, error } = useGetMe({
    query: {
      enabled: !!user,
      queryKey: getGetMeQueryKey(),
      retry: false
    }
  });

  const claimBonus = useClaimDailyBonus();

  useEffect(() => {
    if (me && !me.lastDailyClaimDate) {
      // Very basic logic for daily claim trigger - ideally backend handles if already claimed today
      claimBonus.mutate(undefined, {
        onSuccess: (data) => {
          if (data.claimed) {
            toast.success(`Claimed daily bonus! New balance: ${data.walletBalance}`);
            queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          }
        }
      });
    }
  }, [me]);

  const createProfile = useCreateProfile();

  const { register, handleSubmit, control, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    createProfile.mutate({ data }, {
      onSuccess: () => {
        toast.success("Profile created successfully!");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err) => {
        toast.error("Failed to create profile.");
      }
    });
  };

  const showOnboarding = user && !loading && !meLoading && (error || !me);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {children}
      <Dialog open={!!showOnboarding}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" placeholder="e.g. John Doe" {...register("displayName")} />
              {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Academic Stream</Label>
              <Controller
                name="academicStream"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 11 - Science">Class 11 - Science</SelectItem>
                      <SelectItem value="Class 11 - Management">Class 11 - Management</SelectItem>
                      <SelectItem value="Class 12 - Science">Class 12 - Science</SelectItem>
                      <SelectItem value="Class 12 - Management">Class 12 - Management</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.academicStream && <p className="text-sm text-destructive">{errors.academicStream.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input id="section" placeholder="e.g. A" {...register("section")} />
              {errors.section && <p className="text-sm text-destructive">{errors.section.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={createProfile.isPending}>
              {createProfile.isPending ? "Saving..." : "Start Trading"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
