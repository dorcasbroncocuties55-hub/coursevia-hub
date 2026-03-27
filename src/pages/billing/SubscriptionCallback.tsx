import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { verifyCheckout } from "@/lib/paymentGateway";
import { verifyLearnerSubscription } from "@/lib/subscriptionBilling";
import { toast } from "sonner";

const getFallbackPath = (purpose?: string) => {
  switch (purpose) {
    case "booking":
      return "/dashboard/bookings";
    case "course":
      return "/dashboard/courses";
    case "video":
      return "/dashboard/videos";
    default:
      return "/dashboard/subscription";
  }
};

const getHeading = (purpose?: string) => {
  switch (purpose) {
    case "booking":
      return "Booking payment";
    case "course":
      return "Course payment";
    case "video":
      return "Video payment";
    default:
      return "Subscription payment";
  }
};

const SubscriptionCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment securely...");
  const [purpose, setPurpose] = useState<string | undefined>(undefined);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

    if (!reference) {
      setLoading(false);
      setMessage("No payment reference was found in the callback URL.");
      return;
    }

    const verify = async () => {
      try {
        const subscriptionResult = await verifyLearnerSubscription(reference);
        const finalPurpose = subscriptionResult.purpose || "subscription";
        setPurpose(finalPurpose);
        setRedirectTo(subscriptionResult.redirectTo || getFallbackPath(finalPurpose));
        setMessage(subscriptionResult.message || "Subscription verified successfully.");
        toast.success("Subscription verified successfully.");
        return;
      } catch {
        const checkoutResult = await verifyCheckout(reference);
        setPurpose(checkoutResult.purpose);
        setRedirectTo(checkoutResult.redirectTo || getFallbackPath(checkoutResult.purpose));
        setMessage(checkoutResult.message || "Payment verified successfully.");
        toast.success("Payment verified successfully.");
      }
    };

    verify()
      .catch((error: any) => {
        setMessage(error?.message || "We could not verify this payment yet.");
        toast.error(error?.message || "Payment verification failed.");
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container max-w-2xl flex-1 px-4 py-16">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground">{getHeading(purpose)}</h1>
          <p className="text-muted-foreground">{message}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => navigate(redirectTo || getFallbackPath(purpose))}>
              Continue
            </Button>
            <Button variant="outline" onClick={() => navigate("/pricing")}>Back to pricing</Button>
          </div>
          {loading && <p className="text-sm text-muted-foreground">Please wait while our server confirms the transaction.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionCallback;
