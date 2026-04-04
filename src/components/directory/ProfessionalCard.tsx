import { Link } from "react-router-dom";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Star, CheckCircle, MessageCircle } from "lucide-react";

type Props = {
  profile: any;
  providerType: "therapist" | "coach";
};

export default function ProfessionalCard({ profile, providerType }: Props) {
  const profileLink = `/profile/${profile.profile_slug || profile.user_id}`;
  const name = profile.full_name || (providerType === "therapist" ? "Therapist" : "Coach");
  const title = profile.profession || profile.headline || (providerType === "therapist" ? "Licensed Therapist" : "Professional Coach");
  const bio = profile.bio || (providerType === "therapist"
    ? "Providing thoughtful, attentive, and ethical support to individuals navigating personal challenges."
    : "Helping individuals achieve clarity, growth, and measurable results through structured strategies.");
  const rating = Number(profile.rating || 5).toFixed(1);
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
      <div className="flex gap-4">
        <Link to={profileLink} className="shrink-0">
          <ProfileAvatar src={profile.avatar_url} name={name} className="h-20 w-20 rounded-xl" />
        </Link>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={profileLink} className="flex items-center gap-2 hover:underline">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <h3 className="text-lg font-bold text-foreground">{name}</h3>
                {profile.is_verified && (
                  <CheckCircle size={16} className="text-primary fill-primary/20" />
                )}
              </Link>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>

            <div className="hidden items-center gap-1 sm:flex">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{rating}</span>
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{bio}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {location}
              </span>
            )}
            {languages.length > 0 && (
              <span className="flex items-center gap-1">
                <Globe size={12} /> {languages.slice(0, 3).join(", ")}
              </span>
            )}
          </div>

          {profile.specialization_type && (
            <div className="flex flex-wrap gap-1.5">
              {profile.specialization_type.split(",").slice(0, 4).map((s: string) => (
                <Badge key={s.trim()} variant="secondary" className="text-[11px] font-medium">
                  {s.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link to={profileLink}>
            <MessageCircle size={14} className="mr-1.5" /> Message Now
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link to={profileLink}>View Profile</Link>
        </Button>
      </div>
    </div>
  );
}
