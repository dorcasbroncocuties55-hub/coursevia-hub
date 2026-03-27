import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("content_items" as any)
        .select("*")
        .eq("content_type", "course")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setCourses(data as any[]);
        return;
      }

      const fallback = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      setCourses(fallback.data || []);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <h1 className="text-4xl font-bold text-foreground mb-2">Courses</h1>
        <p className="text-muted-foreground mb-8">
          Structured learning paths built from lessons and episodes in one unified content system.
        </p>

        {courses.length === 0 ? (
          <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-secondary" />
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-primary mb-2">Course</p>
                  <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.short_description || course.description}
                  </p>
                  <div className="mb-3 flex items-center gap-2">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">{Number(course.rating || 5).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">user friendly learning</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">${Number(course.price || 0).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">Episodes / Lessons</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
