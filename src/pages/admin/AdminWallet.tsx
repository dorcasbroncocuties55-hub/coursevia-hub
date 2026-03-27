import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminShare, roundMoney } from "@/lib/pricingRules";

const AdminWallet = () => {
  const [totals, setTotals] = useState({ completed: 0, subscriptions: 0, commissions: 0 });
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .in("status", ["completed", "approved"] as any)
        .order("created_at", { ascending: false });

      const rows = data || [];
      const subscriptions = roundMoney(rows.filter((row) => String(row.payment_type || "").toLowerCase() === "subscription").reduce((sum, row) => sum + Number(row.amount || 0), 0));
      const commissions = roundMoney(rows.filter((row) => String(row.payment_type || "").toLowerCase() !== "subscription").reduce((sum, row) => sum + getAdminShare(Number(row.amount || 0), row.payment_type), 0));
      setTotals({ completed: roundMoney(subscriptions + commissions), subscriptions, commissions });
      setPayments(rows);
    };

    load();
  }, []);

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Wallet</h1>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Total admin revenue</p>
          <p className="text-3xl font-bold text-foreground font-mono mt-1">${totals.completed.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Subscriptions</p>
          <p className="text-3xl font-bold text-foreground font-mono mt-1">${totals.subscriptions.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">100% admin-owned</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Platform commission</p>
          <p className="text-3xl font-bold text-foreground font-mono mt-1">${totals.commissions.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">5% from paid videos, courses, and bookings</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <p className="text-sm text-muted-foreground">Rule summary</p>
        <ul className="mt-3 space-y-2 text-sm text-foreground">
          <li>• Coaches, creators, and therapists keep 95% of eligible paid sales after the 5% admin share.</li>
          <li>• Subscription payments belong 100% to admin.</li>
          <li>• Minimum paid price for provider-set videos and bookings is $6.</li>
        </ul>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Admin revenue history</h2>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No admin revenue yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Gross</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Admin Share</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
            </tr></thead>
            <tbody>{payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0">
                <td className="p-3 text-sm capitalize">{String(payment.payment_type || "payment").replaceAll("_", " ")}</td>
                <td className="p-3 text-sm font-mono">${Number(payment.amount || 0).toFixed(2)}</td>
                <td className="p-3 text-sm font-mono">${getAdminShare(Number(payment.amount || 0), payment.payment_type).toFixed(2)}</td>
                <td className="p-3 text-sm capitalize">{payment.status}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminWallet;
