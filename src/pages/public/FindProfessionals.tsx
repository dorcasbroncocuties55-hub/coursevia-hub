import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ProfessionalCard from "@/components/directory/ProfessionalCard";
import CountryFlags from "@/components/directory/CountryFlags";
import DirectoryFilters from "@/components/directory/DirectoryFilters";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

type Props = {
  providerType: "therapist" | "coach";
};

const config = {
  therapist: {
    basePath: "/find-therapists",
    heroTitle: "Find a Therapist Near You",
    heroSub: "Connect with licensed and verified therapists who can support your mental health, emotional wellbeing, and personal healing journey.",
    countryTitle: (c: string) => `Find Therapists in ${c}`,
    countrySub: (c: string) => `Browse verified therapists across major cities in ${c}. Filter by specialty, language, and availability to find the right support for your needs.`,
    emptyText: "No therapists found. Try adjusting your filters.",
  },
  coach: {
    basePath: "/find-coaches",
    heroTitle: "Find a Coach to Guide Your Growth",
    heroSub: "Work with experienced coaches to improve your mindset, career, business, relationships, and personal development.",
    countryTitle: (c: string) => `Find Coaches in ${c}`,
    countrySub: (c: string) => `Discover professional coaches across ${c} who can help you achieve clarity, growth, and results in your personal or professional life.`,
    emptyText: "No coaches found. Try adjusting your filters.",
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

  const title = countryName ? cfg.countryTitle(countryName) : cfg.heroTitle;
  const subtitle = countryName ? cfg.countrySub(countryName) : cfg.heroSub;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container-wide py-12 md:py-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            {subtitle}
          </p>

          {!countryName && (
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-primary" />
                <strong className="text-foreground">{profiles.length}</strong> {providerType === "therapist" ? "therapists" : "coaches"} registered
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="container-wide py-8 space-y-8">
        {/* Search & Filters */}
        <DirectoryFilters
          search={search}
          onSearchChange={setSearch}
          country={filterCountry}
          onCountryChange={setFilterCountry}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
          providerType={providerType}
        />

        {/* Country Flags — only on main page */}
        {!countryName && <CountryFlags basePath={cfg.basePath} />}

        {/* Results */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {countryName
              ? `${providerType === "therapist" ? "Therapists" : "Coaches"} in ${countryName}`
              : `All ${providerType === "therapist" ? "Therapists" : "Coaches"}`}
            {!loading && <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>}
          </h2>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center">
              <Users size={40} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{cfg.emptyText}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((p) => (
                <ProfessionalCard key={p.user_id} profile={p} providerType={providerType} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
