import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { normalizeRole } from "@/lib/authRoles";

type RoleOption = "learner" | "coach" | "creator" | "therapist";

type SpecializationConfig = {
  label: string;
  placeholder: string;
  options: string[];
};

const roleOptions: {
  value: RoleOption;
  title: string;
  description: string;
}[] = [
  {
    value: "learner",
    title: "Learner",
    description: "Take courses, buy videos, subscribe monthly, and book sessions.",
  },
  {
    value: "coach",
    title: "Coach",
    description:
      "Sell coaching sessions, upload paid videos, and build your professional profile.",
  },
  {
    value: "creator",
    title: "Creator",
    description: "Publish premium educational videos and courses with manual pricing.",
  },
  {
    value: "therapist",
    title: "Therapist",
    description:
      "Offer wellness sessions, upload paid videos, and present verified credentials.",
  },
];

const specializationConfig: Partial<Record<RoleOption, SpecializationConfig>> = {
  coach: {
    label: "What type of coach are you?",
    placeholder: "Choose coaching type",
    options: [
      "Life Coach",
      "Business Coach",
      "Career Coach",
      "Fitness Coach",
      "Relationship Coach",
      "Mindset Coach",
      "Executive Coach",
      "Leadership Coach",
      "Other",
    ],
  },
  creator: {
    label: "What type of content do you create?",
    placeholder: "Choose creator niche",
    options: [
      "Business",
      "Education",
      "Finance",
      "Health",
      "Motivation",
      "Self Development",
      "Technology",
      "Spirituality",
      "Other",
    ],
  },
  therapist: {
    label: "What type of therapy do you offer?",
    placeholder: "Choose therapy type",
    options: [
      "Anxiety Therapy",
      "CBT",
      "Couples Therapy",
      "Depression Therapy",
      "Family Therapy",
      "Trauma Therapy",
      "Addiction Therapy",
      "Child Therapy",
      "Other",
    ],
  },
};

const learnerGoalOptions = [
  "Learn new skills",
  "Improve career",
  "Start a business",
  "Grow existing business",
  "Improve health and wellness",
  "Personal development",
  "Mental wellness support",
  "Financial knowledge",
  "Pass exams or certifications",
  "Other",
];

const COMMON_FAKE_WORDS = new Set([
  "test",
  "testing",
  "asdf",
  "qwerty",
  "zxcv",
  "abc",
  "abcd",
  "aaa",
  "bbb",
  "ccc",
  "xxx",
  "yyy",
  "hello",
  "none",
  "nil",
  "no",
  "yes",
  "sample",
  "demo",
  "random",
  "user",
  "name",
  "bio",
  "profession",
  "experience",
  "certificate",
  "certification",
  "business",
  "coach",
  "creator",
  "therapist",
]);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const formatProfessionFromSpecialization = (
  role: RoleOption,
  specialization: string,
  fallbackProfession: string,
) => {
  if (!specialization) return fallbackProfession;

  if (role === "coach" || role === "therapist") {
    return specialization;
  }

  if (role === "creator") {
    return `${specialization} Creator`;
  }

  return fallbackProfession;
};

const hasLetters = (value: string) => /[a-zA-Z]/.test(value);
const hasOnlyNumbersOrSymbols = (value: string) => !/[a-zA-Z]/.test(value);
const repeatedCharsOnly = (value: string) => /^([a-zA-Z0-9])\1+$/.test(value.trim());
const tooFewWords = (value: string, minWords = 2) =>
  value.trim().split(/\s+/).filter(Boolean).length < minWords;

const isObviouslyFakeText = (value: string) => {
  const cleaned = value.trim().toLowerCase();

  if (!cleaned) return true;
  if (COMMON_FAKE_WORDS.has(cleaned)) return true;
  if (cleaned.length < 3) return true;
  if (repeatedCharsOnly(cleaned)) return true;
  if (hasOnlyNumbersOrSymbols(cleaned)) return true;

  return false;
};

const isValidHumanName = (value: string) => {
  const cleaned = value.trim();

  if (cleaned.length < 5) return false;
  if (!hasLetters(cleaned)) return false;
  if (tooFewWords(cleaned, 2)) return false;
  if (isObviouslyFakeText(cleaned)) return false;

  return true;
};

