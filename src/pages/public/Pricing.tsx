import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  { name: "Free", price: "0", period: "forever", features: ["Browse courses", "View coach profiles", "Basic support"], cta: "Get Started" },
  { name: "Monthly", price: "19.99", period: "/month", features: ["All free features", "Unlimited video access", "Priority booking", "Direct messaging", "Certificate downloads"], cta: "Subscribe Now", featured: true },
  { name: "Yearly", price: "149.99", period: "/year", features: ["Everything in Monthly", "Save 37%", "Exclusive content", "Priority support", "Early access to new features"], cta: "Subscribe Now" },
];

const Pricing = () => (
  <div className="min-h-screen bg-background"><Navbar />
    <div className="container-wide section-spacing">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h1>
        <p className="text-muted-foreground text-lg">Choose the plan that fits your learning goals.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map(p => (
          <div key={p.name} className={`bg-card border rounded-lg p-6 ${p.featured ? "border-primary shadow-lg scale-105" : "border-border"}`}>
            {p.featured && <span className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full mb-4 inline-block">Most Popular</span>}
            <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
            <div className="mt-3 mb-6">
              <span className="text-3xl font-bold text-foreground font-mono">${p.price}</span>
              <span className="text-muted-foreground text-sm">{p.period}</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="text-primary shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={p.featured ? "default" : "outline"} asChild>
              <Link to="/signup">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);
export default Pricing;
