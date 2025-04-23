
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import BudgetUsage from "@/components/dashboard/BudgetUsage";

const initialCategories = [
  { name: "Housing", budget: 1500000, color: "#3b82f6", spent: 1200000 },
  { name: "Food", budget: 400000, color: "#10b981", spent: 450000 },
  { name: "Transport", budget: 350000, color: "#f59e0b", spent: 300000 },
  { name: "Utilities", budget: 200000, color: "#8b5cf6", spent: 150000 },
  { name: "Entertainment", budget: 150000, color: "#ec4899", spent: 200000 },
];

export default function Budget() {
  const [budgetCategories, setBudgetCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState({ name: "", budget: "" });

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.budget) {
      const budget = parseInt(newCategory.budget);
      if (isNaN(budget) || budget <= 0) {
        toast.error("Budget amount must be a positive number");
        return;
      }

      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      setBudgetCategories([...budgetCategories, { 
        name: newCategory.name, 
        budget: budget, 
        color: randomColor,
        spent: 0
      }]);
      setNewCategory({ name: "", budget: "" });
      toast.success(`Added budget for ${newCategory.name}`);
    } else {
      toast.error("Please provide both category name and budget amount");
    }
  };

  const handleUpdateBudget = (index: number, newBudget: string) => {
    const budget = parseInt(newBudget);
    if (!isNaN(budget) && budget > 0) {
      const updatedCategories = [...budgetCategories];
      updatedCategories[index] = { ...updatedCategories[index], budget };
      setBudgetCategories(updatedCategories);
    }
  };

  const handleDeleteCategory = (index: number) => {
    const updatedCategories = [...budgetCategories];
    updatedCategories.splice(index, 1);
    setBudgetCategories(updatedCategories);
    toast.success("Category removed");
  };

  return (
    <Dashboard>
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-br from-background to-muted/30">
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>View and manage your monthly budget allocations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <BudgetUsage
              data={budgetCategories}
              formatCurrency={formatRupiah}
              title=""
            />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-br from-background to-muted/30">
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Manage your budget categories and allocations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              {budgetCategories.map((category, index) => {
                const percentage = (category.spent / category.budget) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>{category.name}</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={category.budget}
                          onChange={(e) => handleUpdateBudget(index, e.target.value)}
                          className="w-32 text-right"
                          type="number"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={isOverBudget ? "bg-red-200" : ""}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Spent: {formatRupiah(category.spent)}</span>
                      <span className={isOverBudget ? "text-red-500 font-medium" : ""}>
                        {isOverBudget ? "Over budget: " : "Remaining: "}
                        {isOverBudget 
                          ? formatRupiah(category.spent - category.budget)
                          : formatRupiah(category.budget - category.spent)
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-[1fr,auto] gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        placeholder="e.g. Groceries"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget-amount">Budget Amount</Label>
                      <Input
                        id="budget-amount"
                        value={newCategory.budget}
                        onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                        placeholder="e.g. 500000"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCategory} className="mb-px gap-1">
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
