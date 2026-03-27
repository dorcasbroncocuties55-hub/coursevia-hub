import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { WORLD_COUNTRIES, getCountryByCode } from "@/lib/worldCountries";
import { backendRequest, getBackendBaseUrl } from "@/lib/backendApi";

type PayoutCapability = {
  country_code: string;
  currency: string | null;
  provider: string;
  rails: string[];
  supports_account_resolve: boolean;
  verification_mode: string;
  supported: boolean;
  note: string;
};

type BankRow = {
  id: string;
  bank_name: string;
  bank_code?: string | null;
  country_code?: string | null;
  provider?: string | null;
};

type PayoutAccount = {
  id: string;
  bank_name: string;
  bank_code?: string | null;
  account_name: string | null;
  account_number: string;
  country_code: string;
  provider: string;
  verification_status: string;
  verification_method?: string | null;
  is_default?: boolean;
  metadata?: {
    swift_code?: string | null;
    iban?: string | null;
    payout_method_type?: string | null;
  } | null;
};

const BankAccountsPage = ({ role }: { role: "coach" | "creator" | "therapist" }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [capability, setCapability] = useState<PayoutCapability | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [bankDirectory, setBankDirectory] = useState<BankRow[]>([]);
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [payoutMethodType, setPayoutMethodType] = useState("swift");
  const [verificationAccountId, setVerificationAccountId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedCountry = useMemo(() => getCountryByCode(countryCode), [countryCode]);
  const accountNumberLabel = payoutMethodType === "iban" ? "IBAN" : "Account number";

  const resetForm = () => {
    setBankName("");
    setBankCode("");
    setAccountNumber("");
    setAccountName("");
    setSwiftCode("");
    setIban("");
    setVerificationCode("");
    setVerificationAccountId(null);
    setDevCode(null);
    setBankSearch("");
  };

  const loadAccounts = async () => {
    if (!user) return;
    try {
      const result = await backendRequest<{ accounts: PayoutAccount[] }>(`/api/payouts/accounts?user_id=${encodeURIComponent(user.id)}`);
      setAccounts(result.accounts || []);
    } catch (error: any) {
      toast.error(error.message || "Could not load payout accounts.");
    }
  };

  const loadCapability = async (nextCountryCode: string, nextCurrency?: string) => {
    if (!nextCountryCode) {
      setCapability(null);
      setBankDirectory([]);
      return;
    }
    try {
      const result = await backendRequest<{ capability: PayoutCapability }>(
        `/api/payouts/capabilities?country=${encodeURIComponent(nextCountryCode)}&currency=${encodeURIComponent(nextCurrency || currency)}`,
      );
      setCapability(result.capability);
      setPayoutMethodType(result.capability.rails[0] || "swift");
    } catch (error: any) {
      toast.error(error.message || "Could not load payout rules for this country.");
    }
  };

  const loadBanks = async (nextCountryCode: string, query: string) => {
    if (!nextCountryCode) return;
    try {
      const result = await backendRequest<{ banks: BankRow[] }>(
        `/api/payouts/banks?country=${encodeURIComponent(nextCountryCode)}&query=${encodeURIComponent(query)}`,
      );
      setBankDirectory(result.banks || []);
    } catch {
      setBankDirectory([]);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user]);

  useEffect(() => {
    if (selectedCountry?.currency) {
      setCurrency(selectedCountry.currency);
    }
  }, [selectedCountry?.currency]);

  useEffect(() => {
    if (!countryCode) return;
    loadCapability(countryCode, selectedCountry?.currency || currency);
    loadBanks(countryCode, bankSearch);
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode) return;
    const timer = window.setTimeout(() => {
      loadBanks(countryCode, bankSearch);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [bankSearch, countryCode]);

  const handleSelectBank = (bank: BankRow) => {
    setBankName(bank.bank_name || "");
    setBankCode(bank.bank_code || "");
  };

  const resolveAccountName = async () => {
    if (!countryCode || !accountNumber.trim()) return;
    try {
      setResolving(true);
      const result = await backendRequest<{ account_name?: string; note?: string }>("/api/payouts/resolve-beneficiary", {
        method: "POST",
        body: JSON.stringify({
          country_code: countryCode,
          bank_code: bankCode || null,
          account_number: accountNumber.trim(),
          account_name: accountName.trim() || null,
        }),
      });
      if (result.account_name) {
        setAccountName(result.account_name);
        toast.success("Account holder name confirmed.");
      } else if (result.note) {
        toast.success(result.note);
      }
    } catch (error: any) {
      toast.error(error.message || "Could not confirm account holder details.");
    } finally {
      setResolving(false);
    }
  };

  const handleSendCode = async () => {
    if (!user) return;
    if (!countryCode || !bankName.trim() || !accountNumber.trim()) {
      toast.error("Country, bank, and account number are required.");
      return;
    }
    if ((capability?.supports_account_resolve || payoutMethodType !== "swift") && !accountName.trim()) {
      toast.error("Please confirm the account holder name before continuing.");
      return;
    }

    try {
      setSendingCode(true);
      const result = await backendRequest<{
        account: PayoutAccount;
        verification_required: boolean;
        message: string;
        dev_code?: string;
      }>("/api/payouts/send-verification", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          country_code: countryCode,
          currency,
          bank_code: bankCode || null,
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_name: accountName.trim() || null,
          swift_code: swiftCode.trim() || null,
          iban: iban.trim() || null,
          payout_method_type: payoutMethodType,
        }),
      });
      setVerificationAccountId(result.account.id);
      setDevCode(result.dev_code || null);
      toast.success(result.message);
      if (!result.verification_required) {
        await loadAccounts();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.message || "Could not start payout verification.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !verificationAccountId) return;
    try {
      setVerifying(true);
      await backendRequest("/api/payouts/verify-beneficiary", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          bank_account_id: verificationAccountId,
          code: verificationCode.trim(),
        }),
      });
      toast.success("Payout account verified and ready for withdrawals.");
      await loadAccounts();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Could not verify payout account.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      setDeletingId(id);
      const response = await fetch(`${getBackendBaseUrl()}/api/payouts/accounts/${id}?user_id=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not remove payout account.");
      toast.success("Payout account removed.");
      await loadAccounts();
    } catch (error: any) {
      toast.error(error.message || "Could not remove payout account.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global payout accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save only real payout methods. This screen checks country support first, verifies beneficiary details, and blocks withdrawals from unverified accounts.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border border-border bg-card p-6 md:grid-cols-2">
          <div>
            <Label>Country</Label>
            <Select value={countryCode} onValueChange={(value) => {
              setCountryCode(value);
              resetForm();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
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

          <div className="md:col-span-2 rounded-md border border-dashed border-border bg-background/60 p-4 text-sm">
            <p className="font-medium text-foreground">Payout support</p>
            <p className="mt-1 text-muted-foreground">
              {capability ? `${capability.provider} · ${capability.rails.join(", ")} · ${capability.note}` : "Choose a country to see supported payout rails and verification rules."}
            </p>
          </div>

          <div>
            <Label>Payout method</Label>
            <Select value={payoutMethodType} onValueChange={setPayoutMethodType} disabled={!capability}>
              <SelectTrigger>
                <SelectValue placeholder="Choose method" />
              </SelectTrigger>
              <SelectContent>
                {(capability?.rails || ["swift"]).map((rail) => (
                  <SelectItem key={rail} value={rail}>{rail.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Search bank</Label>
            <Input
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder={countryCode ? "Search local bank list" : "Choose country first"}
              disabled={!countryCode}
            />
            {bankDirectory.length > 0 ? (
              <div className="mt-2 max-h-48 overflow-auto rounded-md border bg-background">
                {bankDirectory.map((bank) => (
                  <button
                    type="button"
                    key={bank.id}
                    onClick={() => handleSelectBank(bank)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{bank.bank_name}</span>
                    <span className="text-xs text-muted-foreground">{bank.bank_code || bank.provider || "Select"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <Label>Bank name</Label>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank or beneficiary institution" />
          </div>

          <div>
            <Label>Bank code</Label>
            <Input value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="Optional where not provided" />
          </div>

          <div>
            <Label>{accountNumberLabel}</Label>
            <div className="flex gap-2">
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder={accountNumberLabel} />
              <Button type="button" variant="outline" onClick={resolveAccountName} disabled={resolving || !accountNumber.trim()}>
                {resolving ? "Checking..." : "Check name"}
              </Button>
            </div>
          </div>

          <div>
            <Label>Account name</Label>
            <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Auto-filled when supported" />
          </div>

          <div>
            <Label>SWIFT code</Label>
            <Input value={swiftCode} onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} placeholder="Needed for SWIFT rails" />
          </div>

          <div>
            <Label>IBAN</Label>
            <Input value={iban} onChange={(e) => setIban(e.target.value.toUpperCase())} placeholder="Needed for IBAN rails" />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button onClick={handleSendCode} disabled={sendingCode || !countryCode}>
              {sendingCode ? "Saving..." : capability?.verification_mode === "manual" ? "Save verified payout method" : "Send verification code"}
            </Button>
            {verificationAccountId ? <span className="self-center text-sm text-muted-foreground">Verification started for this payout method.</span> : null}
          </div>

          {verificationAccountId ? (
            <div className="md:col-span-2 grid gap-3 rounded-md border border-border bg-background/70 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <Label>Verification code</Label>
                <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Enter the code sent to the user" />
                {devCode ? <p className="mt-2 text-xs text-muted-foreground">Dev code: {devCode}</p> : null}
              </div>
              <div className="self-end">
                <Button onClick={handleVerifyCode} disabled={verifying || !verificationCode.trim()}>
                  {verifying ? "Verifying..." : "Verify code"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <div>
                <p className="font-semibold text-foreground">{acc.bank_name}</p>
                <p className="text-sm text-muted-foreground">{acc.account_name || "Name pending verification"}</p>
                <p className="text-sm text-muted-foreground">{acc.account_number}</p>
                <p className="text-sm text-muted-foreground">{acc.country_code} · {acc.provider}</p>
                <p className="text-xs text-muted-foreground">Status: {acc.verification_status}{acc.is_default ? " · default" : ""}</p>
                {acc.metadata?.swift_code ? <p className="text-xs text-muted-foreground">SWIFT: {acc.metadata.swift_code}</p> : null}
                {acc.metadata?.iban ? <p className="text-xs text-muted-foreground">IBAN: {acc.metadata.iban}</p> : null}
              </div>
              <Button variant="outline" size="sm" disabled={deletingId === acc.id} onClick={() => handleDelete(acc.id)}>
                {deletingId === acc.id ? "Removing..." : "Remove"}
              </Button>
            </div>
          ))}
          {accounts.length === 0 ? <p className="text-sm text-muted-foreground">No payout methods added yet.</p> : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BankAccountsPage;
