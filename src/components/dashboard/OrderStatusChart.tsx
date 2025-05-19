
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { OrderStatus } from "@/types";

interface StatusItem {
  status: OrderStatus;
  count: number;
}

interface OrderStatusChartProps {
  data: StatusItem[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const COLORS = {
    pending: 'hsl(var(--primary))',
    complete: 'hsl(142 71% 45%)',
    overdue: 'hsl(var(--destructive))'
  };

  const LABELS = {
    pending: 'Pending',
    complete: 'Complete',
    overdue: 'Overdue'
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="hover-card card-glow">
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Current status of all orders</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="count"
              label={({ status, count }) => `${LABELS[status]}: ${count}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} orders`, '']}
              labelFormatter={(_, data) => {
                const entry = data[0].payload;
                return `Status: ${LABELS[entry.status]}`;
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          {data.map((item) => (
            <div key={item.status} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[item.status] }}
              />
              <span className="text-sm">{LABELS[item.status]} ({Math.round((item.count / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
