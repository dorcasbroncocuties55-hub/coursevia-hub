import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const WithdrawalsPage = ({ role }: { role: "coach" | "creator" }) => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallets").select("*").eq("user_id", user.id).single().then(({ data }) => setWallet(data));
    supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setWithdrawals(data || []));
  }, [user]);

  const handleWithdraw = async () => {
    if (!user || !wallet) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > Number(wallet.balance)) {
      toast.error("Invalid amount");
      return;
    }
    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id, wallet_id: wallet.id, amount: amt, bank_name: bankName, account_number: accountNumber, account_name: accountName,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Withdrawal request submitted");
      setShowForm(false);
      setAmount(""); setBankName(""); setAccountNumber(""); setAccountName("");
      const { data } = await supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setWithdrawals(data || []);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Withdrawals</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>Request Withdrawal</Button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6 max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground">Balance: <span className="font-mono font-medium text-foreground">${Number(wallet?.balance || 0).toFixed(2)}</span></p>
          <div><Label>Amount ($)</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div><Label>Bank Name</Label><Input value={bankName} onChange={e => setBankName(e.target.value)} /></div>
          <div><Label>Account Number</Label><Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} /></div>
          <div><Label>Account Name</Label><Input value={accountName} onChange={e => setAccountName(e.target.value)} /></div>
          <Button onClick={handleWithdraw}>Submit Request</Button>
        </div>
      )}
      {withdrawals.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">No withdrawal requests.</p></div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map(w => (
            <div key={w.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground font-mono">${Number(w.amount).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{w.bank_name} · {w.account_name}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                w.status === "completed" ? "bg-green-100 text-green-700" :
                w.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              }`}>{w.status}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export const CoachWithdrawals = () => <WithdrawalsPage role="coach" />;
export const CreatorWithdrawals = () => <WithdrawalsPage role="creator" />;
