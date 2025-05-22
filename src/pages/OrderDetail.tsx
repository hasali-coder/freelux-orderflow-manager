// src/pages/OrderDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface OrderWithClient {
  id: string;
  title: string;
  description: string | null;
  client_id: string;
  client: { name: string } | null;
  cost: number;
  deadline: string;
  status: "pending" | "complete" | "overdue";
  payment_status: "unpaid" | "partial" | "paid";
  created_at: string;
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`*, client:clients(name)`)
          .eq("id", id)
          .single();

        if (error) throw error;

        setOrder({
          ...data,
          client: Array.isArray(data.client) ? data.client[0] : data.client,
        });
      } catch (err: any) {
        console.error("Error loading order:", err);
        toast({
          variant: "destructive",
          title: "Failed to load order",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleComplete = async () => {
    if (!order) return;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "complete" })
        .eq("id", order.id);
      if (error) throw error;
      toast({ title: "Order marked as complete" });
      setOrder({ ...order, status: "complete" });
    } catch (err: any) {
      console.error("Error completing order:", err);
      toast({
        variant: "destructive",
        title: "Could not complete order",
        description: err.message,
      });
    }
  };

  if (loading) return <p>Loading order…</p>;
  if (!order) return <p>Order not found.</p>;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(value);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.title}</h1>
          <p className="text-sm text-muted-foreground">
            {order.client?.name ?? "Unknown"} • <code>{order.id}</code>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">Payment Status:</span>{" "}
            {order.payment_status[0].toUpperCase() + order.payment_status.slice(1)}
          </p>
        </div>
        {order.status !== "complete" && (
          <Button onClick={handleComplete} variant="outline">
            Complete Order
          </Button>
        )}
      </header>

      <hr />

      {/* Body */}
      {order.description && (
        <p className="whitespace-pre-wrap">{order.description}</p>
      )}

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground border-t pt-4 gap-4">
        <span>
          <span className="font-medium">Deadline:</span>{" "}
          {format(new Date(order.deadline), "MMMM d, yyyy")}
        </span>
        <span>
          <span className="font-medium">Cost:</span> {formatCurrency(order.cost)}
        </span>
      </footer>
    </div>
  );
}
