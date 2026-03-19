import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const LearnerPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("payments").select("*").eq("payer_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setPayments(data || []));
  }, [user]);

  return (
    <DashboardLayout role="learner">
      <h1 className="text-2xl font-bold text-foreground mb-6">Payment History</h1>
      {payments.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No payment history yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-sm text-foreground">{format(new Date(p.created_at), "PP")}</td>
                  <td className="p-3 text-sm text-foreground capitalize">{p.payment_type}</td>
                  <td className="p-3 text-sm text-foreground font-mono">${Number(p.amount).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === "completed" ? "bg-green-100 text-green-700" :
                      p.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
export default LearnerPayments;
