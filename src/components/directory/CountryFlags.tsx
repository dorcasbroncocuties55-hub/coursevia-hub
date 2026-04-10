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
  basePath: string;
};

export default function CountryFlags({ basePath }: Props) {
  const navigate = useNavigate();
  const toSlug = (name: string) => name.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {FEATURED_COUNTRIES.map((c) => (
        <button
          key={c.code}
          onClick={() => navigate(`${basePath}/${toSlug(c.name)}`)}
          className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
        >
          <img
            src={`https://flagcdn.com/28x21/${c.code.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/56x42/${c.code.toLowerCase()}.png 2x`}
            alt={c.name}
            className="h-5 w-7 rounded-sm object-cover"
            loading="lazy"
          />
          {c.name}
        </button>
      ))}
    </div>
  );
}
