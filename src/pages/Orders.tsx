// src/pages/Orders.tsx
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { OrderCard, OrderWithClient } from "@/components/orders/OrderCard";
import { OrderForm } from "@/components/orders/OrderForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get("client") || "";  // ← our client ID from the URL
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderWithClient | null>(null);
  const { toast } = useToast();

  /** Fetch every order, joined to its client.name */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          client:clients(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((o: any) => {
        const arr = o.client as { id: string; name: string }[] | null;
        return {
          ...o,
          client: Array.isArray(arr) && arr.length > 0
            ? arr[0]
            : { id: "", name: "Unknown" },
        } as OrderWithClient;
      });

      setOrders(formatted);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not load orders",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // … your existing add / update / delete / mark‐paid handlers (unchanged) …

  /** 1) filter by client ID from the URL, 2) then by free-text search */
  const filtered = useMemo(() => {
    let list = orders;

    if (clientFilter) {
      list = list.filter((o) => o.client_id === clientFilter);
    }

    const t = searchTerm.trim().toLowerCase();
    if (t) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(t) ||
          o.title.toLowerCase().includes(t) ||
          o.client.name.toLowerCase().includes(t)
      );
    }

    return list;
  }, [orders, clientFilter, searchTerm]);

  return (
    <div className="space-y-6 animate-in">
      {/* — Header: title, search, add dialog — */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            className="max-w-xs"
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>+ Add Order</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
              </DialogHeader>
              <OrderForm onSubmit={async (vals) => {
                const { error } = await supabase.from("orders").insert([vals]);
                if (error) throw error;
                setIsAddOpen(false);
                fetchOrders();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* — Body: loading / empty / 3-column card grid — */}
      {loading ? (
        <p>Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p>No orders match.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onEdit={() => { setCurrentOrder(o); setIsEditOpen(true); }}
              onDelete={() => { setCurrentOrder(o); setIsDeleteOpen(true); }}
              onUpdatePayment={() => /* your markPaid handler */ null}
            />
          ))}
        </div>
      )}

      {/* — Edit Modal — */}
      {currentOrder && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            <OrderForm
              initialValues={currentOrder}
              onSubmit={async (vals) => {
                await supabase
                  .from("orders")
                  .update(vals)
                  .eq("id", currentOrder.id);
                setIsEditOpen(false);
                fetchOrders();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* — Delete Confirmation — */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!currentOrder) return;
              await supabase
                .from("orders")
                .delete()
                .eq("id", currentOrder.id);
              setIsDeleteOpen(false);
              fetchOrders();
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
