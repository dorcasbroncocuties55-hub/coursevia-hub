import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Star, Users } from "lucide-react";
import heroBusiness from "@/assets/hero-business.png";
import heroCreator from "@/assets/hero-creator.png";
import heroTherapist from "@/assets/hero-therapist.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-primary/5 py-12 lg:py-20">
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
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

            <div className="flex items-center gap-6 flex-wrap">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link to="/courses">
                  Start A Course
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>

              <motion.div
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Users size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">5K+ Users</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right — 3 images in a grid layout */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:ml-auto">
              {/* Top-left: Rating badge + Therapist image (tall) */}
              <motion.div
                className="row-span-2 relative rounded-2xl overflow-hidden shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <img
                  src={heroTherapist}
                  alt="Therapist on Coursevia"
                  className="w-full h-full object-cover min-h-[260px] sm:min-h-[320px]"
                />
                {/* Rating badge overlay */}
                <motion.div
                  className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 shadow-md flex items-center gap-1.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <span className="text-lg font-bold text-foreground">4.8</span>
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                </motion.div>
              </motion.div>

              {/* Top-right: Creator image */}
              <motion.div
                className="rounded-2xl overflow-hidden shadow-lg"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <img
                  src={heroCreator}
                  alt="Content creator on Coursevia"
                  className="w-full h-36 sm:h-40 object-cover"
                />
              </motion.div>

              {/* Bottom-right: Business image + course badge */}
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <img
                  src={heroBusiness}
                  alt="Business coaching on Coursevia"
                  className="w-full h-36 sm:h-40 object-cover"
                />
                {/* Course count badge */}
                <motion.div
                  className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full h-16 w-16 flex flex-col items-center justify-center shadow-lg text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                >
                  <GraduationCap size={14} />
                  <span className="text-xs font-bold leading-tight">1,235</span>
                  <span className="text-[8px] leading-tight">courses</span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
