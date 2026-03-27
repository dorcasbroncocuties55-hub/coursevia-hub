import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  contentTypeMeta,
  slugify,
  uploadThumbnailFile,
  UnifiedContentType,
} from "@/lib/unifiedContent";
import { uploadPrivateVideoFile } from "@/lib/videoAccess";
import { MIN_PROVIDER_PRICE, isValidProviderPrice } from "@/lib/pricingRules";

type EpisodeDraft = {
  title: string;
  description: string;
  file: File | null;
};

const emptyEpisode = (): EpisodeDraft => ({
  title: "",
  description: "",
  file: null,
});

const UploadVideo = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const ownerRole = useMemo(() => {
    if (roles.includes("coach")) return "coach";
    if (roles.includes("therapist")) return "therapist";
    return "creator";
  }, [roles]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<UnifiedContentType>("single_video");
  const [price, setPrice] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [singleVideoFile, setSingleVideoFile] = useState<File | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeDraft[]>([emptyEpisode(), emptyEpisode()]);
  const [loading, setLoading] = useState(false);

  const updateEpisode = (index: number, next: Partial<EpisodeDraft>) => {
    setEpisodes((prev) => prev.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };

  const addEpisode = () => setEpisodes((prev) => [...prev, emptyEpisode()]);

  const createFallbackVideo = async (
    storagePath: string,
    thumbnailUrl: string | null,
    numericPrice: number,
  ) => {
    const { error } = await supabase.from("videos").insert({
      user_id: user!.id,
      creator_id: user!.id,
      title: title.trim(),
      description: description.trim() || null,
      storage_path: storagePath,
      thumbnail_url: thumbnailUrl,
      role: ownerRole,
      price: numericPrice,
      is_paid: true,
      status: "published",
      slug: `${slugify(title)}-${Date.now()}`,
      preview_seconds: 5,
    } as any);

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const numericPrice = Number(price || 0);
    if (!Number.isFinite(numericPrice) || !isValidProviderPrice(numericPrice)) {
      toast.error(`Videos must be at least $${MIN_PROVIDER_PRICE}.`);
      return;
    }

    if (contentType === "single_video" && !singleVideoFile) {
      toast.error("Please upload the video file.");
      return;
    }

    if (contentType === "episode_series") {
      const validEpisodes = episodes.filter((ep) => ep.title.trim() && ep.file);
      if (validEpisodes.length === 0) {
        toast.error("Add at least one episode.");
        return;
      }
      const invalidEpisode = episodes.find((ep) => ep.title.trim() && !ep.file);
      if (invalidEpisode) {
        toast.error("Every added episode must include a video file.");
        return;
      }
    }

    try {
      setLoading(true);

      const slug = `${slugify(title)}-${Date.now()}`;
      let thumbnailUrl: string | null = null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnailFile(user.id, thumbnailFile);
      }

      if (contentType === "single_video") {
        const storagePath = await uploadPrivateVideoFile(user.id, singleVideoFile as File);

        const { data: contentItem, error: itemError } = await supabase
          .from("content_items" as any)
          .insert({
            owner_id: user.id,
            owner_role: ownerRole,
            title: title.trim(),
            slug,
            description: description.trim() || null,
            content_type: contentType,
            thumbnail_url: thumbnailUrl,
            price: numericPrice,
            preview_seconds: 5,
            video_storage_path: storagePath,
            is_published: true,
          } as any)
          .select("id")
          .single();

        if (itemError) {
          await createFallbackVideo(storagePath, thumbnailUrl, numericPrice);
        } else {
          const { error: episodeError } = await supabase.from("content_episodes" as any).insert({
            content_id: (contentItem as any).id,
            title: title.trim(),
            description: description.trim() || null,
            video_url: null,
            video_storage_path: storagePath,
            episode_number: 1,
            is_preview: true,
          } as any);

          if (episodeError) {
            const msg = String(episodeError.message || "").toLowerCase();
            if (msg.includes("does not exist") || msg.includes("content_episodes")) {
              await supabase
                .from("content_items" as any)
                .update({ video_storage_path: storagePath } as any)
                .eq("id", (contentItem as any).id);
            } else {
              throw episodeError;
            }
          }
        }
      } else {
        const { data: contentItem, error: itemError } = await supabase
          .from("content_items" as any)
          .insert({
            owner_id: user.id,
            owner_role: ownerRole,
            title: title.trim(),
            slug,
            description: description.trim() || null,
            content_type: contentType,
            thumbnail_url: thumbnailUrl,
            price: numericPrice,
            preview_seconds: 5,
            is_published: true,
          } as any)
          .select("id")
          .single();

        if (itemError) throw itemError;

        const validEpisodes = episodes.filter((ep) => ep.title.trim() && ep.file);
        for (let i = 0; i < validEpisodes.length; i++) {
          const episode = validEpisodes[i];
          const storagePath = await uploadPrivateVideoFile(user.id, episode.file as File);

          const { error: episodeError } = await supabase.from("content_episodes" as any).insert({
            content_id: (contentItem as any).id,
            title: episode.title.trim(),
            description: episode.description.trim() || null,
            video_url: null,
            video_storage_path: storagePath,
            episode_number: i + 1,
            is_preview: i === 0,
          } as any);

          if (episodeError) throw episodeError;
        }
      }

      toast.success(
        contentType === "single_video"
          ? "Video published with 5-second preview!"
          : "Series published with 5-second preview!",
      );
      navigate(`/${ownerRole}/content`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to publish content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role={ownerRole as any}>
      <h1 className="text-2xl font-bold text-foreground mb-6">Publish Video Content</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg p-6 max-w-3xl space-y-5"
      >
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Content Type</Label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as UnifiedContentType)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="single_video">Single Video</option>
              <option value="episode_series">Episode Series</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              {contentTypeMeta[contentType].pricingHint}
            </p>
          </div>

          <div>
            <Label>Price ($)</Label>
            <Input
              type="number"
              min={String(MIN_PROVIDER_PRICE)}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="6.00"
            />
            <p className="text-xs text-muted-foreground mt-2">
              All videos are paid. Minimum paid price is $6. Learners can watch only a 5-second preview before purchase.
            </p>
          </div>
        </div>

        <div>
          <Label>Thumbnail (optional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
        </div>

        {contentType === "single_video" ? (
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground">Single Video File</h2>
            <div>
              <Label>Upload file</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setSingleVideoFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Episodes</h2>
              <Button type="button" variant="outline" onClick={addEpisode}>
                Add Episode
              </Button>
            </div>
            {episodes.map((episode, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                <p className="font-medium text-foreground">Episode {index + 1}</p>
                <Input
                  placeholder="Episode title"
                  value={episode.title}
                  onChange={(e) => updateEpisode(index, { title: e.target.value })}
                />
                <Textarea
                  placeholder="Episode description"
                  value={episode.description}
                  onChange={(e) => updateEpisode(index, { description: e.target.value })}
                  rows={2}
                />
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => updateEpisode(index, { file: e.target.files?.[0] || null })}
                />
              </div>
            ))}
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish Content"}
        </Button>
      </form>
    </DashboardLayout>
  );
};

export default UploadVideo;
