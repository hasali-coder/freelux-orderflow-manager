
import { BarChart2, DollarSign, Plus, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OrderStatusChart } from "@/components/dashboard/OrderStatusChart";
import { TopClientsCard } from "@/components/dashboard/TopClientsCard";
import { OverdueOrdersCard } from "@/components/dashboard/OverdueOrdersCard";
import { useData } from "@/context/DataContext";

export default function Dashboard() {
  const { 
    clients, 
    orders, 
    getTotalRevenue, 
    getTotalExpenses,
    getMonthlyData,
    getTopClients,
    getOrderStatusBreakdown,
    getOrdersByStatus
  } = useData();

  const totalRevenue = getTotalRevenue();
  const totalExpenses = getTotalExpenses();
  const netProfit = totalRevenue - totalExpenses;
  const overdueOrders = getOrdersByStatus('overdue');

  const clientNames = clients.reduce((acc, client) => {
    acc[client.id] = client.name;
    return acc;
  }, {} as Record<string, string>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your freelance business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="Total earned from all orders"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          description="Total business expenses"
          icon={<Wallet className="w-6 h-6" />}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          description="Revenue minus expenses"
          icon={<BarChart2 className="w-6 h-6" />}
          className={netProfit < 0 ? "border-destructive/50" : ""}
        />
        <StatCard
          title="Active Clients"
          value={clients.length}
          description={`With ${orders.length} total orders`}
          icon={<Plus className="w-6 h-6" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RevenueChart data={getMonthlyData()} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TopClientsCard clients={getTopClients()} />
        <OrderStatusChart data={getOrderStatusBreakdown()} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <OverdueOrdersCard orders={overdueOrders} clientNames={clientNames} />
      </div>
    </div>
  );
}
