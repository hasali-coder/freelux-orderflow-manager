
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ClientCardProps {
  client: Client;
  orders: Order[];
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ClientCard({ client, orders, onEditClick, onDeleteClick }: ClientCardProps) {
  const totalSpent = orders.reduce((sum, order) => {
    if (order.paymentStatus === 'paid') {
      return sum + order.cost;
    } else if (order.paymentStatus === 'partial') {
      return sum + (order.cost / 2); // Estimate 50% for partial
    }
    return sum;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const completedOrders = orders.filter(order => order.status === 'complete').length;
  const overdueOrders = orders.filter(order => order.status === 'overdue').length;

  return (
    <Card className="hover-card card-glow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{client.name}</CardTitle>
            <CardDescription className="mt-1">
              Client since {new Date(client.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEditClick}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDeleteClick}>
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Email:</span>
              <p className="text-sm">{client.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Phone:</span>
              <p className="text-sm">{client.phone}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Preferred Payment:</span>
              <p className="text-sm">{client.preferredPaymentMethod}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Revenue:</span>
              <p className="text-sm font-medium">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Projects:</span>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{orders.length} Total</Badge>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                  {completedOrders} Completed
                </Badge>
                {overdueOrders > 0 && (
                  <Badge variant="destructive">
                    {overdueOrders} Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground">Notes:</span>
            <p className="text-sm mt-1">{client.notes}</p>
          </div>
        )}
        {orders.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Recent Orders</span>
              <Link to={`/orders?client=${client.id}`} className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-1">
              {orders.slice(0, 2).map((order) => (
                <Link 
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-secondary"
                >
                  <span className="text-sm">{order.title}</span>
                  <Badge variant={
                    order.status === 'complete' 
                      ? 'outline'
                      : order.status === 'overdue'
                      ? 'destructive'
                      : 'secondary'
                  }>
                    {order.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
