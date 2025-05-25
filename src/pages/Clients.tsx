import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientCard } from "@/components/clients/ClientCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ClientWithOrders } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDel, setIsDel] = useState(false);
  const [current, setCurrent] = useState<ClientWithOrders | null>(null);
  const { toast } = useToast();

  /** Fetch clients *and* their orders in one go */
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          orders:orders(id,title,cost,deadline,status,payment_status,created_at)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data as ClientWithOrders[]);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not load clients",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Add / update / delete all re-call fetchClients()

  const handleAdd = async (vals: any) => {
    try {
      const { error } = await supabase.from("clients").insert([vals]);
      if (error) throw error;
      toast({ title: "Client added" });
      setIsAdd(false);
      await fetchClients();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Add failed", description: err.message });
    }
  };

  const handleUpdate = async (vals: any) => {
    if (!current) return;
    try {
      const { error } = await supabase
        .from("clients")
        .update(vals)
        .eq("id", current.id);
      if (error) throw error;
      toast({ title: "Client updated" });
      setIsEdit(false);
      await fetchClients();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      const { error } = await supabase.from("clients").delete().eq("id", current.id);
      if (error) throw error;
      toast({ title: "Client deleted" });
      setIsDel(false);
      await fetchClients();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header + Add */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your clients and their data.</p>
        </div>
        <Dialog open={isAdd} onOpenChange={setIsAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Fill in client details below.</DialogDescription>
            </DialogHeader>
            <ClientForm onSubmit={handleAdd} buttonText="Add Client" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading clients…</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No clients found.
          </p>
        ) : (
          filtered.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              orders={c.orders}
              onEditClick={() => { setCurrent(c); setIsEdit(true); }}
              onDeleteClick={() => { setCurrent(c); setIsDel(true); }}
            />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {current && (
        <Dialog open={isEdit} onOpenChange={setIsEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update {current.name}</DialogDescription>
            </DialogHeader>
            <ClientForm
              onSubmit={handleUpdate}
              initialValues={current}
              buttonText="Update Client"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Alert */}
      <AlertDialog open={isDel} onOpenChange={setIsDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {current?.name} and all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
