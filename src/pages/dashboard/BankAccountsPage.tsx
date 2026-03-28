import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { WORLD_COUNTRIES } from "@/lib/worldCountries";
import { Trash2, Plus } from "lucide-react";

type BankAccount = {
  id: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  country: string | null;
  currency: string | null;
  swift_code: string | null;
  is_default: boolean | null;
};

const BankAccountsPage = ({ role }: { role: "coach" | "creator" | "therapist" }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [swiftCode, setSwiftCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setCountry("");
    setCurrency("USD");
    setSwiftCode("");
    setIsDefault(false);
    setShowForm(false);
  };

  const loadAccounts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load payout accounts.");
    setAccounts((data as BankAccount[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!bankName.trim() || !accountNumber.trim()) {
      toast.error("Bank name and account number are required.");
      return;
    }
    setSaving(true);
    try {
      // If setting as default, unset existing defaults first
      if (isDefault) {
        await supabase
          .from("bank_accounts")
          .update({ is_default: false } as any)
          .eq("user_id", user.id);
      }

      const { error } = await supabase.from("bank_accounts").insert({
        user_id: user.id,
        bank_name: bankName.trim(),
        account_name: accountName.trim() || null,
        account_number: accountNumber.trim(),
        country: country || null,
        currency: currency || "USD",
        swift_code: swiftCode.trim() || null,
        is_default: isDefault,
      });

      if (error) throw error;
      toast.success("Payout account added successfully.");
      resetForm();
      await loadAccounts();
    } catch (error: any) {
      toast.error(error.message || "Could not save payout account.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    const { error } = await supabase.from("bank_accounts").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast.error("Could not remove payout account.");
    } else {
      toast.success("Payout account removed.");
      await loadAccounts();
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("bank_accounts").update({ is_default: false } as any).eq("user_id", user.id);
    await supabase.from("bank_accounts").update({ is_default: true } as any).eq("id", id).eq("user_id", user.id);
    toast.success("Default payout account updated.");
    await loadAccounts();
  };

  return (
    <DashboardLayout role={role}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payout Accounts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your bank accounts for receiving withdrawals.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus size={16} className="mr-1" />
            Add account
          </Button>
        </div>

        {showForm && (
          <div className="grid gap-4 rounded-lg border border-border bg-card p-6 md:grid-cols-2">
            <div>
              <Label>Country</Label>
              <Select value={country} onValueChange={(v) => {
                setCountry(v);
                const c = WORLD_COUNTRIES.find(w => w.code === v);
                if (c?.currency) setCurrency(c.currency);
              }}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {WORLD_COUNTRIES.map((item) => (
                    <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
            </div>

            <div>
              <Label>Bank name *</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. First Bank, Chase" />
            </div>

            <div>
              <Label>Account holder name</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Full name on the account" />
            </div>

            <div>
              <Label>Account number / IBAN *</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number or IBAN" />
            </div>

            <div>
              <Label>SWIFT / BIC code</Label>
              <Input value={swiftCode} onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} placeholder="For international transfers" />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="is-default" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
              <Label htmlFor="is-default" className="cursor-pointer">Set as default payout account</Label>
            </div>

            <div className="md:col-span-2 flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save account"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No payout accounts added yet. Add one to start receiving withdrawals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="font-semibold text-foreground">{acc.bank_name || "Unknown Bank"}</p>
                  <p className="text-sm text-muted-foreground">{acc.account_name || "No holder name"}</p>
                  <p className="text-sm text-muted-foreground font-mono">{acc.account_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {acc.country || "—"} · {acc.currency || "USD"}
                    {acc.is_default && <span className="ml-2 text-primary font-medium">● Default</span>}
                  </p>
                  {acc.swift_code && <p className="text-xs text-muted-foreground">SWIFT: {acc.swift_code}</p>}
                </div>
                <div className="flex gap-2">
                  {!acc.is_default && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(acc.id)}>
                      Set default
                    </Button>
                  )}
                  <Button variant="outline" size="sm" disabled={deletingId === acc.id} onClick={() => handleDelete(acc.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BankAccountsPage;
