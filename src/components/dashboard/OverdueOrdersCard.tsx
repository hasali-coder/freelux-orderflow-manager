
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";

interface OverdueOrdersCardProps {
  orders: Order[];
  clientNames: Record<string, string>;
}

export function OverdueOrdersCard({ orders, clientNames }: OverdueOrdersCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card className="col-span-3 hover-card card-glow border-destructive/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Overdue Orders</CardTitle>
          <Badge variant="destructive" className="capitalize">Action Required</Badge>
        </div>
        <CardDescription>Orders that have passed their deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No overdue orders - Great work!
                </TableCell>
              </TableRow>
            ) : (
              orders.slice(0, 5).map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link to={`/orders/${order.id}`} className="font-medium hover:underline">
                      {order.title}
                    </Link>
                  </TableCell>
                  <TableCell>{clientNames[order.clientId] || 'Unknown Client'}</TableCell>
                  <TableCell className="text-destructive">
                    {formatDistanceToNow(new Date(order.deadline), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.cost)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {orders.length > 5 && (
          <div className="mt-4 text-center">
            <Link 
              to="/orders?status=overdue" 
              className="text-sm text-primary hover:underline"
            >
              View all {orders.length} overdue orders
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
