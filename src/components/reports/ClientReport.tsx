
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Order } from "@/types";

interface ClientReportProps {
  clients: Client[];
  orders: Order[];
}

export function ClientReport({ clients, orders }: ClientReportProps) {
  // Calculate metrics for each client
  const clientStats = clients.map(client => {
    const clientOrders = orders.filter(order => order.clientId === client.id);
    const totalOrders = clientOrders.length;
    const totalRevenue = clientOrders.reduce((sum, order) => sum + order.cost, 0);
    const completedOrders = clientOrders.filter(order => order.status === "complete").length;
    const pendingOrders = clientOrders.filter(order => order.status === "pending").length;
    const overdueOrders = clientOrders.filter(order => order.status === "overdue").length;
    
    return {
      ...client,
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      overdueOrders
    };
  });

  // Sort clients by total revenue (highest first)
  const sortedClients = [...clientStats].sort((a, b) => b.totalRevenue - a.totalRevenue);

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
          <CardTitle>Client Report</CardTitle>
          <CardDescription>
            Overview of all clients and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead className="text-right">Complete</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-right">{client.totalOrders}</TableCell>
                  <TableCell className="text-right">{client.completedOrders}</TableCell>
                  <TableCell className="text-right">{client.pendingOrders}</TableCell>
                  <TableCell className="text-right">{client.overdueOrders}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(client.totalRevenue)}
                  </TableCell>
                </TableRow>
              ))}
              {sortedClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No client data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
