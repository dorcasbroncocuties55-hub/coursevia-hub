import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, Upload, Camera, UserCircle2 } from "lucide-react";

type VerificationStatus = "pending" | "approved" | "rejected" | null;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const CoachProfile = () => {
  const { user, refreshAll } = useAuth();

  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bookingPrice, setBookingPrice] = useState("");
  const [profession, setProfession] = useState("");
  const [experience, setExperience] = useState("");
  const [certification, setCertification] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [bio, setBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const previewAvatar = useMemo(() => {
    if (selectedAvatar) {
      return URL.createObjectURL(selectedAvatar);
    }
    return avatarUrl || "";
  }, [selectedAvatar, avatarUrl]);

  useEffect(() => {
    return () => {
      if (selectedAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [selectedAvatar, previewAvatar]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [profileRes, coachRes, verifyRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "full_name, display_name, avatar_url, bio, phone, country, profession, experience, certification, profile_slug, booking_price"
          )
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("coach_profiles")
          .select("headline, skills, languages, hourly_rate")
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("verification_requests")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (profileRes.error) {
        toast.error(profileRes.error.message);
      }

      if (coachRes.error) {
        toast.error(coachRes.error.message);
      }

      const profile = profileRes.data as any;
      const coachProfile = coachRes.data as any;

      if (profile) {
        setFullName(profile.full_name || "");
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url || "");
        setBio(profile.bio || "");
        setPhone(profile.phone || "");
        setCountry(profile.country || "");
        setProfession(profile.profession || "");
        setExperience(profile.experience || "");
        setCertification(profile.certification || "");
        setProfileSlug(profile.profile_slug || "");
        setBookingPrice(String(profile.booking_price ?? ""));
      }

      if (coachProfile) {
        setHeadline(coachProfile.headline || "");
        setSkills(Array.isArray(coachProfile.skills) ? coachProfile.skills.join(", ") : "");
        setLanguages(Array.isArray(coachProfile.languages) ? coachProfile.languages.join(", ") : "");
        setHourlyRate(String(coachProfile.hourly_rate ?? ""));
      }

      if (verifyRes.data && verifyRes.data.length > 0) {
        setVerificationStatus((verifyRes.data[0] as any).status || null);
      }
    };

    load();
  }, [user]);

  const uploadAvatar = async () => {
    if (!user || !selectedAvatar) return avatarUrl;

    setUploadingAvatar(true);
    try {
      const fileExt = selectedAvatar.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, selectedAvatar, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const safeSlug =
        slugify(profileSlug || displayName || fullName || `coach-${user.id.slice(0, 8)}`) ||
        `coach-${user.id.slice(0, 8)}`;

      const nextAvatarUrl = selectedAvatar ? await uploadAvatar() : avatarUrl;

      const parsedHourlyRate = Math.max(0, Number(hourlyRate) || 0);
      const parsedBookingPrice = Math.max(6, Number(bookingPrice) || 0);

      const skillArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const languageArray = languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          role: "coach",
          account_type: "coach",
          provider_type: "coach",
          full_name: fullName || null,
          display_name: displayName || null,
          avatar_url: nextAvatarUrl || null,
          bio: bio || null,
          phone: phone || null,
          country: country || null,
          profession: profession || null,
          experience: experience || null,
          certification: certification || null,
          profile_slug: safeSlug,
          booking_price: parsedBookingPrice,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id" }
      );

      if (profileError) throw profileError;

      const { error: coachError } = await supabase.from("coach_profiles").upsert(
        {
          user_id: user.id,
          headline: headline || null,
          skills: skillArray,
          languages: languageArray,
          hourly_rate: parsedHourlyRate,
          updated_at: new Date().toISOString(),
          is_active: true,
        } as any,
        { onConflict: "user_id" }
      );

      if (coachError) throw coachError;

      setAvatarUrl(nextAvatarUrl || "");
      setSelectedAvatar(null);
      await refreshAll?.();
      toast.success("Coach profile updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update coach profile");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!user) return;

    if (!idFile || !selfieFile) {
      toast.error("Upload both an ID document and a selfie");
      return;
    }

    try {
      setVerifying(true);

      const uploadToBucket = async (file: File, folder: string) => {
        const path = `${user.id}/${folder}-${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
          .from("verification-docs")
          .upload(path, file, {
            upsert: true,
            cacheControl: "3600",
          });

        if (error) throw error;
        return data.path;
      };

      const idPath = await uploadToBucket(idFile, "id");
      const selfiePath = await uploadToBucket(selfieFile, "selfie");

      const { error } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        verification_type: "coach",
        phone: phone || null,
        country: country || null,
        id_document_url: idPath,
        selfie_url: selfiePath,
        status: "pending",
      } as any);

      if (error) throw error;

      setVerificationStatus("pending");
      toast.success("Verification submitted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Coach Profile</h1>
          <p className="text-sm text-muted-foreground">
            Build your public profile, upload your avatar, set your pricing, and submit verification.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-60 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                {previewAvatar ? (
                  <img
                    src={previewAvatar}
                    alt="Coach avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="w-20 h-20 text-muted-foreground" />
                )}
              </div>

              <div className="w-full">
                <Label htmlFor="avatar">Profile picture / avatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedAvatar(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="flex-1 grid md:grid-cols-2 gap-4 w-full">
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div>
                <Label>Display Name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>

              <div>
                <Label>Headline</Label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>

              <div>
                <Label>Profession</Label>
                <Input value={profession} onChange={(e) => setProfession(e.target.value)} />
              </div>

              <div>
                <Label>Experience</Label>
                <Input value={experience} onChange={(e) => setExperience(e.target.value)} />
              </div>

              <div>
                <Label>Certification</Label>
                <Input value={certification} onChange={(e) => setCertification(e.target.value)} />
              </div>

              <div>
                <Label>Hourly Rate (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>

              <div>
                <Label>Booking Price (USD)</Label>
                <Input
                  type="number"
                  min="6"
                  step="0.01"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                />
              </div>

              <div>
                <Label>Skills</Label>
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Leadership, Mindset, Productivity"
                />
              </div>

              <div>
                <Label>Languages</Label>
                <Input
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, French"
                />
              </div>

              <div>
                <Label>Profile Slug</Label>
                <Input
                  value={profileSlug}
                  onChange={(e) => setProfileSlug(e.target.value)}
                  placeholder="john-doe-coach"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Label>Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Button onClick={handleSave} disabled={loading || uploadingAvatar}>
                  {loading || uploadingAvatar ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Shield size={18} className="text-primary mt-1" />
            <div>
              <h2 className="font-semibold text-foreground">KYC Verification</h2>
              <p className="text-sm text-muted-foreground">
                Upload your ID and a selfie to submit verification.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>ID document</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label>Selfie capture / upload</Label>
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Camera size={14} />
                Use camera or upload a clear recent selfie
              </div>
              <Input
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground capitalize">
              Status: {verificationStatus || "not submitted"}
            </p>

            <Button onClick={handleVerificationSubmit} disabled={verifying}>
              <Upload size={16} className="mr-2" />
              {verifying ? "Submitting..." : "Submit Verification"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachProfile;