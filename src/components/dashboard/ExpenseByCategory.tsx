
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { useState } from "react";

const COLORS = [
  "#9b87f5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#1EAEDB"
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 15}
        outerRadius={outerRadius + 20}
        fill={fill}
      />
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#333" fontWeight="bold" fontSize={16}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#999" fontSize={14}>
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};

export default function ExpenseByCategory({
  data, title = "Expenses by Category", formatCurrency = (value) => `$${value}`, glass = false, rounded = false, modern = false,
}: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = data.reduce((acc: any, cur: any) => acc + cur.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className={`
      ${glass ? "backdrop-blur-sm bg-white/50 dark:bg-black/30 border-0" : ""} 
      ${rounded ? "rounded-xl overflow-hidden" : ""} 
      ${modern ? "shadow-lg" : ""}
    `}>
      <CardHeader className={`${modern ? "bg-gradient-to-br from-background to-muted/30" : ""}`}>
        <CardTitle className="font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value, name) => [formatCurrency(value as number), name]}
                contentStyle={{
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  border: modern ? "none" : "1px solid #eee",
                  padding: "10px 14px",
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              />
              <Legend 
                iconType="circle" 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value, entry) => (
                  <span style={{ color: '#1A1F2C', fontWeight: 500 }}>{value}</span>
                )}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
              >
                {data.map((_: any, i: number) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={modern ? 2 : 1} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
