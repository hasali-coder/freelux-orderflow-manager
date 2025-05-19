
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderStatus, PaymentStatus, Client } from "@/types";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface OrderFormProps {
  onSubmit: (data: Omit<Order, 'id' | 'createdAt'>) => void;
  initialValues?: Order;
  clients: Client[];
  isNewOrder?: boolean;
  buttonText: string;
}

export function OrderForm({ 
  onSubmit, 
  initialValues, 
  clients,
  isNewOrder = true,
  buttonText 
}: OrderFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [clientId, setClientId] = useState(initialValues?.clientId || (clients.length > 0 ? clients[0].id : ""));
  const [cost, setCost] = useState(initialValues?.cost?.toString() || "");
  const [deadline, setDeadline] = useState<Date>(
    initialValues?.deadline ? new Date(initialValues.deadline) : new Date()
  );
  const [status, setStatus] = useState<OrderStatus>(initialValues?.status || "pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialValues?.paymentStatus || "unpaid");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title for the order.");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description for the order.");
      return;
    }

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!cost || isNaN(parseFloat(cost)) || parseFloat(cost) <= 0) {
      setError("Please enter a valid cost greater than 0.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      clientId, 
      cost: parseFloat(cost),
      deadline: deadline.toISOString(),
      status,
      paymentStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm font-medium text-destructive">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Website Redesign"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the details of this order..."
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.length > 0 ? (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-clients" disabled>
                No clients available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cost">Cost</Label>
        <Input
          id="cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="e.g., 1000.00"
          type="number"
          step="0.01"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Deadline</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !deadline && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={(date) => date && setDeadline(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {!isNewOrder && (
        <>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select 
              value={paymentStatus} 
              onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      <Button type="submit" className="w-full">{buttonText}</Button>
    </form>
  );
}
