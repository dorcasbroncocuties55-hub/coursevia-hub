import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    features: [
      "Browse public courses, videos, and provider profiles",
      "Create an account and manage your dashboard",
      "Purchase courses, videos, or sessions individually",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Monthly",
    price: "$10",
    period: "/month",
    featured: true,
    features: [
      "Contact coaches, therapists, and creators",
      "Receive the latest platform alerts",
      "Create playlists and manage saved videos",
      "Download eligible content and leave reviews",
      "Report users or content when needed",
    ],
    cta: "Choose monthly",
  },
  {
    name: "Yearly",
    price: "$120",
    period: "/year",
    features: [
      "Everything in Monthly",
      "Annual billing at a lower effective monthly rate",
      "Best for consistent learning, bookings, and premium platform access",
    ],
    cta: "Choose yearly",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleSubscriptionClick = (plan: "monthly" | "yearly") => {
    navigate(`/dashboard/subscription?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Simple pricing for serious learning</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Start free, upgrade when you need premium tools, and pay separately for individual videos, courses, or sessions when required.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${plan.featured ? "scale-105 border-primary bg-card shadow-lg" : "border-border bg-card"}`}
            >
              {plan.featured ? (
                <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Recommended
                </span>
              ) : null}

              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mb-6 mt-3">
                <span className="font-mono text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={14} className="shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Button className="w-full" variant="outline" asChild>
                  <Link to={plan.href!}>{plan.cta}</Link>
                </Button>
              ) : (
                <Button className="w-full" onClick={() => handleSubscriptionClick(plan.name === "Monthly" ? "monthly" : "yearly")}>
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
