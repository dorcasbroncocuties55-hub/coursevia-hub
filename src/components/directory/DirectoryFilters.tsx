import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (v: boolean) => void;
  providerType: "therapist" | "coach";
};

export default function DirectoryFilters({
  search, onSearchChange,
  country, onCountryChange,
  verifiedOnly, onVerifiedChange,
  providerType,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, specialty, issue, or location"
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="Nigeria">Nigeria</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Ghana">Ghana</SelectItem>
              <SelectItem value="South Africa">South Africa</SelectItem>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={verifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onVerifiedChange(!verifiedOnly)}
          >
            {verifiedOnly ? "✓ Verified Only" : "Verified Only"}
          </Button>
        </div>
      )}
    </div>
  );
}
