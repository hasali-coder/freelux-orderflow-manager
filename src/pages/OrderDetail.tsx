
import { useParams, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/DataContext";
import { Order, Client, PaymentStatus } from "@/types";
import { OrderPaymentModal } from "@/components/orders/OrderPaymentModal";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { orders, clients, getClientById, updateOrder } = useData();
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        const relatedClient = getClientById(foundOrder.clientId);
        if (relatedClient) {
          setClient(relatedClient);
        }
      } else {
        toast({
          title: "Order not found",
          description: "The order you're looking for doesn't exist.",
          variant: "destructive"
        });
      }
    }
  }, [id, orders, getClientById, toast]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM d, yyyy");
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

  const handlePaymentComplete = (order: Order, amountPaid: number) => {
    const totalPaidNow = (order.amountPaid || 0) + amountPaid;
    const newPaymentStatus: PaymentStatus = totalPaidNow >= order.cost ? 'paid' : 'partial';
    
    const updatedOrder = {
      ...order,
      paymentStatus: newPaymentStatus,
      amountPaid: totalPaidNow
    };
    
    updateOrder(updatedOrder);
    setOrder(updatedOrder);
  };

  const getPaymentPercentage = () => {
    if (!order.amountPaid) return 0;
    return Math.round((order.amountPaid / order.cost) * 1000) / 10;
  };

  const paymentPercentage = getPaymentPercentage();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{order.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                  {order.status}
                </Badge>
                <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} className="capitalize">
                  {order.paymentStatus}
                  {order.paymentStatus === 'partial' && order.amountPaid && (
                    <span className="ml-1">({paymentPercentage}%)</span>
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
                  <p className="text-base">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Deadline</h3>
                  <p className="text-base">{formatDate(order.deadline)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cost</h3>
                  <p className="text-xl font-bold">{formatCurrency(order.cost)}</p>
                </div>
                {order.amountPaid !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amount Paid</h3>
                    <p className="text-xl font-bold">{formatCurrency(order.amountPaid)}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p>{order.description}</p>
                </div>
              </div>

              {order.paymentStatus !== 'paid' && (
                <div className="pt-4">
                  <Button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full"
                    variant="default"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            {client ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-base font-medium">{client.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{client.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-base">{client.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                  <p className="text-base">{client.preferredPaymentMethod}</p>
                </div>
                <Separator />
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/clients/${client.id}`}>View Client Profile</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Client information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>

      {order && (
        <OrderPaymentModal
          order={order}
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
