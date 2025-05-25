// src/components/clients/ClientCard.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Client, Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface ClientCardProps {
  client: Client;
  orders: Order[];
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const getFlagEmoji = (countryName: string | null | undefined) => {
  if (!countryName) return "";
  const code = countryName
    .toUpperCase()
    .slice(0, 2)
    .replace(/[^A-Z]/g, "");
  return code
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

export function ClientCard({
  client,
  orders,
  onEditClick,
  onDeleteClick,
}: ClientCardProps) {
  const totalSpent = orders.reduce((sum, o) => {
    if (o.payment_status === "paid") return sum + o.cost;
    if (o.payment_status === "partial") return sum + o.cost / 2;
    return sum;
  }, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(value);

  const completedOrders = orders.filter((o) => o.status === "complete")
    .length;
  const overdueOrders = orders.filter((o) => o.status === "overdue")
    .length;

  return (
    <Card className="hover-card card-glow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{client.name}</CardTitle>
            <CardDescription className="mt-1">
              Client since {new Date(client.created_at).toLocaleDateString()}
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
              <span className="text-sm font-medium text-muted-foreground">
                Email:
              </span>
              <p className="text-sm">{client.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Phone:
              </span>
              <p className="text-sm">{client.phone}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Preferred Payment:
              </span>
              <p className="text-sm">{client.preferred_payment_method}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Country:
              </span>
              <p className="text-sm">
                {getFlagEmoji(client.country)} {client.country}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Rating:
              </span>
              <p className="flex gap-1 text-yellow-500">
                {[...Array(client.rating ?? 0)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Total Revenue:
              </span>
              <p className="text-sm font-medium">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Projects:
              </span>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{orders.length} Total</Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/20"
                >
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
            <span className="text-sm font-medium text-muted-foreground">
              Notes:
            </span>
            <p className="text-sm mt-1">{client.notes}</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Recent Orders</span>
              <Link
                to={`/orders?client=${client.id}`}
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-1">
              {orders.slice(0, 2).map((o) => (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-secondary"
                >
                  <span className="text-sm">{o.title}</span>
                  <Badge
                    variant={
                      o.status === "complete"
                        ? "outline"
                        : o.status === "overdue"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {o.status}
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
