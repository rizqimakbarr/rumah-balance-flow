import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CategorySelectProps {
  category: string;
  onCategoryChange: (value: string) => void;
  savingsGoals?: { title: string }[];
  onSavingsGoalClick?: (title: string) => void;
}

export function CategorySelect({ 
  category, 
  onCategoryChange, 
  savingsGoals,
  onSavingsGoalClick 
}: CategorySelectProps) {
  const { user } = useAuth();
  const [budgetCategories, setBudgetCategories] = useState<{id: string, name: string}[]>([]);
  
  // Default categories as fallback
  const defaultCategories = [
    "Housing", "Food", "Transport", "Utilities", 
    "Entertainment", "Saving", "Salary", "Other"
  ];
  
  useEffect(() => {
    if (user) {
      supabase.from("budget_categories")
        .select("id, name")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setBudgetCategories(data);
          }
        });
    }
  }, [user]);
  
  return (
    <div className="col-span-2">
      <Label htmlFor="category">Category</Label>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger id="category">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {/* Show budget categories if available */}
          {budgetCategories.length > 0 ? (
            budgetCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))
          ) : (
            // Fallback to default categories
            defaultCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))
          )}
          {/* Always include these basic categories */}
          <SelectItem value="Salary">Salary</SelectItem>
          <SelectItem value="Saving">Saving</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      {category === "Saving" && savingsGoals && savingsGoals.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Available goals:</p>
          <div className="flex flex-wrap gap-1">
            {savingsGoals.map(goal => (
              <Badge 
                key={goal.title} 
                variant="outline" 
                className="cursor-pointer hover:bg-accent"
                onClick={() => onSavingsGoalClick?.(goal.title)}
              >
                {goal.title}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
