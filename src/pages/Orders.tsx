// src/pages/Orders.tsx
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OrderCard, OrderWithClient } from "@/components/orders/OrderCard";
import { OrderForm } from "@/components/orders/OrderForm";
import { Input } from "@/components/ui/input";      // <-- import Input
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

  // new!
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderWithClient | null>(null);

  const { toast } = useToast();

  /** Fetch all orders + client-name */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, client:clients(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const formatted = (data || []).map((o) => {
        const arr = o.client as { name: string }[] | null;
        const client = Array.isArray(arr) && arr.length > 0
          ? arr[0]
          : { name: "Unknown" };
        return { ...o, client } as OrderWithClient;
      });
      setOrders(formatted);
    } catch (err: any) {
      console.error(err);
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

  /** Handle add / update / delete… (omitted for brevity) */

  // new! memoized filtered list
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((o) => {
      return (
        o.id.toLowerCase().includes(term) ||
        o.title.toLowerCase().includes(term) ||
        o.client.name.toLowerCase().includes(term)
      );
    });
  }, [orders, searchTerm]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Orders</h1>

        <div className="flex gap-2">
          {/* Search box */}
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            className="max-w-xs"
          />

          {/* Add-order trigger */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>+ Add Order</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
              </DialogHeader>
              <OrderForm onSubmit={async (vals) => {
                await supabase.from("orders").insert([vals]);
                setIsAddOpen(false);
                fetchOrders();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading
        ? <p>Loading orders…</p>
        : filteredOrders.length === 0
          ? <p>No orders match “{searchTerm}”.</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onEdit={() => { setCurrentOrder(o); setIsEditOpen(true); }}
                  onDelete={() => { setCurrentOrder(o); setIsDeleteOpen(true); }}
                  onUpdatePayment={() => console.log("…")}
                />
              ))}
            </div>
          )
      }

      {/* …your Edit / Delete dialogs here… */}
    </div>
  );
}
