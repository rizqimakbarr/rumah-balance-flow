
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1",
];

export default function ExpenseByCategory({
  data, title = "Expenses by Category", formatCurrency = (value) => `$${value}`, glass = false,
}: any) {
  const total = data.reduce((acc: any, cur: any) => acc + cur.value, 0);
  return (
    <Card className={glass ? "glass-morphism shadow-2xl border-0" : ""}>
      <CardHeader>
        <CardTitle className="font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 110;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      style={{ fontSize: 14, fill: "#374151", fontWeight: "bold" }}
                    >
                      {`${data[index].name} ${(percent * 100).toFixed(1)}%`}
                    </text>
                  );
                }}
              >
                {data.map((entry: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatCurrency}
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "16px",
                  border: "1px solid #eee"
                }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
