// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { BarChart2, DollarSign, Plus, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OrderStatusChart } from "@/components/dashboard/OrderStatusChart";
import { TopClientsCard } from "@/components/dashboard/TopClientsCard";
import { OverdueOrdersCard } from "@/components/dashboard/OverdueOrdersCard";
import { supabase } from "@/lib/supabaseClient";

type MonthlyDatum = { month: string; revenue: number; expenses: number };
type ClientDatum = { clientId: string; clientName: string; revenue: number };
type StatusDatum = { status: "pending" | "complete" | "overdue"; count: number };
type OrderWithClient = {
  id: string;
  title: string;
  cost: number;
  deadline: string;
  client: { name: string };
};

export default function Dashboard() {
  const [monthlyData, setMonthlyData] = useState<MonthlyDatum[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [topClients, setTopClients] = useState<ClientDatum[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusDatum[]>([]);
  const [overdueOrders, setOverdueOrders] = useState<OrderWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
        const end = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString();
        const today = new Date().toISOString();

        const [{ data: revData }, { data: expData }] = await Promise.all([
          supabase
            .from("orders")
            .select("created_at, cost")
            .eq("payment_status", "paid")
            .gte("created_at", start)
            .lte("created_at", end),
          supabase
            .from("expenses")
            .select("created_at, amount")
            .gte("created_at", start)
            .lte("created_at", end),
        ]);

        const monthMap: Record<string, MonthlyDatum> = {};
        for (let m = 0; m < 12; m++) {
          const label = new Date(0, m).toLocaleString("en-KE", { month: "short" });
          monthMap[label] = { month: label, revenue: 0, expenses: 0 };
        }

        revData?.forEach((o) => {
          const m = new Date(o.created_at).toLocaleString("en-KE", { month: "short" });
          monthMap[m].revenue += o.cost;
        });

        expData?.forEach((e) => {
          const m = new Date(e.created_at).toLocaleString("en-KE", { month: "short" });
          monthMap[m].expenses += e.amount;
        });

        const months = Object.values(monthMap);
        setMonthlyData(months);
        setTotalRevenue(months.reduce((acc, m) => acc + m.revenue, 0));
        setTotalExpenses(months.reduce((acc, m) => acc + m.expenses, 0));
        setNetProfit(months.reduce((acc, m) => acc + m.revenue - m.expenses, 0));

        const { data: allOrders } = await supabase
          .from("orders")
          .select("client_id, cost")
          .eq("payment_status", "paid")
          .gte("created_at", start)
          .lte("created_at", end);

        const clientMap: Record<string, number> = {};
        allOrders?.forEach((o) => {
          clientMap[o.client_id] = (clientMap[o.client_id] || 0) + o.cost;
        });

        const sortedClients = Object.entries(clientMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const { data: clientNames } = await supabase
          .from("clients")
          .select("id, name")
          .in("id", sortedClients.map(([id]) => id));

        const nameMap = Object.fromEntries((clientNames || []).map((c) => [c.id, c.name]));

        setTopClients(
          sortedClients.map(([id, revenue]) => ({
            clientId: id,
            clientName: nameMap[id] || "Unknown",
            revenue,
          }))
        );

        const { data: clients } = await supabase.from("clients").select("id");
        setTotalClients(clients?.length || 0);

        const { data: statuses } = await supabase
          .from("orders")
          .select("status")
          .gte("created_at", start)
          .lte("created_at", end);

        const statusCount: Record<string, number> = {};
        statuses?.forEach((o) => {
          statusCount[o.status] = (statusCount[o.status] || 0) + 1;
        });

        setStatusBreakdown(
          Object.entries(statusCount).map(([status, count]) => ({
            status: status as StatusDatum["status"],
            count,
          }))
        );

        const { data: overdue } = await supabase
          .from("orders")
          .select("id, title, client_id, cost, deadline")
          .lt("deadline", today)
          .order("deadline", { ascending: true });

        const overdueClientIds = overdue?.map((o) => o.client_id).filter(Boolean);
        const { data: overdueNames } = await supabase
          .from("clients")
          .select("id, name")
          .in("id", overdueClientIds || []);

        const overdueNameMap = Object.fromEntries(
          (overdueNames || []).map((c) => [c.id, c.name])
        );

        setOverdueOrders(
          (overdue || []).map((o) => ({
            id: o.id,
            title: o.title,
            cost: o.cost,
            deadline: o.deadline,
            client: { name: overdueNameMap[o.client_id] || "Unknown Client" },
          }))
        );
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of this fiscal year.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Paid Revenue" value={fmt(totalRevenue)} description="Based on received payments" icon={<DollarSign className="w-6 h-6" />} />
        <StatCard title="Total Expenses" value={fmt(totalExpenses)} description="Year-to-date expenses" icon={<Wallet className="w-6 h-6" />} />
        <StatCard title="Net Profit" value={fmt(netProfit)} description="Revenue minus expenses" icon={<BarChart2 className="w-6 h-6" />} className={netProfit < 0 ? "border-destructive/50" : ""} />
        <StatCard title="Total Clients" value={totalClients} description="Registered in the system" icon={<Plus className="w-6 h-6" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RevenueChart data={monthlyData} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TopClientsCard clients={topClients} />
        <OrderStatusChart data={statusBreakdown} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <OverdueOrdersCard orders={overdueOrders} />
      </div>
    </div>
  );
}
