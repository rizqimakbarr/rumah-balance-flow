
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from "recharts";

export default function MonthlyOverview({
  data, formatCurrency = (value) => `$${value}`, title = "Monthly Overview", gradient = false, rounded = false, modern = false,
}: any) {
  return (
    <Card className={`${rounded ? "rounded-xl overflow-hidden" : ""} ${modern ? "shadow-lg border-0" : ""}`}>
      <CardHeader className={`${gradient ? "bg-gradient-to-br from-background to-muted/30" : ""}`}>
        <CardTitle className="font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.4} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: "#1A1F2C", fontWeight: 500, fontSize: 13 }} 
              axisLine={{ stroke: '#E5E7EB', opacity: 0.4 }}
            />
            <YAxis 
              tick={{ fill: "#6366f1", fontWeight: 500, fontSize: 13 }}
              axisLine={{ stroke: '#E5E7EB', opacity: 0.4 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: 16, 
                background: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", 
                border: "none",
                fontSize: "14px",
              }}
              formatter={formatCurrency} 
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
            />
            <Legend 
              iconType="circle" 
              formatter={(value) => <span style={{ color: '#1A1F2C', fontWeight: 500 }}>{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#colorIncome)" 
              strokeWidth={3}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ec4899" 
              fillOpacity={1}
              fill="url(#colorExpenses)" 
              strokeWidth={3}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
