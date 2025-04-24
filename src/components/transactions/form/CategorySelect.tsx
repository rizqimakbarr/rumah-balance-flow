
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="col-span-2">
      <Label htmlFor="category">Category</Label>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger id="category">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Housing">Housing</SelectItem>
          <SelectItem value="Food">Food</SelectItem>
          <SelectItem value="Transport">Transport</SelectItem>
          <SelectItem value="Utilities">Utilities</SelectItem>
          <SelectItem value="Entertainment">Entertainment</SelectItem>
          <SelectItem value="Saving">Saving</SelectItem>
          <SelectItem value="Salary">Salary</SelectItem>
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
