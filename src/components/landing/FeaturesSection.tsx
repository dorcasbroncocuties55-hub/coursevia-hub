import { motion } from "framer-motion";
import { BookOpen, Users, Video, Wallet, Shield, MessageSquare } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Marketplace",
    description: "Browse and purchase high-quality courses from verified creators across hundreds of categories.",
  },
  {
    icon: Users,
    title: "Expert Coaching",
    description: "Book 1-on-1 sessions with verified coaches. Get personalized mentorship that accelerates results.",
  },
  {
    icon: Video,
    title: "Premium Video Content",
    description: "Netflix-style video library with cinematic learning experiences. Preview before you pay.",
  },
  {
    icon: Wallet,
    title: "Built-in Wallet System",
    description: "Secure internal wallet with full ledger. Track every transaction, earning, and withdrawal.",
  },
  {
    icon: Shield,
    title: "Verified & Trusted",
    description: "Every coach and creator goes through ID verification. Funds held in escrow for your safety.",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "Built-in chat with anti-leak protection. Your private information stays safe on our platform.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-spacing bg-secondary/50">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to learn, teach, and grow
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One platform that combines course creation, expert coaching, and secure payments.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="text-primary" size={20} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
