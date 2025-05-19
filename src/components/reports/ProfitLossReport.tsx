
import { useState } from "react";
import { startOfYear, endOfYear, format, parseISO, eachMonthOfInterval } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order, Expense } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ProfitLossReportProps {
  orders: Order[];
  expenses: Expense[];
}

export function ProfitLossReport({ orders, expenses }: ProfitLossReportProps) {
  const [dateFrom, setDateFrom] = useState<Date>(startOfYear(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfYear(new Date()));

  // Filter orders and expenses based on date range
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.createdAt);
    return orderDate >= dateFrom && orderDate <= dateTo;
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return expenseDate >= dateFrom && expenseDate <= dateTo;
  });

  // Calculate totals
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.cost, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Calculate monthly data for the chart
  const months = eachMonthOfInterval({
    start: dateFrom,
    end: dateTo
  });

  const monthlyData = months.map(month => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const monthlyRevenue = filteredOrders
      .filter(order => {
        const date = parseISO(order.createdAt);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, order) => sum + order.cost, 0);
      
    const monthlyExpenses = filteredExpenses
      .filter(expense => {
        const date = parseISO(expense.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: format(month, "MMM"),
      revenue: monthlyRevenue,
      expenses: monthlyExpenses,
      profit: monthlyRevenue - monthlyExpenses
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Report</CardTitle>
          <CardDescription>
            Financial overview of your business within the selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateFrom, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateTo, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className={cn("hover-card card-glow", netProfit >= 0 ? "border-green-500/20" : "border-red-500/20")}>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalRevenue)}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="hover-card card-glow border-amber-500/20">
              <CardHeader className="pb-2">
                <CardDescription>Total Expenses</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalExpenses)}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className={cn("hover-card card-glow", netProfit >= 0 ? "border-green-500/20" : "border-red-500/20")}>
              <CardHeader className="pb-2">
                <CardDescription>Net Profit</CardDescription>
                <CardTitle className={cn("text-2xl", netProfit < 0 ? "text-destructive" : "")}>
                  {formatCurrency(netProfit)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('en-US', { 
                        notation: 'compact',
                        compactDisplay: 'short',
                        currency: 'USD', 
                        style: 'currency',
                      }).format(value)
                    } 
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar name="Revenue" dataKey="revenue" fill="#3b82f6" />
                  <Bar name="Expenses" dataKey="expenses" fill="#f97316" />
                  <Bar name="Profit" dataKey="profit" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly breakdown table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{month.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.expenses)}</TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      month.profit < 0 ? "text-destructive" : ""
                    )}>
                      {formatCurrency(month.profit)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Summary row */}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalRevenue)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalExpenses)}</TableCell>
                  <TableCell className={cn(
                    "text-right font-bold",
                    netProfit < 0 ? "text-destructive" : ""
                  )}>
                    {formatCurrency(netProfit)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
