import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, X } from "lucide-react";
import { initializeCheckout, type CheckoutType } from "@/lib/paymentGateway";

interface PaymentModalProps {
  contentType: CheckoutType;
  contentId: string;
  contentTitle: string;
  amount: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const paymentCopy: Record<CheckoutType, { title: string; body: string }> = {
  booking: {
    title: "Secure booking payment",
    body: "You will complete payment through our protected checkout page. Your booking is confirmed only after Paystack verifies the transaction.",
  },
  course: {
    title: "Secure course purchase",
    body: "Complete this payment through Paystack. Access is granted automatically after verification.",
  },
  video: {
    title: "Secure video purchase",
    body: "Your payment is processed securely and video access is unlocked after confirmation.",
  },
  subscription: {
    title: "Secure subscription checkout",
    body: "Your membership is activated only after successful payment verification.",
  },
};

const PaymentModal = ({ contentType, contentId, contentTitle, amount, onClose }: PaymentModalProps) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  const startCheckout = async () => {
    if (!user?.id || !user.email) {
      toast.error("Please sign in before making a payment.");
      return;
    }

    try {
      setProcessing(true);
      const checkout = await initializeCheckout({
        email: user.email,
        user_id: user.id,
        type: contentType,
        amount,
        content_id: contentId,
        content_title: contentTitle,
      });

      window.location.href = checkout.authorization_url;
    } catch (error: any) {
      toast.error(error?.message || "Unable to start checkout.");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{paymentCopy[contentType].title}</h2>
              <p className="text-sm text-muted-foreground">Protected by Paystack checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close payment window"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order summary</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{contentTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{paymentCopy[contentType].body}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-3xl font-bold text-foreground">${Number(amount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Secure payment protection</p>
                <p className="mt-1 text-emerald-700">
                  Card details are entered only on the payment gateway. Coursevia confirms the payment after server-side verification.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
            <Button onClick={startCheckout} disabled={processing}>
              {processing ? "Redirecting..." : "Continue to secure checkout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
