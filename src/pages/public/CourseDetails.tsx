import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CourseDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from("courses").select("*").eq("slug", slug).single().then(({ data }) => setCourse(data));
  }, [slug]);

  if (!course) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container-wide section-spacing">
        <div className="max-w-3xl">
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full capitalize">{course.level}</span>
          <h1 className="text-3xl font-bold text-foreground mt-4 mb-3">{course.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">{course.description}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-foreground font-mono">${Number(course.price).toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">{course.total_students} students</span>
          </div>
          <Button variant="hero" size="lg" onClick={() => toast.info("Payment flow coming soon")}>Enroll Now</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default CourseDetails;
