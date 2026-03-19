import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CoachProfile = () => {
  const { user } = useAuth();
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <DashboardLayout role="coach">
      <h1 className="text-2xl font-bold text-foreground mb-6">Coach Profile</h1>
      <div className="bg-card border border-border rounded-lg p-6 max-w-lg space-y-4">
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
