
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderCard } from "@/components/orders/OrderCard";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Order, OrderStatus } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isPast } from "date-fns";

export default function Orders() {
  const { orders, clients, addOrder, updateOrder, deleteOrder } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(searchParams.get("status"));
  const [clientFilter, setClientFilter] = useState<string | null>(searchParams.get("client"));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  // Update orders that are past deadline but not marked as overdue
  useEffect(() => {
    const currentDate = new Date();
    orders.forEach(order => {
      if (order.status === 'pending' && isPast(new Date(order.deadline)) && new Date(order.deadline) < currentDate) {
        updateOrder({
          ...order,
          status: 'overdue'
        });
      }
    });
  }, [orders, updateOrder]);

  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (clientFilter) params.set("client", clientFilter);
    setSearchParams(params);
  }, [statusFilter, clientFilter, setSearchParams]);

  const filteredOrders = orders.filter((order) => {
    // Text search
    const matchesSearch = 
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    // Client filter
    const matchesClient = !clientFilter || order.clientId === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const handleAddOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    addOrder(orderData);
    setIsAddDialogOpen(false);
    toast({
      title: "Order added",
      description: "New order has been added successfully.",
    });
  };

  const handleUpdateOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    if (currentOrder) {
      updateOrder({
        ...currentOrder,
        ...orderData,
      });
      setIsEditDialogOpen(false);
      toast({
        title: "Order updated",
        description: "Order has been updated successfully.",
      });
    }
  };

  const handleDeleteOrder = () => {
    if (currentOrder) {
      deleteOrder(currentOrder.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Order deleted",
        description: "Order has been deleted successfully.",
      });
    }
  };

  const handleEditClick = (order: Order) => {
    setCurrentOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setCurrentOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Create a lookup for client names
  const clientNames: Record<string, string> = {};
  clients.forEach(client => {
    clientNames[client.id] = client.name;
  });

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage your client orders and projects.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>
                Enter the details for your new order.
              </DialogDescription>
            </DialogHeader>
            <OrderForm 
              onSubmit={handleAddOrder} 
              clients={clients}
              buttonText="Add Order" 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
          <Select 
            value={statusFilter || "all-statuses"} 
            onValueChange={(val) => setStatusFilter(val === "all-statuses" ? null : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={clientFilter || "all-clients"} 
            onValueChange={(val) => setClientFilter(val === "all-clients" ? null : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-clients">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No orders found. Add your first order to get started!</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              clientName={clientNames[order.clientId] || "Unknown Client"}
              onEditClick={() => handleEditClick(order)}
              onDeleteClick={() => handleDeleteClick(order)}
            />
          ))
        )}
      </div>

      {/* Edit Order Dialog */}
      {currentOrder && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
              <DialogDescription>
                Update information for {currentOrder.title}.
              </DialogDescription>
            </DialogHeader>
            <OrderForm 
              onSubmit={handleUpdateOrder} 
              initialValues={currentOrder} 
              clients={clients}
              isNewOrder={false}
              buttonText="Update Order"
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
              This will permanently delete this order.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
