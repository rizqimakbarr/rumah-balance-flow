import { useState, useEffect } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Budget() {
  const { user } = useAuth();
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", budget: "", color: "#6366f1" });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase.from("budget_categories").select("*").eq("user_id", user.id).then(({ data }) => {
      setBudgetCategories(data || []);
      setLoading(false);
    });
  }, [user]);

  const handleAddCategory = async () => {
    if (!form.name || !form.budget) {
      toast.error("Please provide name and budget.");
      return;
    }
    const budget = parseInt(form.budget);
    if (isNaN(budget) || budget <= 0) {
      toast.error("Budget must be positive number");
      return;
    }
    const { error, data } = await supabase.from("budget_categories").insert([
      {
        user_id: user.id,
        name: form.name,
        budget: budget,
        color: form.color,
      },
    ]);
    if (error) toast.error(error.message);
    else {
      setBudgetCategories([...budgetCategories, { ...form, budget, color: form.color }]);
      setModalOpen(false);
      setForm({ name: "", budget: "", color: "#6366f1" });
      toast.success("Category added.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('budget_categories').delete().eq('id', id);
    if (!error) setBudgetCategories(budgetCategories.filter((c: any) => c.id !== id));
    toast.success("Category deleted.");
  };

  const handleUpdateBudget = async (id: string, newBudget: string) => {
    const budget = parseInt(newBudget);
    if (isNaN(budget) || budget <= 0) {
      toast.error("Budget must be positive number");
      return;
    }
    const { error } = await supabase.from('budget_categories').update({ budget }).eq('id', id);
    if (!error) setBudgetCategories(budgetCategories.map((c: any) => c.id === id ? { ...c, budget } : c));
    toast.success("Budget updated.");
  };

  const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <Dashboard>
      <div>
        <Card>
          <CardHeader className="bg-gradient-to-br from-background to-muted/30">
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Track and manage your budget allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Budget Category</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Groceries"
                    />
                    <Label htmlFor="budget-amount">Budget Amount</Label>
                    <Input
                      id="budget-amount"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      placeholder="e.g. 500000"
                      type="number"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="w-full mt-4">
                    Add
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-white dark:bg-background">
              <table className="min-w-full text-sm table-auto">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Budget</th>
                    <th className="px-4 py-3 text-right">Spent</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {budgetCategories.map((category: any) => (
                    <tr key={category.id} className="">
                      <td className="px-4 py-2 font-medium">{category.name}</td>
                      <td className="px-4 py-2 text-right">
                        <Input
                          type="number"
                          value={category.budget}
                          onChange={(e) => handleUpdateBudget(category.id, e.target.value)}
                          className="w-28 bg-muted"
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {formatRupiah(category.spent || 0)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {budgetCategories.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No categories yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
