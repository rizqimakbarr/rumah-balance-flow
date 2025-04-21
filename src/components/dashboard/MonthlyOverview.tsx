
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonthlyOverview({
  data, formatCurrency = (value) => `$${value}`, title = "Monthly Overview", gradient = false,
}: {
  data: Array<{ name: string; income: number; expenses: number }>;
  formatCurrency?: (value: number) => string;
  title?: string;
  gradient?: boolean;
}) {
  return (
    <Card className={gradient ? "bg-gradient-to-br from-purple-100 via-white to-slate-100 shadow-2xl rounded-xl border-0" : ""}>
      <CardHeader>
        <CardTitle className="font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20, right: 35, left: 12, bottom: 8,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                style={{ fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                style={{ fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), '']}
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 16,
                  borderColor: "#e5e7eb"
                }}
                labelStyle={{ color: '#9333ea', fontWeight: 700 }}
                itemStyle={{ color: "#333" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#4ADE80"
                strokeWidth={3}
                dot={{ strokeWidth: 2, r: 6, fill: "#fff", stroke: "#34D399" }}
                activeDot={{ r: 10, fill: "#fff", stroke: "#34D399", strokeWidth: 3, filter: "drop-shadow(0 3px 8px #34d39933)" }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#A78BFA"
                strokeWidth={3}
                dot={{ strokeWidth: 2, r: 6, fill: "#fff", stroke: "#8B5CF6" }}
                activeDot={{ r: 10, fill: "#fff", stroke: "#8B5CF6", strokeWidth: 3, filter: "drop-shadow(0 3px 8px #8b5cf644)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
