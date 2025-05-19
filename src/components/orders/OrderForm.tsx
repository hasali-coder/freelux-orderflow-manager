
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, Order, OrderStatus, PaymentStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Helper to make sure deadline is a future date for new orders
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

// Schema with conditional validation for deadline
const createOrderSchema = (isNewOrder: boolean) => {
  return z.object({
    clientId: z.string({
      required_error: "Please select a client",
    }),
    title: z.string().min(2, {
      message: "Title must be at least 2 characters",
    }),
    description: z.string().min(5, {
      message: "Description must be at least 5 characters",
    }),
    deadline: z
      .string()
      .refine(
        (date) => !isNewOrder || new Date(date) >= currentDate,
        {
          message: "Deadline must be in the future for new orders",
        }
      ),
    cost: z.coerce
      .number()
      .min(0, {
        message: "Cost must be a positive number",
      }),
    paymentStatus: z.enum(["paid", "unpaid", "partial"], {
      required_error: "Please select a payment status",
    }),
    status: z.enum(["pending", "complete", "overdue"], {
      required_error: "Please select an order status",
    }),
  });
};

interface OrderFormProps {
  onSubmit: (values: Omit<Order, 'id' | 'createdAt'>) => void;
  initialValues?: Partial<Order>;
  clients: Client[];
  isNewOrder?: boolean;
  buttonText?: string;
}

export function OrderForm({
  onSubmit,
  initialValues = {
    clientId: "",
    title: "",
    description: "",
    deadline: new Date().toISOString().split("T")[0],
    cost: 0,
    paymentStatus: "unpaid" as PaymentStatus,
    status: "pending" as OrderStatus,
  },
  clients,
  isNewOrder = true,
  buttonText = "Save Order",
}: OrderFormProps) {
  const { toast } = useToast();

  // Get the appropriate schema based on whether it's a new order or not
  const orderSchema = createOrderSchema(isNewOrder);
  type OrderFormValues = z.infer<typeof orderSchema>;
  
  // Format deadline for form input
  const formattedDeadline = initialValues.deadline
    ? new Date(initialValues.deadline).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      ...initialValues,
      deadline: formattedDeadline,
    },
  });

  const handleSubmit = (values: OrderFormValues) => {
    try {
      // Ensure deadline is in ISO format
      const formattedValues = {
        ...values,
        deadline: new Date(values.deadline).toISOString(),
      };
      
      onSubmit(formattedValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the order.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Title</FormLabel>
                <FormControl>
                  <Input placeholder="Website Redesign" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Project details, requirements, and notes..."
                  className="resize-none min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include all relevant details about the project scope and requirements.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full md:w-auto">
          {buttonText}
        </Button>
      </form>
    </Form>
  );
}
