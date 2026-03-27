import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ChevronDown, ChevronRight, Lock } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";
import CourseHelpBox from "@/components/CourseHelpBox";

const CourseDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [creator, setCreator] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [openCurriculum, setOpenCurriculum] = useState(true);

  useEffect(() => {
    const fetchUnified = async () => {
      if (!slug) return false;

      const { data: contentItem } = await supabase
        .from("content_items" as any)
        .select("*")
        .eq("slug", slug)
        .eq("content_type", "course")
        .maybeSingle();

      if (!contentItem) return false;

      setCourse(contentItem);

      const [episodesRes, creatorRes] = await Promise.all([
        supabase
          .from("content_episodes" as any)
          .select("*")
          .eq("content_id", (contentItem as any).id)
          .order("episode_number", { ascending: true }),
        supabase
          .from("profiles")
          .select("full_name, avatar_url, profile_slug, profession")
          .eq("user_id", (contentItem as any).owner_id)
          .maybeSingle(),
      ]);

      setEpisodes((episodesRes.data as any[]) || []);
      setCreator(creatorRes.data);

      if (user) {
        const { data: purchase } = await supabase
          .from("content_purchases" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("content_id", contentItem.id)
          .maybeSingle();

        setHasAccess(!!purchase);
      }

      return true;
    };

    const fetchFallback = async () => {
      if (!slug) return;
      const { data: courseData } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
      if (!courseData) return;
      setCourse(courseData);

      const [creatorRes, sectionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, profile_slug, profession").eq("user_id", courseData.creator_id).maybeSingle(),
        supabase.from("course_sections").select("*, course_lessons(*)").eq("course_id", courseData.id).order("sort_order"),
      ]);

      setCreator(creatorRes.data);
      const flatEpisodes = (sectionsRes.data || []).flatMap((section: any, idx: number) =>
        (section.course_lessons || []).map((lesson: any, lessonIdx: number) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          video_url: lesson.video_url,
          episode_number: idx * 100 + lessonIdx + 1,
          duration_seconds: lesson.duration_seconds || 0,
          is_preview: false,
        }))
      );
      setEpisodes(flatEpisodes);

      if (user) {
        const { data: access } = await supabase
          .from("content_access")
          .select("id")
          .eq("user_id", user.id)
          .eq("content_id", courseData.id)
          .eq("content_type", "course")
          .maybeSingle();
        setHasAccess(!!access);
      }
    };

    (async () => {
      const ok = await fetchUnified();
      if (!ok) await fetchFallback();
    })();
  }, [slug, user]);

  const totalDuration = useMemo(
    () => episodes.reduce((acc, item) => acc + Number(item.duration_seconds || 0), 0),
    [episodes]
  );

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const episodeCount = episodes.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <div className="grid lg:grid-cols-[1.5fr_0.8fr] gap-8">
          <div className="space-y-6">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full rounded-xl aspect-video object-cover"
              />
            )}

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-primary">Course</p>
              <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              {creator?.profile_slug && (
                <a href={`/profile/${creator.profile_slug}`} className="text-primary hover:underline text-sm">
                  View {creator.full_name || "instructor"} profile
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><BookOpen size={16} /> {episodeCount} lessons</div>
              <div className="flex items-center gap-1.5"><Clock size={16} /> {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m</div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenCurriculum((v) => !v)}
                className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {openCurriculum ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-medium text-foreground text-sm">Curriculum</span>
                </div>
                <span className="text-xs text-muted-foreground">{episodeCount} lessons</span>
              </button>

              {openCurriculum && (
                <div className="divide-y divide-border">
                  {episodes.map((lesson: any) => (
                    <div key={lesson.id} className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Lesson {lesson.episode_number}: {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                        )}
                      </div>
                      {!hasAccess && <Lock size={16} className="text-muted-foreground shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasAccess && course.owner_id && (
              <CourseHelpBox contentId={course.id} ownerId={course.owner_id} />
            )}
          </div>

          <aside className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24 space-y-4">
            <p className="text-3xl font-bold text-foreground">${Number(course.price || 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              Courses should carry the highest value because they include structure, lessons, and support.
            </p>
            {!hasAccess ? (
              <Button className="w-full" onClick={() => setShowPayment(true)}>Buy Course</Button>
            ) : (
              <Button className="w-full" variant="outline">Purchased</Button>
            )}
          </aside>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          contentType="course"
          contentId={course.id}
          contentTitle={course.title}
          amount={Number(course.price || 0)}
          onClose={() => setShowPayment(false)}
          onSuccess={() => setShowPayment(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default CourseDetails;
