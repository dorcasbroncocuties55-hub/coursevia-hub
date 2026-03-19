import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Lightbulb } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-spacing">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Coach CTA */}
          <motion.div
            className="relative overflow-hidden rounded-lg border border-border bg-card p-8 lg:p-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <GraduationCap className="text-primary mb-4" size={32} />
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Become a Coach
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Work with verified experts and get real results faster. Share
              your expertise, set your own rates, and build a thriving coaching
              practice on Coursevia.
            </p>
            <Button variant="hero" asChild>
              <Link to="/signup">
                Start Coaching
                <ArrowRight className="ml-1" size={16} />
              </Link>
            </Button>
          </motion.div>

          {/* Creator CTA */}
          <motion.div
            className="relative overflow-hidden rounded-lg border border-border bg-card p-8 lg:p-10"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Lightbulb className="text-accent mb-4" size={32} />
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Become a Creator
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Turn your knowledge into income and reach a global audience.
              Upload courses, premium videos, and build your brand with
              built-in analytics.
            </p>
            <Button variant="accent" asChild>
              <Link to="/signup">
                Start Creating
                <ArrowRight className="ml-1" size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
