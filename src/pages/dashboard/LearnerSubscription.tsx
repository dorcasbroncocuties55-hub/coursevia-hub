import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { initializeLearnerSubscription, cancelLearnerSubscription } from "@/lib/subscriptionBilling";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pricingPlans, MONTHLY_SUBSCRIPTION_PRICE, resolveLearnerPlan } from "@/lib/pricingRules";
import { Link, useSearchParams } from "react-router-dom";

const LearnerSubscription = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get("plan") === "yearly" ? "yearly" : "monthly";
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .maybeSingle();

    setSubscription(data || null);
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const subscribe = async () => {
    if (!user?.email) {
      toast.error("Please sign in with a valid email first.");
      return;
    }

    try {
      setLoading(true);
      const checkout = await initializeLearnerSubscription(user.email, user.id, requestedPlan);
      window.location.href = checkout.authorization_url;
    } catch (error: any) {
      toast.error(error.message || "Subscription failed");
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      setCancelling(true);
      await cancelLearnerSubscription(user.id);
      toast.success("Subscription cancellation has been scheduled.");
      await loadSubscription();
    } catch (error: any) {
      toast.error(error.message || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  const planId = resolveLearnerPlan(subscription);
  const activePlan = pricingPlans.find((plan) => plan.id === planId) || pricingPlans[0];
  const monthlyPlan = pricingPlans.find((plan) => plan.id === "monthly")!;
  const subscriptionPlan = String(subscription?.plan || requestedPlan || "monthly").toLowerCase();
  const isYearlyPlan = subscriptionPlan === "yearly";
  const currentPriceLabel = activePlan.id === "free" ? "$0" : isYearlyPlan ? "$120" : `$${MONTHLY_SUBSCRIPTION_PRICE}`;
  const isSubscriptionActive = ["active", "trialing"].includes(String(subscription?.status || "").toLowerCase());

  return (
    <DashboardLayout role="learner">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Subscription</h1>
          <p className="text-muted-foreground">
            Creator, coach, and therapist prices remain owner-controlled, with a minimum of $6 on paid videos and paid bookings. Learner subscription revenue belongs fully to admin.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Current learner plan</p>
              <p className="text-4xl font-bold text-foreground">
                {activePlan.id === "free" ? "Starter" : currentPriceLabel}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {activePlan.id === "free" ? "Free access rules apply" : isYearlyPlan ? "Billed once per year" : "Billed every month"}
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Status: <span className="font-medium text-foreground">{subscription?.status || "inactive"}</span></p>
              <p>Provider: <span className="font-medium text-foreground">{subscription?.payment_provider || "paystack"}</span></p>
              <p>Current plan: <span className="font-medium text-foreground">{subscription?.plan || activePlan.id}</span></p>
              <p>Ends: <span className="font-medium text-foreground">{subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : "—"}</span></p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-secondary/30 p-5">
              <h2 className="font-semibold text-foreground mb-3">Starter rules</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {pricingPlans[0].benefits.map((benefit) => (
                  <li key={benefit}>• {benefit}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="font-semibold text-foreground mb-3">Learner Plus benefits</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {monthlyPlan.benefits.map((benefit) => (
                  <li key={benefit}>• {benefit}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={subscribe} disabled={loading || isSubscriptionActive}>
              {loading ? "Redirecting..." : isSubscriptionActive ? "Subscription active" : requestedPlan === "yearly" ? "Start yearly billing" : "Start recurring billing"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/payment-methods">Add payment method</Link>
            </Button>
            {isSubscriptionActive && (
              <Button variant="destructive" onClick={cancelSubscription} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel auto-renew"}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">This recurring billing flow uses Paystack plans and subscription events. Your card is charged on the billing cycle after the first successful setup charge.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LearnerSubscription;
