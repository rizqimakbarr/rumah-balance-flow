
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = [
  "#9b87f5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#1EAEDB"
];

export default function ExpenseByCategory({
  data, title = "Expenses by Category", formatCurrency = (value) => `$${value}`, glass = false, rounded = false, modern = false,
}: any) {
  const total = data.reduce((acc: any, cur: any) => acc + cur.value, 0);

  // Modern gradients config
  const gradientId = "pie-gradient";
  return (
    <Card className={`${glass ? "glass-morphism shadow-2xl border-0" : ""} ${rounded ? "rounded-2xl" : ""} ${modern ? "p-2" : ""}`}>
      <CardHeader>
        <CardTitle className="font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#9b87f5" />
                  <stop offset="100%" stopColor="#1EAEDB" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={modern ? 70 : 60}
                outerRadius={modern ? 110 : 100}
                paddingAngle={6}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = (outerRadius as number) + 16;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      style={{
                        fontSize: 15,
                        fill: "#221F26",
                        fontWeight: "bold",
                        textShadow: "0 1px 4px rgba(0,0,0,.08)"
                      }}
                    >
                      {`${data[index].name} ${(percent * 100).toFixed(1)}%`}
                    </text>
                  );
                }}
                className={modern ? "drop-shadow-lg" : ""}
              >
                {data.map((entry: any, i: number) => (
                  <Cell key={i} fill={modern ? `url(#${gradientId})` : COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatCurrency}
                contentStyle={{
                  background: modern ? "#F1F0FB" : "rgba(255,255,255,0.95)",
                  borderRadius: "18px",
                  border: modern ? "1px solid #9b87f5" : "1px solid #eee"
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
