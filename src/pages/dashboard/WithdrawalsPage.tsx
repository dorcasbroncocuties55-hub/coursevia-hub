import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type BankAccount = {
  id: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  country: string | null;
  is_default: boolean | null;
};

type WithdrawalRow = {
  id: string;
  amount: number;
  status: string | null;
  created_at: string;
  bank_name: string | null;
  account_number: string | null;
};

const WithdrawalsPage = ({ role }: { role: "coach" | "creator" | "therapist" }) => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [walletResult, withdrawalsResult, accountsResult] = await Promise.all([
        supabase.from("wallets").select("*").eq("user_id", user.id).single(),
        supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("bank_accounts").select("*").eq("user_id", user.id),
      ]);

      setWallet(walletResult.data);
      setWithdrawals((withdrawalsResult.data as any[]) || []);
      setAccounts((accountsResult.data as BankAccount[]) || []);
      setSelectedAccountId((current) => current || (accountsResult.data as any[])?.find((a: any) => a.is_default)?.id || (accountsResult.data as any[])?.[0]?.id || "");
    } catch (error: any) {
      toast.error("Could not load withdrawal details.");
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCashout = async () => {
    if (!user || !wallet) return;
    const amt = Number(amount);
    const available = Number(wallet?.available_balance ?? wallet?.balance ?? 0);
    const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

    if (!amt || amt <= 0 || amt > available) {
      toast.error("Enter a valid amount within your available balance.");
      return;
    }
    if (!selectedAccount) {
      toast.error("Choose a payout account first.");
      return;
    }

    try {
      setProcessing(true);

      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: user.id,
        wallet_id: wallet.id,
        amount: amt,
        bank_name: selectedAccount.bank_name,
        account_name: selectedAccount.account_name,
        account_number: selectedAccount.account_number,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Withdrawal request submitted. An admin will process it shortly.");
      setAmount("");
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || "Could not submit withdrawal request.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Withdrawals</h1>
          <p className="text-sm text-muted-foreground">
            Request withdrawals from your available balance. Pending balances stay locked until matured.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/${role}/bank-accounts`}>Manage payout accounts</Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending balance</p>
          <p className="text-2xl font-bold text-foreground font-mono">${Number(wallet?.pending_balance ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-2xl font-bold text-foreground font-mono">${Number(wallet?.available_balance ?? wallet?.balance ?? 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label>Withdrawal amount</Label>
          <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div>
          <Label>Payout account</Label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Choose payout account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} · {account.account_name || "Account holder"} · {account.account_number}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleCashout} disabled={processing || !accounts.length}>
          {processing ? "Processing..." : "Request Withdrawal"}
        </Button>

        {!accounts.length && (
          <p className="text-sm text-muted-foreground">
            Add a payout account before requesting withdrawals.{" "}
            <Link to={`/${role}/bank-accounts`} className="text-primary underline">Add one now</Link>
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Account</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">No withdrawal requests yet.</td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-sm">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-mono">${Number(w.amount).toFixed(2)}</td>
                  <td className="p-3 text-sm">{w.bank_name || "—"} · {w.account_number || "—"}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      w.status === "completed" ? "bg-green-100 text-green-700" :
                      w.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {w.status || "pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawalsPage;
export const CoachWithdrawals = () => <WithdrawalsPage role="coach" />;
export const CreatorWithdrawals = () => <WithdrawalsPage role="creator" />;
export const TherapistWithdrawals = () => <WithdrawalsPage role="therapist" />;
