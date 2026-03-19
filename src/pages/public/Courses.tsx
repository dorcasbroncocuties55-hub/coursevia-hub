import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("courses").select("*").eq("status", "published").order("created_at", { ascending: false }).then(({ data }) => setCourses(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container-wide section-spacing">
        <h1 className="text-4xl font-bold text-foreground mb-2">Courses</h1>
        <p className="text-muted-foreground mb-8">Browse high-quality courses from verified creators.</p>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => (
              <Link key={c.id} to={`/courses/${c.slug}`} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-secondary" />
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.short_description || c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">${Number(c.price).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground capitalize">{c.level}</span>
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
