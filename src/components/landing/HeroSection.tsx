import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Star } from "lucide-react";
import heroImage from "@/assets/hero-student.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-primary/5 py-12 lg:py-20">
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
              <GraduationCap size={18} />
              Start your favourite course
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Now learning from anywhere, and build your{" "}
              <span className="text-primary">bright career.</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              Coursevia gives you access to courses, business knowledge, and expert coaches in one powerful platform.
            </p>

            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/courses">
                Start A Course
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
          </motion.div>

          {/* Right image with floating badges */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <img
                src={heroImage}
                alt="Student learning on Coursevia"
                className="w-80 lg:w-96 object-contain"
              />

              {/* Floating course count badge */}
              <motion.div
                className="absolute top-8 right-0 bg-primary text-primary-foreground rounded-full h-24 w-24 flex flex-col items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <GraduationCap size={20} />
                <span className="text-lg font-bold">1,235</span>
                <span className="text-[10px]">courses</span>
              </motion.div>

              {/* Rating badge */}
              <motion.div
                className="absolute top-0 right-[-20px] bg-card border border-border rounded-lg px-3 py-2 shadow-md flex items-center gap-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <span className="text-xl font-bold text-foreground">4.8</span>
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
