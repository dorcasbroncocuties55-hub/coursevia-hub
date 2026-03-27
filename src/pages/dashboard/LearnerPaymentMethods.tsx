import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const detectBrand = (cardNumber: string) => {
  const value = cardNumber.replace(/\s+/g, "");
  if (/^4/.test(value)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(value)) return "Mastercard";
  if (/^3[47]/.test(value)) return "American Express";
  return "Card";
};

const LearnerPaymentMethods = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<any[]>([]);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const cardBrand = useMemo(() => detectBrand(cardNumber), [cardNumber]);

  const loadMethods = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("payment_methods" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }
    setMethods(data || []);
  };

  useEffect(() => {
    loadMethods();
  }, [user]);

  const saveMethod = async () => {
    if (!user) return;
    const digits = cardNumber.replace(/\D/g, "");
    const month = Number(expiryMonth);
    const year = Number(expiryYear);

    if (!cardholderName.trim() || digits.length < 12 || !month || !year) {
      toast.error("Enter a valid cardholder name, card number, and expiry.");
      return;
    }

    if (month < 1 || month > 12) {
      toast.error("Expiry month must be between 1 and 12.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("payment_methods" as any).insert({
        user_id: user.id,
        provider: "paystack",
        method_type: "card",
        brand: cardBrand,
        last4: digits.slice(-4),
        exp_month: month,
        exp_year: year,
        cardholder_name: cardholderName.trim(),
        is_default: methods.length === 0,
      });

      if (error) throw error;
      toast.success("Payment method saved.");
      setCardholderName("");
      setCardNumber("");
      setExpiryMonth("");
      setExpiryYear("");
      loadMethods();
    } catch (error: any) {
      toast.error(error.message || "Could not save payment method.");
    } finally {
      setLoading(false);
    }
  };

  const setDefaultMethod = async (id: string) => {
    if (!user) return;

    try {
      setSettingDefaultId(id);
      const { error: clearError } = await supabase
        .from("payment_methods" as any)
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (clearError) throw clearError;

      const { error } = await supabase
        .from("payment_methods" as any)
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Default payment method updated.");
      loadMethods();
    } catch (error: any) {
      toast.error(error.message || "Could not update the default payment method.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const removeMethod = async (id: string) => {
    if (!user) return;

    try {
      setDeletingId(id);
      const current = methods.find((method) => method.id === id);
      const { error } = await supabase
        .from("payment_methods" as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      const remaining = methods.filter((method) => method.id !== id);
      if (current?.is_default && remaining.length > 0) {
        await supabase
          .from("payment_methods" as any)
          .update({ is_default: true })
          .eq("id", remaining[0].id)
          .eq("user_id", user.id);
      }

      toast.success("Payment method removed.");
      loadMethods();
    } catch (error: any) {
      toast.error(error.message || "Could not remove this payment method.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout role="learner">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save card details for faster learner checkout. Only safe card metadata is stored here, not full card details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Add card</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Cardholder name</Label>
                <Input value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <Label>Card number</Label>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
              </div>
              <div>
                <Label>Expiry month</Label>
                <Input value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} placeholder="12" />
              </div>
              <div>
                <Label>Expiry year</Label>
                <Input value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} placeholder="2029" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Detected brand</span>
              <span className="font-medium text-foreground">{cardBrand}</span>
            </div>
            <Button className="mt-5" onClick={saveMethod} disabled={loading}>
              {loading ? "Saving..." : "Save payment method"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Saved cards</h2>
            <div className="mt-4 space-y-3">
              {methods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved cards yet.</p>
              ) : methods.map((method) => (
                <div key={method.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{method.brand || "Card"} •••• {method.last4}</p>
                      <p className="text-sm text-muted-foreground">{method.cardholder_name || "Saved card"}</p>
                      <p className="text-xs text-muted-foreground">Expires {String(method.exp_month || "").padStart(2, "0")}/{method.exp_year || ""}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {method.is_default ? (
                        <span className="rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">Default</span>
                      ) : (
                        <Button variant="outline" size="sm" disabled={settingDefaultId === method.id} onClick={() => setDefaultMethod(method.id)}>
                          {settingDefaultId === method.id ? "Updating..." : "Make default"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" disabled={deletingId === method.id} onClick={() => removeMethod(method.id)}>
                        {deletingId === method.id ? "Removing..." : "Remove card"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LearnerPaymentMethods;
