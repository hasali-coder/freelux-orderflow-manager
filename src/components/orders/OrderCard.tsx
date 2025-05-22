// src/components/orders/OrderCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { OrderWithClient } from "./OrderCard";

interface OrderCardProps {
  order: OrderWithClient;
  onEdit: () => void;
  onDelete: () => void;
  onUpdatePayment?: () => void;
}

export function OrderCard({
  order,
  onEdit,
  onDelete,
  onUpdatePayment,
}: OrderCardProps) {
  const clientName = order.client?.name || "Unknown";

  return (
    <Card className="relative hover-card card-glow">
      {/* PAID ribbon */}
      {order.payment_status === "paid" && (
        <div
          className={`
            absolute top-0 right-0
            transform translate-x-1/2 -translate-y-1/2 -rotate-45
            bg-green-600 text-white text-xs font-semibold
            px-3 py-1
            shadow-md
          `}
        >
          PAID
        </div>
      )}

      <CardHeader className="pb-2">
        <p className="text-xs text-muted-foreground">
          Order ID: {order.id}
        </p>
        <CardTitle className="mt-1">{order.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Client: {clientName}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status & Payment Badges */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">{order.status}</Badge>
          {order.payment_status !== "paid" && (
            <Badge
              variant={
                order.payment_status === "partial"
                  ? "secondary"
                  : "destructive"
              }
            >
              {order.payment_status === "partial"
                ? `Partial`
                : "Unpaid"}
            </Badge>
          )}
        </div>

        {/* Deadline & Amount */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              Deadline:
            </span>{" "}
            {formatDistanceToNow(new Date(order.deadline), {
              addSuffix: true,
            })}
          </div>
          <div className="font-medium">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(order.cost)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
          {onUpdatePayment && order.payment_status !== "paid" && (
            <Button variant="secondary" size="sm" onClick={onUpdatePayment}>
              Update Payment
            </Button>
          )}
        </div>

        {/* View Order */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() =>
            window.open(`/orders/${order.id}`, "_blank")
          }
        >
          View Order
        </Button>
      </CardContent>
    </Card>
  );
}
