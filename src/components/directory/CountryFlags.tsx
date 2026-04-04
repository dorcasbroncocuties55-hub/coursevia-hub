import { useNavigate } from "react-router-dom";

const FEATURED_COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "IN", name: "India" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "EG", name: "Egypt" },
  { code: "BR", name: "Brazil" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
];

type Props = {
  basePath: string; // e.g. "/find-therapists" or "/find-coaches"
};

export default function CountryFlags({ basePath }: Props) {
  const navigate = useNavigate();

  const toSlug = (name: string) => name.toLowerCase().replaceAll(" ", "-");

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-1 text-xl font-bold text-foreground">Browse by Country</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Select your country to explore verified professionals near you or available online.
      </p>

      <div className="flex flex-wrap gap-3">
        {FEATURED_COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => navigate(`${basePath}/${toSlug(c.name)}`)}
            className="group flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
          >
            <img
              src={`https://flagcdn.com/24x18/${c.code.toLowerCase()}.png`}
              alt={c.name}
              className="h-4 w-6 rounded-sm object-cover"
              loading="lazy"
            />
            {c.name}
          </button>
        ))}
      </div>
    </section>
  );
}
