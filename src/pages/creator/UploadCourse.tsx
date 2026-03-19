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

const UploadCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("courses").insert({
      creator_id: user.id,
      title,
      slug: slug + "-" + Date.now(),
      description,
      price: parseFloat(price) || 0,
      level: level as "beginner" | "intermediate" | "advanced",
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Course created!");
      navigate("/creator/content");
    }
  };

  return (
    <DashboardLayout role="creator">
      <h1 className="text-2xl font-bold text-foreground mb-6">Upload Course</h1>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 max-w-lg space-y-4">
        <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Price ($)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
          <div>
            <Label>Level</Label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Course"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default UploadCourse;
