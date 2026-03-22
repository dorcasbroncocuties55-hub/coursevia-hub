import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Upload, Camera, Phone, Globe, X, CheckCircle, Clock, AlertTriangle } from "lucide-react";

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
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

    supabase.from("verification_requests").select("status")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setVerificationStatus(data[0].status);
      });
  }, [user]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // Need to wait for videoRef to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error("Camera access denied. Please enable camera permissions.");
    }
  }, []);

  const captureSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setSelfieDataUrl(dataUrl);
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

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

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(",");
    const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(parts[1]);
    const arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) arr[i] = bstr.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const handleVerification = async () => {
    if (!user || !idFile || !selfieDataUrl || !phone || !country) {
      toast.error("Please fill all verification fields including selfie capture");
      return;
    }
    setVerifying(true);
    try {
      // Upload ID document
      const idPath = `${user.id}/id-${Date.now()}-${idFile.name}`;
      const { error: idErr } = await supabase.storage.from("verification-docs").upload(idPath, idFile);
      if (idErr) throw idErr;
      const { data: idUrl } = supabase.storage.from("verification-docs").getPublicUrl(idPath);

      // Upload selfie from camera capture
      const selfieBlob = dataUrlToBlob(selfieDataUrl);
      const selfiePath = `${user.id}/selfie-${Date.now()}.jpg`;
      const { error: selfieErr } = await supabase.storage.from("verification-docs").upload(selfiePath, selfieBlob);
      if (selfieErr) throw selfieErr;
      const { data: selfieUrl } = supabase.storage.from("verification-docs").getPublicUrl(selfiePath);

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
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Identity Verification (KYC)</h2>
        </div>

        {coachProfile?.is_verified ? (
          <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-lg p-4 text-sm font-medium">
            <CheckCircle size={18} />
            Your identity is verified — you can now offer services and accept bookings.
          </div>
        ) : verificationStatus === "pending" ? (
          <div className="flex items-center gap-2 bg-accent/10 text-accent-foreground border border-accent/20 rounded-lg p-4 text-sm font-medium">
            <Clock size={18} />
            Verification is pending admin review. We'll notify you once it's processed.
          </div>
        ) : verificationStatus === "rejected" ? (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 text-sm font-medium mb-4">
            <AlertTriangle size={18} />
            Verification was rejected. Please resubmit with valid documents.
          </div>
        ) : null}

        {(!verificationStatus || verificationStatus === "rejected") && !coachProfile?.is_verified && (
          <div className="space-y-5 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><Phone size={14} /> Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><Globe size={14} /> Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" />
              </div>
            </div>

            {/* National ID Upload */}
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Upload size={14} /> Government-Issued ID</Label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload size={24} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center">
                  {idFile ? idFile.name : "Upload National ID, Passport, or Driver's License (JPG, PNG, PDF)"}
                </span>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
              </label>
              {idFile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                  <CheckCircle size={14} /> {idFile.name} selected
                </div>
              )}
            </div>

            {/* Live Selfie Capture */}
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Camera size={14} /> Live Selfie Capture</Label>

              {!selfieDataUrl && !cameraOpen && (
                <button
                  type="button"
                  onClick={openCamera}
                  className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Camera size={24} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to open camera and take a selfie</span>
                </button>
              )}

              {cameraOpen && (
                <div className="relative border border-border rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-80 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <Button type="button" size="sm" onClick={captureSelfie} className="gap-1.5">
                      <Camera size={16} /> Capture
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={closeCamera} className="gap-1.5 text-white border-white/30 hover:bg-white/10">
                      <X size={16} /> Cancel
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {selfieDataUrl && (
                <div className="relative border border-border rounded-lg overflow-hidden">
                  <img src={selfieDataUrl} alt="Captured selfie" className="w-full max-h-64 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <span className="text-xs text-white flex items-center gap-1"><CheckCircle size={14} /> Selfie captured</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setSelfieDataUrl(null); openCamera(); }} className="text-white border-white/30 hover:bg-white/10 text-xs">
                      Retake
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleVerification} disabled={verifying} className="w-full" size="lg">
              {verifying ? "Submitting verification..." : "Submit KYC Verification"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Editor */}
      <div className="bg-card border border-border rounded-xl p-6 max-w-lg space-y-4">
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
