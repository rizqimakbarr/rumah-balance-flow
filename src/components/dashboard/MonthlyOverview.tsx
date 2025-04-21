import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function MonthlyOverview({
  data, formatCurrency = (value) => `$${value}`, title = "Monthly Overview", gradient = false, rounded = false, modern = false,
}: any) {
  return (
    <Card className={`${gradient ? "bg-gradient-to-br from-indigo-100 via-white to-blue-50" : ""} ${rounded ? "rounded-2xl" : ""} ${modern ? "shadow-lg" : ""}`}>
      <CardHeader>
        <CardTitle className="font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="monthly-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#1EAEDB" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 8" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: "#1A1F2C", fontWeight: 500, fontSize: 16 }} />
            <YAxis tick={{ fill: "#6366f1", fontWeight: 400 }} />
            <Tooltip contentStyle={{ borderRadius: 16, background: "#fff" }} formatter={formatCurrency} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="url(#monthly-gradient)" strokeWidth={3} dot={{ r: 6, fill: "#9b87f5" }} />
            <Line type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={3} dot={{ r: 6, fill: "#ec4899" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
