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

          {/* Right — 3 images arranged in a collage */}
          <motion.div
            className="relative flex justify-center lg:justify-end min-h-[380px] lg:min-h-[440px]"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Main center image — Creator */}
            <motion.div
              className="relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <img
                src={heroCreator}
                alt="Content creator on Coursevia"
                className="w-64 lg:w-72 object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* Left image — Business / Coaches */}
            <motion.div
              className="absolute left-0 lg:-left-4 bottom-4 z-20"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="rounded-2xl overflow-hidden border-4 border-background shadow-lg bg-background">
                <img
                  src={heroBusiness}
                  alt="Business coaching on Coursevia"
                  className="w-36 lg:w-44 h-28 lg:h-32 object-cover"
                />
              </div>
            </motion.div>

            {/* Right image — Therapist */}
            <motion.div
              className="absolute right-0 lg:-right-2 top-2 z-20"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="rounded-2xl overflow-hidden border-4 border-background shadow-lg bg-background">
                <img
                  src={heroTherapist}
                  alt="Therapist on Coursevia"
                  className="w-36 lg:w-44 h-28 lg:h-32 object-cover"
                />
              </div>
            </motion.div>

            {/* Floating course count badge */}
            <motion.div
              className="absolute bottom-0 right-8 z-30 bg-primary text-primary-foreground rounded-full h-20 w-20 flex flex-col items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <GraduationCap size={18} />
              <span className="text-base font-bold">1,235</span>
              <span className="text-[9px]">courses</span>
            </motion.div>

            {/* Rating badge */}
            <motion.div
              className="absolute top-12 left-8 z-30 bg-card border border-border rounded-lg px-3 py-2 shadow-md flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              <span className="text-lg font-bold text-foreground">4.8</span>
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
            </motion.div>

            {/* Users badge */}
            <motion.div
              className="absolute bottom-16 left-2 z-30 bg-card border border-border rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <Users size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">5K+ Users</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
