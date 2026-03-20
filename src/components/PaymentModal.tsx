import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Upload, CreditCard, Building2 } from "lucide-react";

interface PaymentModalProps {
  contentType: "course" | "video" | "subscription" | "booking";
  contentId: string;
  contentTitle: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal = ({ contentType, contentId, contentTitle, amount, onClose, onSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const [method, setMethod] = useState<"bank" | "card">("bank");
  const [uploading, setUploading] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const bankDetails = {
    bankName: "Coursevia Global Bank",
    accountName: "Coursevia Technologies Ltd",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swiftCode: "CVIAGLXX",
  };

  const handleBankPayment = async () => {
    if (!user || !invoiceFile) {
      toast.error("Please upload your bank invoice (PDF only)");
      return;
    }

    setProcessing(true);
    try {
      // Upload invoice
      const fileName = `${user.id}/${Date.now()}-${invoiceFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(fileName, invoiceFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(fileName);

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        payer_id: user.id,
        amount,
        payment_type: contentType,
        payment_method: "bank_transfer",
        reference_id: contentId,
        invoice_url: urlData.publicUrl,
        status: "pending",
      });
      if (paymentError) throw paymentError;

      // Create notification for admin
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Payment Submitted",
        message: `Your payment of $${amount.toFixed(2)} for ${contentTitle} is pending admin verification.`,
        type: "payment",
      });

      toast.success("Payment submitted! Awaiting admin verification.");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Complete Payment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Purchasing</p>
            <p className="font-medium text-foreground">{contentTitle}</p>
            <p className="text-2xl font-bold text-foreground font-mono mt-2">${amount.toFixed(2)}</p>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMethod("bank")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                method === "bank" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Building2 size={16} />
              Bank Transfer
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                method === "card" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <CreditCard size={16} />
              Card
            </button>
          </div>

          {method === "bank" ? (
            <div className="space-y-4">
              {/* Bank Details */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-2">Transfer to:</h3>
                {Object.entries(bankDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-foreground font-mono text-xs">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                After transferring, upload your bank invoice (PDF format) below. Admin will verify and unlock your content.
              </p>

              {/* Invoice Upload */}
              <div>
                <Label>Upload Bank Invoice (PDF)</Label>
                <div className="mt-1">
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload size={20} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {invoiceFile ? invoiceFile.name : "Click to select PDF invoice"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!invoiceFile || processing}
                onClick={handleBankPayment}
              >
                {processing ? "Submitting..." : "Submit Payment Proof"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Card payments coming soon. Please use bank transfer for now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
