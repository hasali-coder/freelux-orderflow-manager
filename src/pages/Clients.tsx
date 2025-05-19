
import React, { useState } from "react";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientCard } from "@/components/clients/ClientCard";
import { useData } from "@/context/DataContext";
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
  const { clients, orders, addClient, updateClient, deleteClient, getOrdersByClientId } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    addClient(clientData);
    setIsAddDialogOpen(false);
    toast({
      title: "Client added",
      description: "New client has been added successfully.",
    });
  };

  const handleUpdateClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (currentClient) {
      updateClient({
        ...currentClient,
        ...clientData,
      });
      setIsEditDialogOpen(false);
      toast({
        title: "Client updated",
        description: "Client information has been updated.",
      });
    }
  };

  const handleDeleteClient = () => {
    if (currentClient) {
      deleteClient(currentClient.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Client deleted",
        description: "Client and associated data have been removed.",
      });
    }
  };

  const handleEditClick = (client: Client) => {
    setCurrentClient(client);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setCurrentClient(client);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information.
          </p>
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
              <DialogDescription>
                Enter the details for your new client.
              </DialogDescription>
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
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No clients found. Add your first client to get started!</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              orders={getOrdersByClientId(client.id)}
              onEditClick={() => handleEditClick(client)}
              onDeleteClick={() => handleDeleteClick(client)}
            />
          ))
        )}
      </div>

      {/* Edit Client Dialog */}
      {currentClient && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update information for {currentClient.name}.
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              onSubmit={handleUpdateClient} 
              initialValues={currentClient} 
              buttonText="Update Client"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentClient?.name} and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
