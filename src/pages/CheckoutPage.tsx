import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { getCartItems, clearCart, type CartItem } from "@/lib/cart";
import { getDiscountedPrice, getBenefitHeadline, resolveLearnerPlan, PLATFORM_FEE_RATE } from "@/lib/pricingRules";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle();
      setSubscription(data || null);
    };

    loadSubscription();
  }, [user]);

  const planId = resolveLearnerPlan(subscription);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discountedTotal = items.reduce(
      (sum, item) => sum + getDiscountedPrice(item.price, planId).discountedPrice,
      0
    );
    const savings = subtotal - discountedTotal;

    return {
      subtotal,
      discountedTotal,
      savings,
      platformFeeInfo: discountedTotal * PLATFORM_FEE_RATE,
    };
  }, [items, planId]);

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      setProcessing(true);
      toast.success("Checkout details saved. Connect your final payment provider next.");
      clearCart();
      setItems([]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
              <p className="text-sm text-muted-foreground mt-2">
                {getBenefitHeadline(planId)}
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <p className="text-muted-foreground">There are no items to check out right now.</p>
                <Button asChild>
                  <Link to="/courses">Browse content</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const pricing = getDiscountedPrice(item.price, planId);

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="rounded-2xl border border-border bg-card p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {item.type}
                        </p>
                        <h2 className="font-semibold text-foreground">{item.title}</h2>
                      </div>
                      <div className="text-right text-sm">
                        {pricing.savings > 0 ? (
                          <>
                            <p className="line-through text-muted-foreground">${pricing.originalPrice.toFixed(2)}</p>
                            <p className="font-semibold text-foreground">${pricing.discountedPrice.toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-foreground">${pricing.originalPrice.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    {pricing.savings > 0 && (
                      <p className="text-xs text-green-600">
                        Membership benefit applied: you saved ${pricing.savings.toFixed(2)} on this item.
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6 h-fit sticky top-24 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base subtotal</span>
                <span className="text-foreground">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Membership savings</span>
                <span className="text-green-600">-${totals.savings.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground capitalize">{planId}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-border">
                <span>Total due</span>
                <span>${totals.discountedTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/40 p-4 text-xs text-muted-foreground">
              Creator, coach, and therapist prices remain owner-controlled. Your subscription only changes benefits and member pricing; it does not make paid content free.
            </div>

            <Button
              className="w-full"
              disabled={processing || items.length === 0}
              onClick={handlePlaceOrder}
            >
              {processing ? "Processing..." : "Place Order"}
            </Button>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
