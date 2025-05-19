// ✅ FILE: src/pages/Clients.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientCard } from "@/components/clients/ClientCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Client } from "@/types";
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

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const { toast } = useToast();

  // Fetch clients from Supabase
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        variant: "destructive",
        title: "Failed to load clients",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new client to Supabase
  const handleAddClient = async (clientData: Omit<Client, "id" | "created_at">) => {
    try {
      console.log("Adding client:", clientData);
      const { error } = await supabase.from("clients").insert([clientData]);

      if (error) throw error;

      toast({
        title: "Client added",
        description: "New client has been added successfully.",
      });
      setIsAddDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        variant: "destructive",
        title: "Add failed",
        description: String(error),
      });
    }
  };

  // Update existing client
  const handleUpdateClient = async (clientData: Omit<Client, "id" | "created_at">) => {
    try {
      if (!currentClient) return;

      console.log("Updating client:", currentClient.id, clientData);

      const { error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", currentClient.id);

      if (error) throw error;

      toast({
        title: "Client updated",
        description: "Client information has been updated.",
      });
      setIsEditDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: String(error),
      });
    }
  };

  // Delete a client
  const handleDeleteClient = async () => {
    try {
      if (!currentClient) return;

      console.log("Deleting client:", currentClient.id);

      const { error } = await supabase.from("clients").delete().eq("id", currentClient.id);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: "Client and their data have been removed.",
      });
      setIsDeleteDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: String(error),
      });
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your clients and their information.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Enter the details for your new client.</DialogDescription>
            </DialogHeader>
            <ClientForm onSubmit={handleAddClient} buttonText="Add Client" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading clients...</p>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No clients found. Add your first client to get started!
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              orders={[]} // Placeholder
              onEditClick={() => {
                setCurrentClient(client);
                setIsEditDialogOpen(true);
              }}
              onDeleteClick={() => {
                setCurrentClient(client);
                setIsDeleteDialogOpen(true);
              }}
            />
          ))
        )}
      </div>

      {currentClient && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update information for {currentClient.name}.</DialogDescription>
            </DialogHeader>
            <ClientForm
              onSubmit={handleUpdateClient}
              initialValues={currentClient}
              buttonText="Update Client"
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentClient?.name} and their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
