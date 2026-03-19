import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminWallet = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Admin wallet = sum of commission transactions
    supabase.from("transactions").select("*").eq("type", "commission").then(({ data }) => {
      const total = data?.reduce((sum, t) => sum + Number(t.commission_amount), 0) || 0;
      setTotalBalance(total);
      setTransactions(data || []);
    });
  }, []);

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Wallet</h1>
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <p className="text-sm text-muted-foreground">Total Commissions Earned</p>
        <p className="text-3xl font-bold text-foreground font-mono mt-1">${totalBalance.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">USD</p>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Commission History</h2>
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No commission transactions yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Amount</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Rate</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
            </tr></thead>
            <tbody>{transactions.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="p-3 text-sm font-mono">${Number(t.commission_amount).toFixed(2)}</td>
                <td className="p-3 text-sm">{(Number(t.commission_rate) * 100).toFixed(0)}%</td>
                <td className="p-3 text-sm">{t.status}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
export default AdminWallet;
