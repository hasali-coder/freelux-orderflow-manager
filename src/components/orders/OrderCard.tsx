
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { formatDistanceToNow, isPast } from "date-fns";

interface OrderCardProps {
  order: Order;
  clientName: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function OrderCard({ order, clientName, onEditClick, onDeleteClick }: OrderCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'complete':
        return 'outline';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const deadlineDate = new Date(order.deadline);
  const isDeadlinePast = isPast(deadlineDate);
  const deadlineFormatted = formatDistanceToNow(deadlineDate, { addSuffix: true });

  return (
    <Card className="hover-card card-glow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Client: {clientName}</p>
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
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
              {order.status}
            </Badge>
            <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} className="capitalize">
              {order.paymentStatus}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deadline</p>
              <p className={`text-sm ${isDeadlinePast && order.status !== 'complete' ? 'text-destructive' : ''}`}>
                {deadlineFormatted}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-sm font-medium">{formatCurrency(order.cost)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm mt-1 line-clamp-3">{order.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
