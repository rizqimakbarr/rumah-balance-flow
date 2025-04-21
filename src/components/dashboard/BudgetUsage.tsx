
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BudgetUsageProps {
  data: Array<{
    name: string;
    budget: number;
    spent: number;
  }>;
  formatCurrency?: (value: number) => string;
  title?: string;
}

export default function BudgetUsage({ 
  data, 
  formatCurrency = (value) => `$${value}`,
  title = "Budget Usage"
}: BudgetUsageProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), '']} 
                  labelStyle={{ color: 'var(--foreground)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    borderColor: 'var(--border)'
                  }}
                />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="hsl(var(--primary))" opacity={0.3} />
                <Bar dataKey="spent" name="Spent" fill="hsl(var(--primary))">
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.spent > entry.budget ? "#f87171" : "#4ade80"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Add progress bars for each category */}
          <div className="space-y-4">
            {data.map((category, index) => {
              const percentage = Math.min(Math.round((category.spent / category.budget) * 100), 100);
              const isOverBudget = category.spent > category.budget;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span className={isOverBudget ? "text-red-500 font-medium" : ""}>
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
