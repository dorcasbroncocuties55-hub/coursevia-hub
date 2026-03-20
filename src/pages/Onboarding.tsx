import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Lightbulb, Check } from "lucide-react";

type RoleOption = "learner" | "coach" | "creator";

const roles: { value: RoleOption; label: string; description: string; icon: React.ElementType }[] = [
  { value: "learner", label: "Learner", description: "Browse courses, book coaches, and access premium content.", icon: GraduationCap },
  { value: "coach", label: "Coach", description: "Offer coaching services, manage bookings, and earn from expertise.", icon: BookOpen },
  { value: "creator", label: "Creator", description: "Upload courses, publish videos, and build your brand.", icon: Lightbulb },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;
    setLoading(true);

    try {
      // Insert role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: selectedRole });
      if (roleError) throw roleError;

      // If coach, create coach profile
      if (selectedRole === "coach") {
        await supabase.from("coach_profiles").insert({ user_id: user.id });
      }

      // Mark onboarding complete
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      await refreshProfile();
      toast.success(`Welcome aboard as a ${selectedRole}!`);

      const redirectMap: Record<RoleOption, string> = {
        learner: "/dashboard",
        coach: "/coach/dashboard",
        creator: "/creator/dashboard",
      };
      navigate(redirectMap[selectedRole]);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">How will you use Coursevia?</h1>
          <p className="text-muted-foreground">Choose your primary role. You can always change this later.</p>
        </motion.div>

        <div className="space-y-3">
          {roles.map((role, i) => (
            <motion.button
              key={role.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedRole(role.value)}
              className={`w-full text-left p-5 rounded-lg border-2 transition-all duration-200 ${
                selectedRole === role.value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${
                  selectedRole === role.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <role.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{role.label}</h3>
                    {selectedRole === role.value && <Check size={18} className="text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <Button className="w-full mt-8" size="lg" disabled={!selectedRole || loading} onClick={handleContinue}>
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
