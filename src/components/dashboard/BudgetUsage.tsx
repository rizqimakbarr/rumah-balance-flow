
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
}

export default function BudgetUsage({ data }: BudgetUsageProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Budget Usage</CardTitle>
      </CardHeader>
      <CardContent>
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
                formatter={(value) => [`$${value}`, '']} 
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
                    fill={entry.spent > entry.budget ? "#f87171" : "hsl(var(--primary))"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
