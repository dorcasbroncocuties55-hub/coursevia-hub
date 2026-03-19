import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const LearnerWishlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase.from("wishlists").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems(data || []);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const removeItem = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    toast.success("Removed from wishlist");
    fetchWishlist();
  };

  return (
    <DashboardLayout role="learner">
      <h1 className="text-2xl font-bold text-foreground mb-6">Wishlist</h1>
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground capitalize">{item.content_type}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.content_id}</p>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
export default LearnerWishlist;
