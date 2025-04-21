
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SavingsGoalProps {
  title: string;
  current: number;
  target: number;
  dueDate?: string;
  formatCurrency?: (value: number) => string;
}

export default function SavingsGoal({ 
  title, 
  current, 
  target, 
  dueDate,
  formatCurrency = (value) => `$${value}` 
}: SavingsGoalProps) {
  const percentage = Math.round((current / target) * 100);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {dueDate && <span className="text-xs text-muted-foreground">Due: {dueDate}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Current</p>
              <p className="font-medium">{formatCurrency(current)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Target</p>
              <p className="font-medium">{formatCurrency(target)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
