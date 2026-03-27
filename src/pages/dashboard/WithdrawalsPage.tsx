import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { backendRequest } from "@/lib/backendApi";

type PayoutAccount = {
  id: string;
  bank_name: string;
  account_name: string | null;
  account_number: string;
  country_code: string;
  provider: string;
  verification_status: string;
};

type WithdrawalRow = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

const WithdrawalsPage = ({ role }: { role: "coach" | "creator" | "therapist" }) => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const verifiedAccounts = useMemo(
    () => accounts.filter((account) => String(account.verification_status || "").toLowerCase() === "verified"),
    [accounts],
  );

  const loadData = async () => {
    if (!user) return;
    try {
      const [{ data: walletData }, withdrawalsResult, accountsResult] = await Promise.all([
        supabase.from("wallets").select("*").eq("user_id", user.id).single(),
        backendRequest<{ withdrawals: WithdrawalRow[] }>(`/api/payouts/withdrawals?user_id=${encodeURIComponent(user.id)}`),
        backendRequest<{ accounts: PayoutAccount[] }>(`/api/payouts/accounts?user_id=${encodeURIComponent(user.id)}`),
      ]);

      setWallet(walletData);
      setWithdrawals(withdrawalsResult.withdrawals || []);
      setAccounts(accountsResult.accounts || []);
      setSelectedAccountId((current) => current || accountsResult.accounts?.find((acc) => acc.verification_status === "verified")?.id || "");
    } catch (error: any) {
      toast.error(error.message || "Could not load payout details.");
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCashout = async () => {
    if (!user || !wallet) return;
    const amt = Number(amount);
    const available = Number((wallet as any).available_balance ?? wallet.balance ?? 0);
    const selectedAccount = verifiedAccounts.find((account) => account.id === selectedAccountId);

    if (!amt || amt <= 0 || amt > available) {
      toast.error("Enter a valid amount within your available balance.");
      return;
    }

    if (!selectedAccount) {
      toast.error("Choose a verified payout account first.");
      return;
    }

    try {
      setProcessing(true);
      await backendRequest("/api/payouts/withdraw", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          amount: amt,
          bank_account_id: selectedAccountId,
        }),
      });

      toast.success("Withdrawal created. Only verified payout methods can move available balance.");
      setAmount("");
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || "Could not complete withdrawal.");
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
            Withdraw only from verified payout methods. Pending balances stay locked until they mature.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/${role}/bank-accounts`}>Manage payout accounts</Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending balance</p>
          <p className="text-2xl font-bold text-foreground">${Number((wallet as any)?.pending_balance ?? 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-2xl font-bold text-foreground">${Number((wallet as any)?.available_balance ?? (wallet as any)?.balance ?? 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-6 max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label>Withdrawal amount</Label>
          <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div>
          <Label>Verified payout account</Label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Choose verified payout account</option>
            {verifiedAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} · {account.account_name || "Verified holder"} · {account.account_number}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleCashout} disabled={processing || !verifiedAccounts.length}>
          {processing ? "Processing..." : "Withdraw now"}
        </Button>

        {!verifiedAccounts.length ? (
          <p className="text-sm text-muted-foreground">Add and verify a payout account before withdrawing.</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-sm text-muted-foreground">No withdrawals yet.</td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-sm">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-mono">${Number(w.amount).toFixed(2)}</td>
                  <td className="p-3 text-sm capitalize">{w.status || "pending"}</td>
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