const isValidShortText = (value: string, minLength = 4) => {
  const cleaned = value.trim();

  if (cleaned.length < minLength) return false;
  if (!hasLetters(cleaned)) return false;
  if (isObviouslyFakeText(cleaned)) return false;

  return true;
};

const isValidLongText = (value: string, minLength = 20, minWords = 4) => {
  const cleaned = value.trim();

  if (cleaned.length < minLength) return false;
  if (!hasLetters(cleaned)) return false;
  if (tooFewWords(cleaned, minWords)) return false;
  if (isObviouslyFakeText(cleaned)) return false;

  return true;
};

const isValidPhone = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.length >= 7;
};

const isValidUrlIfProvided = (value: string) => {
  const cleaned = value.trim();
  if (!cleaned) return true;

  try {
    const normalized = cleaned.startsWith("http://") || cleaned.startsWith("https://")
      ? cleaned
      : `https://${cleaned}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
};

const isValidImageFile = (file: File | null) => {
  if (!file) return false;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const maxSize = 5 * 1024 * 1024;

  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, refreshRoles, refreshAll } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RoleOption>("learner");
  const [step, setStep] = useState(1);

  const [profession, setProfession] = useState("");
  const [experience, setExperience] = useState("");
  const [certification, setCertification] = useState("");

  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [learnerInterests, setLearnerInterests] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  const [learnerGoal, setLearnerGoal] = useState("");
  const [customLearnerGoal, setCustomLearnerGoal] = useState("");
  const [learnerLookingForward, setLearnerLookingForward] = useState("");

  const [loading, setLoading] = useState(false);

  const currentSpecializationConfig = useMemo(
    () => specializationConfig[selectedRole],
    [selectedRole],
  );

  const resolvedSpecialization =
    specialization === "Other" ? customSpecialization.trim() : specialization.trim();

  const resolvedLearnerGoal =
    learnerGoal === "Other" ? customLearnerGoal.trim() : learnerGoal.trim();

  const totalSteps = selectedRole === "learner" ? 4 : 5;

  useEffect(() => {
    if (!user) return;

    const preferredRole = normalizeRole(profile?.role ?? user.user_metadata?.requested_role ?? user.user_metadata?.role);
    setSelectedRole(preferredRole as RoleOption);

    const authName = typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : "";

    if (authName && !fullName) setFullName(authName);
    if (authName && !displayName) setDisplayName(authName);
    if (profile?.country && !country) setCountry(profile.country);
    if (profile?.phone && !phone) setPhone(profile.phone);
    if (profile?.bio && !bio) setBio(profile.bio);
    if (profile?.avatar_url && !avatarPreview) setAvatarPreview(profile.avatar_url);
  }, [user, profile]);

  const applyRoleDefaults = (role: RoleOption) => {
    setSelectedRole(role);
    setStep(1);

    setProfession("");
    setExperience("");
    setCertification("");

    setSpecialization("");
    setCustomSpecialization("");

    setFullName("");
    setDisplayName("");
    setPhone("");
    setCountry("");
    setCity("");
    setBio("");
    setAvatarFile(null);
    setAvatarPreview("");
    setLearnerInterests("");

    setBusinessName("");
    setBusinessEmail("");
    setBusinessPhone("");
    setBusinessWebsite("");
    setBusinessAddress("");
    setBusinessDescription("");

    setLearnerGoal("");
    setCustomLearnerGoal("");
    setLearnerLookingForward("");
  };

  const validateAvatar = () => {
    if (!avatarFile) {
      toast.error("Please upload your profile image.");
      return false;
    }

    if (!isValidImageFile(avatarFile)) {
      toast.error("Upload a valid image file (JPG, PNG, or WEBP) not bigger than 5MB.");
      return false;
    }

    return true;
  };

  const validatePersonalInfo = () => {
    if (!isValidHumanName(fullName)) {
      toast.error("Enter your real full name. Use at least first name and last name.");
      return false;
    }

    if (displayName.trim() && !isValidShortText(displayName, 3)) {
      toast.error("Enter a valid display name.");
      return false;
    }

    if (!isValidPhone(phone)) {
      toast.error("Enter a valid phone number.");
      return false;
    }

    if (!isValidShortText(country, 3)) {
      toast.error("Enter a real country name.");
      return false;
    }

    if (city.trim() && !isValidShortText(city, 2)) {
      toast.error("Enter a valid city name.");
      return false;
    }

    if (!isValidLongText(bio, 20, 4)) {
      toast.error("Your bio must be real and descriptive, not random text.");
      return false;
    }

    if (selectedRole === "learner" && learnerInterests.trim()) {
      if (!isValidLongText(learnerInterests, 6, 1)) {
        toast.error("Enter real learner interests.");
        return false;
      }
    }

    return true;
  };

  const validateProfessionalInfo = () => {
    if (!isValidShortText(profession, 4)) {
      toast.error("Enter a real profession.");
      return false;
    }

    if (!isValidLongText(experience, 10, 2)) {
      toast.error("Enter real experience details, not random text.");
      return false;
    }

    if (!isValidShortText(certification, 4)) {
      toast.error("Enter a real certification or license.");
      return false;
    }

    return true;
  };

  const validateBusinessInfo = () => {
    if (!isValidShortText(businessName, 4)) {
      toast.error("Enter a real business or brand name.");
      return false;
    }

    if (businessEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail.trim())) {
      toast.error("Enter a valid business email.");
      return false;
    }

    if (businessPhone.trim() && !isValidPhone(businessPhone)) {
      toast.error("Enter a valid business phone number.");
      return false;
    }

    if (!isValidUrlIfProvided(businessWebsite)) {
      toast.error("Enter a valid website or portfolio link.");
      return false;
    }

    if (businessAddress.trim() && !isValidLongText(businessAddress, 6, 2)) {
      toast.error("Enter a real business address.");
      return false;
    }

    if (!isValidLongText(businessDescription, 20, 4)) {
      toast.error("Enter a real business description, not random text.");
      return false;
    }

    return true;
  };

  const validateLearnerInfo = () => {
    if (!resolvedLearnerGoal || isObviouslyFakeText(resolvedLearnerGoal)) {
      toast.error("Choose a valid learning goal.");
      return false;
    }

    if (!isValidLongText(learnerLookingForward, 20, 4)) {
      toast.error("Tell us clearly what you are looking forward to.");
      return false;
    }

    return true;
  };

  const validateSpecialization = () => {
    if (!resolvedSpecialization) {
      toast.error("Please choose your specialization.");
      return false;
    }

    if (!isValidShortText(resolvedSpecialization, 4)) {
      toast.error("Choose or enter a real specialization.");
      return false;
    }

    return true;
  };

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);

    if (!file) {
      setAvatarPreview("");
      return;
    }

    if (!isValidImageFile(file)) {
      toast.error("Upload a valid image file (JPG, PNG, or WEBP) not bigger than 5MB.");
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const uploadAvatar = async () => {
    if (!user?.id || !avatarFile) return null;

    const extension = avatarFile.name.split(".").pop() || "jpg";
    const safeExtension = extension.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage.from("avatars").upload(filePath, avatarFile, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const goNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (selectedRole === "learner") {
      if (step === 2) {
        if (!validateLearnerInfo()) return;
        setStep(3);
        return;
      }

      if (step === 3) {
        if (!validateAvatar()) return;
        if (!validatePersonalInfo()) return;
        setStep(4);
        return;
      }

      return;
    }

    if (step === 2) {
      if (!validateSpecialization()) return;
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!validateAvatar()) return;
      if (!validatePersonalInfo()) return;
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!validateBusinessInfo()) return;
      setStep(5);
      return;
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const finishOnboarding = async () => {
    if (!user?.id) {
      toast.error("No active user session found.");
      return;
    }

    if (!validateAvatar()) return;

    if (selectedRole === "learner") {
      if (!validateLearnerInfo()) return;
      if (!validatePersonalInfo()) return;
    } else {
      if (!validateSpecialization()) return;
      if (!validatePersonalInfo()) return;
      if (!validateBusinessInfo()) return;
      if (!validateProfessionalInfo()) return;
    }

    try {
      setLoading(true);

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const nextProfession =
        selectedRole === "learner"
          ? null
          : formatProfessionFromSpecialization(
              selectedRole,
              resolvedSpecialization,
              profession.trim(),
            );

      const slugBase =
        selectedRole === "learner"
          ? resolvedLearnerGoal || fullName || user.id.slice(0, 8)
          : resolvedSpecialization || profession || fullName || user.id.slice(0, 8);

      const profileSlug = `${selectedRole}-${slugify(slugBase)}-${user.id.slice(0, 8)}`;

      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const learnerBio =
        selectedRole === "learner" && learnerInterests.trim()
          ? `${bio.trim()}\n\nInterests: ${learnerInterests.trim()}`
          : bio.trim();

      const finalBio = selectedRole === "learner" ? learnerBio : bio.trim();

      const { error } = await supabase.rpc("complete_onboarding", {
        p_role: selectedRole,
        p_full_name: fullName.trim() || null,
        p_display_name: displayName.trim() || null,
        p_phone: phone.trim() || null,
        p_country: country.trim() || null,
        p_city: city.trim() || null,
        p_bio: finalBio || null,
        p_profession: nextProfession,
        p_experience: selectedRole === "learner" ? null : experience.trim() || null,
        p_certification: selectedRole === "learner" ? null : certification.trim() || null,
        p_specialization_type:
          selectedRole === "learner" ? null : resolvedSpecialization || null,
        p_specialization_slug:
          selectedRole === "learner"
            ? null
            : resolvedSpecialization
              ? slugify(resolvedSpecialization)
              : null,
        p_business_name: selectedRole === "learner" ? null : businessName.trim() || null,
        p_business_email: selectedRole === "learner" ? null : businessEmail.trim() || null,
        p_business_phone: selectedRole === "learner" ? null : businessPhone.trim() || null,
        p_business_website: selectedRole === "learner" ? null : businessWebsite.trim() || null,
        p_business_address: selectedRole === "learner" ? null : businessAddress.trim() || null,
        p_business_description:
          selectedRole === "learner" ? null : businessDescription.trim() || null,
        p_learner_goal: selectedRole === "learner" ? resolvedLearnerGoal || null : null,
        p_learner_looking_forward:
          selectedRole === "learner" ? learnerLookingForward.trim() || null : null,
        p_profile_slug: profileSlug,
        p_email: authUser?.email || user.email || null,
      });

      if (error) throw error;

      const profilePatch: Record<string, any> = {
        bio: finalBio || null,
      };

      if (avatarUrl) {
        profilePatch.avatar_url = avatarUrl;
      }

      if (selectedRole !== "learner" && resolvedSpecialization) {
        const { error: categoryError } = await supabase.from("categories").upsert(
          {
            name: resolvedSpecialization,
            slug: slugify(resolvedSpecialization),
          } as any,
          { onConflict: "slug" },
        );

        if (categoryError) throw categoryError;
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update(profilePatch as any)
        .eq("user_id", user.id);

      if (profileUpdateError) throw profileUpdateError;

      if (avatarUrl) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl },
        });

        if (authUpdateError) throw authUpdateError;
      }

      if (typeof refreshAll === "function") {
        await refreshAll();
      } else {
        await refreshProfile();
        await refreshRoles();
      }

      toast.success("Onboarding completed");

      if (selectedRole === "coach") {
        navigate("/coach/dashboard", { replace: true });
        return;
      }

      if (selectedRole === "creator") {
        navigate("/creator/dashboard", { replace: true });
        return;
      }

      if (selectedRole === "therapist") {
        navigate("/therapist/dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error?.message ?? "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium text-primary">
            Step {step} of {totalSteps}
          </p>
          <h1 className="text-3xl font-bold text-foreground">Complete your onboarding</h1>
          <p className="mt-2 text-muted-foreground">
            Choose your role and complete the right details for your account.
          </p>
        </div>

        {step === 1 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyRoleDefaults(option.value)}
                  className={`rounded-2xl border p-0 text-left transition ${
                    selectedRole === option.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-foreground">{option.title}</h2>
                      <p className="mt-2 text-muted-foreground">{option.description}</p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={goNext}>Continue</Button>
            </div>
          </>
        )}

        {selectedRole === "learner" && step === 2 && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Learning goals</h2>
              <p className="text-sm text-muted-foreground">
                Tell us what you want to achieve so your experience fits your goals.
              </p>
            </div>

            <div>
              <Label>What is your main goal?</Label>
              <Select value={learnerGoal} onValueChange={setLearnerGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your goal" />
                </SelectTrigger>
                <SelectContent>
                  {learnerGoalOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {learnerGoal === "Other" && (
              <div>
                <Label>Enter your goal</Label>
                <Input
                  value={customLearnerGoal}
                  onChange={(e) => setCustomLearnerGoal(e.target.value)}
                  placeholder="Type your goal"
                />
              </div>
            )}

            <div>
              <Label>What are you looking forward to?</Label>
              <Textarea
                value={learnerLookingForward}
                onChange={(e) => setLearnerLookingForward(e.target.value)}
                placeholder="Tell us clearly what you want to gain from the platform"
                rows={5}
              />
            </div>

            <div>
              <Label>Your interests</Label>
              <Input
                value={learnerInterests}
                onChange={(e) => setLearnerInterests(e.target.value)}
                placeholder="Example: design, finance, coding, wellness"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button onClick={goNext}>Continue</Button>
            </div>
          </div>
        )}

        {selectedRole !== "learner" && step === 2 && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Choose specialization</h2>
              <p className="text-sm text-muted-foreground">Choose the real area you work in.</p>
            </div>

            {currentSpecializationConfig && (
              <>
                <div>
                  <Label>{currentSpecializationConfig.label}</Label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentSpecializationConfig.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {currentSpecializationConfig.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {specialization === "Other" && (
                  <div>
                    <Label>Enter your specialization</Label>
                    <Input
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      placeholder="Type your specialization"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button onClick={goNext}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Personal information</h2>
              <p className="text-sm text-muted-foreground">Fill your real profile details.</p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
              <ProfileAvatar
                src={avatarPreview}
                name={fullName || displayName || user?.email || "Profile"}
                className="h-20 w-20"
                fallbackClassName="bg-slate-950 text-white text-xl font-semibold"
              />
              <div className="flex-1">
                <Label>Profile picture / avatar *</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Profile image is compulsory for every department.
                </p>
              </div>
            </div>

            <div>
              <Label>Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label>Display name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Country</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write real information about yourself"
                rows={5}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button onClick={goNext}>Continue</Button>
            </div>
          </div>
        )}

        {selectedRole !== "learner" && step === 4 && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Business information</h2>
              <p className="text-sm text-muted-foreground">
                Add your real business or professional details.
              </p>
            </div>

            <div>
              <Label>Business / Brand name</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business or brand name"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Business email</Label>
                <Input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="Enter business email"
                />
              </div>

              <div>
                <Label>Business phone</Label>
                <Input
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="Enter business phone"
                />
              </div>
            </div>

            <div>
              <Label>Website / Portfolio link</Label>
              <Input
                value={businessWebsite}
                onChange={(e) => setBusinessWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label>Business address</Label>
              <Input
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Enter business address"
              />
            </div>

            <div>
              <Label>Business description</Label>
              <Textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Write a real business description"
                rows={5}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button onClick={goNext}>Continue</Button>
            </div>
          </div>
        )}

        {selectedRole !== "learner" && step === 5 && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Professional details</h2>
              <p className="text-sm text-muted-foreground">
                Fill in your real professional information.
              </p>
            </div>

            {resolvedSpecialization && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Selected specialization:{" "}
                <span className="font-medium text-foreground">{resolvedSpecialization}</span>
              </div>
            )}

            <div>
              <Label>Profession</Label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Enter profession"
              />
            </div>

            <div>
              <Label>Experience</Label>
              <Input
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Enter experience"
              />
            </div>

            <div>
              <Label>Certification</Label>
              <Input
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                placeholder="Enter certification"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button onClick={finishOnboarding} disabled={loading}>
                {loading ? "Saving..." : "Finish"}
              </Button>
            </div>
          </div>
        )}

        {selectedRole === "learner" && step === 4 && (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Review and finish</h2>
              <p className="text-sm text-muted-foreground">
                Confirm your learner details and complete onboarding.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
              <p>
                <span className="font-medium text-foreground">Goal:</span>{" "}
                {resolvedLearnerGoal || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground">Looking forward to:</span>{" "}
                {learnerLookingForward || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground">Full name:</span> {fullName || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground">Country:</span> {country || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground">Image:</span>{" "}
                {avatarFile ? avatarFile.name : "-"}
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button onClick={finishOnboarding} disabled={loading}>
                {loading ? "Saving..." : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;