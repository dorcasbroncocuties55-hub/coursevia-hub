import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, Upload, Camera, Phone, Globe } from "lucide-react";

const CoachProfile = () => {
  const { user } = useAuth();
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Verification state
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("coach_profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setCoachProfile(data);
        setHeadline(data.headline || "");
        setSkills(data.skills?.join(", ") || "");
        setLanguages(data.languages?.join(", ") || "");
        setHourlyRate(data.hourly_rate?.toString() || "");
      }
    });

    // Check verification status
    supabase.from("verification_requests").select("status")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setVerificationStatus(data[0].status);
      });
  }, [user]);

  const handleSave = async () => {
    if (!coachProfile) return;
    setLoading(true);
    const { error } = await supabase.from("coach_profiles").update({
      headline,
      skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      languages: languages.split(",").map(s => s.trim()).filter(Boolean),
      hourly_rate: parseFloat(hourlyRate) || 0,
    }).eq("id", coachProfile.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Coach profile updated");
  };

  const handleVerification = async () => {
    if (!user || !idFile || !selfieFile || !phone || !country) {
      toast.error("Please fill all verification fields");
      return;
    }
    setVerifying(true);
    try {
      // Upload ID document
      const idPath = `${user.id}/id-${Date.now()}-${idFile.name}`;
      const { error: idErr } = await supabase.storage.from("verification-docs").upload(idPath, idFile);
      if (idErr) throw idErr;
      const { data: idUrl } = supabase.storage.from("verification-docs").getPublicUrl(idPath);

      // Upload selfie
      const selfiePath = `${user.id}/selfie-${Date.now()}-${selfieFile.name}`;
      const { error: selfieErr } = await supabase.storage.from("verification-docs").upload(selfiePath, selfieFile);
      if (selfieErr) throw selfieErr;
      const { data: selfieUrl } = supabase.storage.from("verification-docs").getPublicUrl(selfiePath);

      // Create verification request
      const { error: verErr } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        phone,
        country,
        id_document_url: idUrl.publicUrl,
        selfie_url: selfieUrl.publicUrl,
        status: "pending",
      });
      if (verErr) throw verErr;

      setVerificationStatus("pending");
      toast.success("Verification submitted! Admin will review your documents.");
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout role="coach">
      <h1 className="text-2xl font-bold text-foreground mb-6">Coach Profile</h1>
      
      {/* Verification Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Identity Verification</h2>
        </div>

        {coachProfile?.is_verified ? (
          <div className="bg-primary/5 text-primary border border-primary/20 rounded-lg p-3 text-sm font-medium">
            ✓ Your identity is verified
          </div>
        ) : verificationStatus === "pending" ? (
          <div className="bg-accent/5 text-accent border border-accent/20 rounded-lg p-3 text-sm font-medium">
            ⏳ Verification is pending review
          </div>
        ) : verificationStatus === "rejected" ? (
          <div className="bg-destructive/5 text-destructive border border-destructive/20 rounded-lg p-3 text-sm font-medium mb-4">
            ✗ Verification was rejected. Please resubmit.
          </div>
        ) : null}

        {(!verificationStatus || verificationStatus === "rejected") && !coachProfile?.is_verified && (
          <div className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1"><Phone size={14} /> Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Globe size={14} /> Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1"><Upload size={14} /> Government-issued ID</Label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors mt-1">
                <Upload size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{idFile ? idFile.name : "Upload ID (JPG, PNG, PDF)"}</span>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div>
              <Label className="flex items-center gap-1"><Camera size={14} /> Selfie Photo</Label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors mt-1">
                <Camera size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selfieFile ? selfieFile.name : "Upload selfie (JPG, PNG)"}</span>
                <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <Button onClick={handleVerification} disabled={verifying}>
              {verifying ? "Submitting..." : "Submit Verification"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Editor */}
      <div className="bg-card border border-border rounded-lg p-6 max-w-lg space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">Profile Information</h2>
        <div>
          <Label>Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Business Strategy Coach" />
        </div>
        <div>
          <Label>Skills (comma separated)</Label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Marketing, Sales, Leadership" />
        </div>
        <div>
          <Label>Languages (comma separated)</Label>
          <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English, French" />
        </div>
        <div>
          <Label>Hourly Rate ($)</Label>
          <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="50.00" />
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default CoachProfile;
