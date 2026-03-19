import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("videos").insert({
      creator_id: user.id,
      title,
      slug: slug + "-" + Date.now(),
      description,
      video_url: videoUrl,
      price: parseFloat(price) || 0,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Video created!");
      navigate("/creator/content");
    }
  };

  return (
    <DashboardLayout role="creator">
      <h1 className="text-2xl font-bold text-foreground mb-6">Upload Video</h1>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 max-w-lg space-y-4">
        <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
        <div><Label>Video URL</Label><Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required placeholder="https://..." /></div>
        <div><Label>Price ($)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Upload Video"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default UploadVideo;
