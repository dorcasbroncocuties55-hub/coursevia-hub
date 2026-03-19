import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState("");

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  };
  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("categories").insert({ name: newName.trim(), slug });
    if (error) toast.error(error.message);
    else { toast.success("Category added"); setNewName(""); fetchCategories(); }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Category removed");
    fetchCategories();
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Categories</h1>
      <div className="flex gap-2 mb-6 max-w-md">
        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New category name" onKeyDown={e => e.key === "Enter" && addCategory()} />
        <Button onClick={addCategory}><Plus size={16} /></Button>
      </div>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm text-foreground">{c.name}</span>
            <button onClick={() => deleteCategory(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};
export default AdminCategories;
