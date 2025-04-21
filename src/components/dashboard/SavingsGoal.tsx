
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SavingsGoalProps {
  title: string;
  current: number;
  target: number;
  dueDate?: string;
}

export default function SavingsGoal({ 
  title, 
  current, 
  target,
  dueDate
}: SavingsGoalProps) {
  const progress = Math.round((current / target) * 100);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold">${current.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">of ${target.toLocaleString()}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          <span className="text-xs">{progress}% complete</span>
          {dueDate && (
            <span className="text-xs text-muted-foreground">Due {dueDate}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
