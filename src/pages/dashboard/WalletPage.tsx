import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const WalletPage = ({ role }: { role: "coach" | "creator" }) => {
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
      <h1 className="text-2xl font-bold text-foreground mb-6">Wallet</h1>
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <p className="text-3xl font-bold text-foreground font-mono mt-1">${Number(wallet?.balance || 0).toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">{wallet?.currency || "USD"}</p>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
      {ledger.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <div className="space-y-2">
          {ledger.map(e => (
            <div key={e.id} className="bg-card border border-border rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-foreground capitalize">{e.type}</p>
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
