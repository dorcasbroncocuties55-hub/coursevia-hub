import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const WalletPage = ({ role }: { role: "coach" | "creator" | "therapist" }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallets").select("*").eq("user_id", user.id).single().then(({ data }) => setWallet(data));
    supabase.from("wallets").select("id").eq("user_id", user.id).single().then(async ({ data }) => {
      if (data) {
        const { data: entries } = await supabase.from("wallet_ledger").select("*").eq("wallet_id", data.id).order("created_at", { ascending: false }).limit(20);
        setLedger(entries || []);
      }
    });
  }, [user]);

  return (
    <DashboardLayout role={role}>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Wallet</h1>
      <p className="mb-6 text-sm text-muted-foreground"></p>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="mt-1 text-3xl font-bold text-foreground font-mono">${Number((wallet as any)?.available_balance ?? wallet?.balance ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pending Balance</p>
          <p className="mt-1 text-3xl font-bold text-foreground font-mono">${Number((wallet as any)?.pending_balance ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Currency</p>
          <p className="mt-1 text-3xl font-bold text-foreground font-mono">{wallet?.currency || "USD"}</p>
          <p className="mt-2 text-xs text-muted-foreground">Booking earnings start their 8-day pending timer only after the learner approves the finished session.</p>
        </div>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Transactions</h2>
      {ledger.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <div className="space-y-2">
          {ledger.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div>
                <p className="text-sm font-medium capitalize text-foreground">{e.type}</p>
                <p className="text-xs text-muted-foreground">{e.description}</p>
              </div>
              <span className={`font-mono text-sm font-medium ${e.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                {e.type === "credit" ? "+" : "-"}${Math.abs(Number(e.amount)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export const CoachWallet = () => <WalletPage role="coach" />;
export const CreatorWallet = () => <WalletPage role="creator" />;


export const TherapistWallet = () => <WalletPage role="therapist" />;
