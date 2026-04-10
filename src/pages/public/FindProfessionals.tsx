import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ProfessionalCard from "@/components/directory/ProfessionalCard";
import CountryFlags from "@/components/directory/CountryFlags";
import DirectoryFilters from "@/components/directory/DirectoryFilters";
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, ChevronRight } from "lucide-react";

type Props = {
  providerType: "therapist" | "coach";
};

const config = {
  therapist: {
    basePath: "/find-therapists",
    heroTitle: "Find a Therapist",
    heroTitleAccent: "Near You",
    heroSub: "Connect with licensed and verified therapists who can support your mental health, emotional wellbeing, and personal healing journey.",
    heroTagline: "No Ads · No Algorithm · Just Real Client Care",
    countryTitle: (c: string) => `Therapists in ${c}`,
    countrySub: (c: string) => `Browse verified therapists across major cities in ${c}. Filter by specialty, language, and availability to find the right support for your needs.`,
    emptyText: "No therapists found. Try adjusting your filters.",
    statsLabel: "Therapists",
    nearbyTitle: "Find Nearby Psychologists\nAnd Therapists",
    startHere: [
      { title: "Choose Your Therapist", desc: "Use our directory to find verified therapists near you or online. Filter by specialty, location, and language." },
      { title: "Attend Your Sessions", desc: "Book sessions online or in-person. Work with your therapist through structured, evidence-based approaches." },
      { title: "Track Your Progress", desc: "Monitor your growth and wellbeing over time through your personal dashboard and session history." },
    ],
  },
  coach: {
    basePath: "/find-coaches",
    heroTitle: "Find a Coach to",
    heroTitleAccent: "Guide Your Growth",
    heroSub: "Work with experienced coaches to improve your mindset, career, business, relationships, and personal development.",
    heroTagline: "No Ads · No Algorithm · Just Real Growth",
    countryTitle: (c: string) => `Coaches in ${c}`,
    countrySub: (c: string) => `Discover professional coaches across ${c} who can help you achieve clarity, growth, and results in your personal or professional life.`,
    emptyText: "No coaches found. Try adjusting your filters.",
    statsLabel: "Coaches",
    nearbyTitle: "Find Professional\nCoaches Near You",
    startHere: [
      { title: "Choose Your Coach", desc: "Browse our directory of verified coaches. Filter by specialty, industry focus, and coaching style." },
      { title: "Book Your Sessions", desc: "Schedule coaching calls or in-person meetings. Work on actionable strategies and real goals." },
      { title: "Achieve Your Goals", desc: "Track milestones and celebrate progress through your personal coaching dashboard." },
    ],
  },
};

const slugToName = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function FindProfessionals({ providerType }: Props) {
  const { country: countrySlug } = useParams<{ country?: string }>();
  const countryName = countrySlug ? slugToName(countrySlug) : null;
  const cfg = config[providerType];

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", providerType)
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false });

      if (countryName) {
        query = query.ilike("country", `%${countryName}%`);
      }

      const { data } = await query;
      setProfiles(data || []);
      setLoading(false);
    };
    load();
  }, [providerType, countryName]);

  const filtered = useMemo(() => {
    let result = profiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.profession?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.specialization_type?.toLowerCase().includes(q)
      );
    }
    if (filterCountry !== "all") {
      result = result.filter((p) => p.country?.toLowerCase() === filterCountry.toLowerCase());
    }
    if (verifiedOnly) {
      result = result.filter((p) => p.is_verified);
    }
    return result;
  }, [profiles, search, filterCountry, verifiedOnly]);

  const title = countryName ? cfg.countryTitle(countryName) : null;
  const subtitle = countryName ? cfg.countrySub(countryName) : cfg.heroSub;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/8 via-background to-accent/5">
        <div className="container-wide py-14 md:py-20">
          <div className="max-w-2xl">
            {countryName ? (
              <>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Link to={cfg.basePath} className="hover:text-primary">Home</Link>
                  <ChevronRight size={14} />
                  <span className="text-foreground font-medium">{countryName}</span>
                </div>
                <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  Find a <span className="text-primary">{providerType === "therapist" ? "Therapist" : "Coach"}</span><br />
                  in <span className="text-primary">{countryName}</span>
                </h1>
              </>
            ) : (
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {cfg.heroTitle}{" "}
                <span className="text-primary">{cfg.heroTitleAccent}</span>
              </h1>
            )}
            <p className="mb-5 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">
              {subtitle}
            </p>
            <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
              {cfg.heroTagline}
            </p>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-2xl font-bold text-foreground">{profiles.length > 0 ? `${profiles.length}+` : "100+"}</span>
                <p className="text-muted-foreground">{cfg.statsLabel}<br />Registered</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <span className="text-2xl font-bold text-foreground">12+</span>
                <p className="text-muted-foreground">Countries<br />Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-wide py-10">

        {/* Results heading + filters */}
        <div className="mb-6">
          <h2 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
            {countryName
              ? `${providerType === "therapist" ? "Therapists" : "Coaches"} in ${countryName}`
              : `${cfg.statsLabel} Near You`}
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            {!loading && `${filtered.length} ${providerType === "therapist" ? "therapist" : "coach"}${filtered.length !== 1 ? "s" : ""} found in our directory`}
          </p>
        </div>

        {/* Filters */}
        <DirectoryFilters
          search={search}
          onSearchChange={setSearch}
          country={filterCountry}
          onCountryChange={setFilterCountry}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
          providerType={providerType}
        />

        {/* Results List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-16 text-center">
              <Search size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-lg font-medium text-foreground">No results found</p>
              <p className="text-muted-foreground">{cfg.emptyText}</p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProfessionalCard key={p.user_id} profile={p} providerType={providerType} />
            ))
          )}
        </div>
      </div>

      {/* Country Flags Section */}
      {!countryName && (
        <section className="border-y border-border bg-gradient-to-b from-primary/5 to-background">
          <div className="container-wide py-14 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl whitespace-pre-line">
              {cfg.nearbyTitle}
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Select your country to explore verified professionals near you or available online.
            </p>
            <CountryFlags basePath={cfg.basePath} />
          </div>
        </section>
      )}

      {/* Start Here Section */}
      {!countryName && (
        <section className="container-wide py-14">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
            Start <span className="text-primary">Here</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {cfg.startHere.map((step, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 text-center transition hover:shadow-md">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
