import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCreateMarket, useListMarkets, useAdminResolveMarket, getListMarketsQueryKey, useAdminAdjustWallet, useAdminListUsers, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="bg-card p-8 rounded-xl border shadow-sm max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold">Admin Access</h2>
          <Input 
            type="password" 
            placeholder="Admin Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password === 'campus123') setIsAuthenticated(true);
            }}
          />
          <Button className="w-full" onClick={() => {
            if (password === 'campus123') setIsAuthenticated(true);
            else toast.error("Invalid password");
          }}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="markets">
          <TabsList>
            <TabsTrigger value="markets">Manage Markets</TabsTrigger>
            <TabsTrigger value="create">Create Market</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="markets" className="pt-4">
            <ManageMarkets />
          </TabsContent>
          <TabsContent value="create" className="pt-4">
            <CreateMarket />
          </TabsContent>
          <TabsContent value="users" className="pt-4">
            <ManageUsers />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ManageMarkets() {
  const { data: markets, isLoading } = useListMarkets();
  const resolveMarket = useAdminResolveMarket();
  const queryClient = useQueryClient();

  const handleResolve = (id: string, outcome: "YES" | "NO") => {
    if (!confirm(`Are you sure you want to resolve this market as ${outcome}?`)) return;
    
    resolveMarket.mutate({ id, data: { outcome } }, {
      onSuccess: () => {
        toast.success(`Market resolved as ${outcome}`);
        queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
      },
      onError: (e: any) => toast.error(e?.message || "Failed to resolve market")
    });
  };

  if (isLoading) return <div>Loading markets...</div>;

  const activeMarkets = markets?.filter(m => m.status === 'active' || m.status === 'locked') || [];

  return (
    <div className="space-y-4">
      {activeMarkets.map(market => (
        <div key={market.id} className="p-4 border rounded-lg bg-card flex justify-between items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1 font-mono">{market.id}</div>
            <h3 className="font-semibold">{market.question}</h3>
            <div className="text-sm flex gap-4 mt-2">
              <span className="text-green-600">YES Pool: {market.yesPool}</span>
              <span className="text-red-600">NO Pool: {market.noPool}</span>
              <span>Status: {market.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleResolve(market.id, "YES")}>Resolve YES</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleResolve(market.id, "NO")}>Resolve NO</Button>
          </div>
        </div>
      ))}
      {activeMarkets.length === 0 && <p className="text-muted-foreground">No unresolved markets found.</p>}
    </div>
  );
}

function CreateMarket() {
  const createMarket = useAdminCreateMarket();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    question: "",
    category: "social" as any,
    hoursToLock: "24"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lockTimestamp = Date.now() + parseInt(formData.hoursToLock) * 60 * 60 * 1000;
    
    createMarket.mutate({
      data: {
        question: formData.question,
        category: formData.category,
        lockTimestamp
      }
    }, {
      onSuccess: () => {
        toast.success("Market created!");
        setFormData({ ...formData, question: "" });
        queryClient.invalidateQueries({ queryKey: getListMarketsQueryKey() });
      },
      onError: (e: any) => toast.error(e?.message || "Failed to create market")
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input 
          required 
          value={formData.question} 
          onChange={e => setFormData({...formData, question: e.target.value})} 
          placeholder="Will..." 
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="national">National</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Hours to Lock</Label>
        <Input 
          type="number" 
          required 
          value={formData.hoursToLock} 
          onChange={e => setFormData({...formData, hoursToLock: e.target.value})} 
          min="1"
        />
      </div>
      <Button type="submit" disabled={createMarket.isPending}>Create Market</Button>
    </form>
  );
}

function ManageUsers() {
  const { data: users, isLoading } = useAdminListUsers();
  const adjustWallet = useAdminAdjustWallet();
  const queryClient = useQueryClient();
  const [adjustment, setAdjustment] = useState({ uid: "", amount: "", reason: "Admin adjustment" });

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustment.uid || !adjustment.amount) return;
    
    adjustWallet.mutate({
      uid: adjustment.uid,
      data: {
        amount: parseFloat(adjustment.amount),
        reason: adjustment.reason
      }
    }, {
      onSuccess: () => {
        toast.success("Wallet adjusted");
        setAdjustment({ ...adjustment, amount: "" });
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      },
      onError: (e: any) => toast.error(e?.message || "Failed to adjust wallet")
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Users List</h3>
        {isLoading ? <div>Loading users...</div> : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {users?.map(user => (
              <div key={user.uid} className="p-3 border rounded-lg bg-card text-sm cursor-pointer hover:bg-accent" onClick={() => setAdjustment({...adjustment, uid: user.uid})}>
                <div className="font-medium flex justify-between">
                  <span>{user.displayName}</span>
                  <span className="font-mono">🪙 {user.walletBalance}</span>
                </div>
                <div className="text-muted-foreground font-mono text-xs mt-1">UID: {user.uid}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Adjust Wallet</h3>
        <form onSubmit={handleAdjust} className="space-y-4 border p-4 rounded-xl bg-card">
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input required value={adjustment.uid} onChange={e => setAdjustment({...adjustment, uid: e.target.value})} placeholder="Select a user from the list" />
          </div>
          <div className="space-y-2">
            <Label>Amount to Add (can be negative)</Label>
            <Input type="number" required value={adjustment.amount} onChange={e => setAdjustment({...adjustment, amount: e.target.value})} placeholder="e.g. 500 or -100" />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input required value={adjustment.reason} onChange={e => setAdjustment({...adjustment, reason: e.target.value})} />
          </div>
          <Button type="submit" disabled={adjustWallet.isPending}>Submit Adjustment</Button>
        </form>
      </div>
    </div>
  );
}
