import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Clock, BookOpen, Star, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CoursesSection = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => setCategories(data || []));
    supabase.from("courses").select("*, categories(name)").eq("status", "published").order("created_at", { ascending: false }).limit(6).then(({ data }) => setCourses(data || []));
  }, []);

  const scrollTabs = (dir: "left" | "right") => {
    tabsRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const filtered = courses.filter(c => {
    const matchCat = !activeCategory || c.category_id === activeCategory;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section className="section-spacing">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            All <span className="text-primary">Courses</span> of Coursevia
          </h2>
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => scrollTabs("left")} className="shrink-0 h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
            <ChevronLeft size={18} />
          </button>
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTabs("right")} className="shrink-0 h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No courses available yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/courses/${course.slug}`} className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
                    {course.thumbnail_url && (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    {course.categories?.name && (
                      <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                        {course.categories.name}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} /> 08 hr 15 mins</span>
                      <span className="flex items-center gap-1"><BookOpen size={12} /> {course.total_students || 0} Students</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Number(course.price) > 0 ? (
                          <span className="font-bold text-foreground font-mono">${Number(course.price).toFixed(2)}</span>
                        ) : (
                          <span className="font-bold text-primary">Free</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-foreground">{Number(course.rating || 0).toFixed(1)}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= Math.round(Number(course.rating || 0)) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* More courses button */}
        <div className="flex justify-center mt-10">
          <Button variant="outline" className="rounded-full px-8" asChild>
            <Link to="/courses">Other Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
