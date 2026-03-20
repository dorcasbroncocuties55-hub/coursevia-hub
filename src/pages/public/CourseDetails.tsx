import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookOpen, Clock, Users, Star, ChevronDown, ChevronRight, Play, Lock } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

const CourseDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [creator, setCreator] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    const fetchCourse = async () => {
      const { data: courseData } = await supabase.from("courses").select("*").eq("slug", slug).single();
      if (!courseData) return;
      setCourse(courseData);

      const [creatorRes, sectionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("user_id", courseData.creator_id).single(),
        supabase.from("course_sections").select("*, course_lessons(*)").eq("course_id", courseData.id).order("sort_order"),
      ]);
      setCreator(creatorRes.data);
      setSections(sectionsRes.data || []);

      if (user) {
        const { data: access } = await supabase.from("content_access")
          .select("id").eq("user_id", user.id).eq("content_id", courseData.id).eq("content_type", "course").maybeSingle();
        if (access || Number(courseData.price) === 0) setHasAccess(true);
      } else if (Number(courseData?.price) === 0) {
        setHasAccess(true);
      }
    };
    fetchCourse();
  }, [slug, user]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const totalLessons = sections.reduce((acc, s) => acc + (s.course_lessons?.length || 0), 0);
  const totalDuration = sections.reduce(
    (acc, s) => acc + (s.course_lessons?.reduce((a: number, l: any) => a + (l.duration_seconds || 0), 0) || 0), 0
  );

  if (!course) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} className="w-full rounded-xl aspect-video object-cover mb-6" />
            )}
            <h1 className="text-3xl font-bold text-foreground mb-3">{course.title}</h1>
            <p className="text-muted-foreground leading-relaxed mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><BookOpen size={16} /> {totalLessons} lessons</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock size={16} /> {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users size={16} /> {course.total_students} students</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Star size={16} /> {Number(course.rating).toFixed(1)}</div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-4">Curriculum</h2>
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.includes(section.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="font-medium text-foreground text-sm">{section.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{section.course_lessons?.length || 0} lessons</span>
                  </button>
                  {expandedSections.includes(section.id) && (
                    <div className="divide-y divide-border">
                      {section.course_lessons?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2">
                            {hasAccess || lesson.is_preview ? <Play size={14} className="text-primary" /> : <Lock size={14} className="text-muted-foreground" />}
                            <span className="text-sm text-foreground">{lesson.title}</span>
                            {lesson.is_preview && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Preview</span>}
                          </div>
                          {lesson.duration_seconds && (
                            <span className="text-xs text-muted-foreground">{Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, "0")}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <span className="text-3xl font-bold text-foreground font-mono block mb-2">
                {Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{course.level} · {course.currency}</span>

              {hasAccess ? (
                <div className="bg-primary/5 text-primary border border-primary/20 rounded-lg p-3 text-center text-sm font-medium mt-4">
                  ✓ You have access to this course
                </div>
              ) : (
                <Button className="w-full mt-4" size="lg" onClick={() => {
                  if (!user) { toast.info("Please sign in to enroll"); return; }
                  if (Number(course.price) === 0) {
                    supabase.from("content_access").insert({
                      user_id: user.id, content_id: course.id, content_type: "course"
                    }).then(({ error }) => {
                      if (error) toast.error(error.message);
                      else { setHasAccess(true); toast.success("Enrolled successfully!"); }
                    });
                  } else {
                    setShowPayment(true);
                  }
                }}>
                  {Number(course.price) === 0 ? "Enroll for Free" : "Enroll Now"}
                </Button>
              )}

              {creator && (
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Created by</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {creator.full_name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className="text-sm font-medium text-foreground">{creator.full_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          contentType="course"
          contentId={course.id}
          contentTitle={course.title}
          amount={Number(course.price)}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setHasAccess(true); setShowPayment(false); }}
        />
      )}
      <Footer />
    </div>
  );
};

export default CourseDetails;
