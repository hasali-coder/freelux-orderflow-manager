
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
import { Expense, ExpenseCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

const expenseSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.coerce.number().min(0.01, {
    message: "Amount must be greater than 0.",
  }),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Please enter a valid date.",
  }),
  category: z.enum(["tools", "communication", "utilities", "supplies", "travel", "other"], {
    required_error: "Please select a category.",
  }),
  notes: z.string().optional(),
});

interface ExpenseFormProps {
  onSubmit: (values: Omit<Expense, 'id'>) => void;
  initialValues?: Partial<Expense>;
  buttonText?: string;
}

export function ExpenseForm({
  onSubmit,
  initialValues = {
    title: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "other" as ExpenseCategory,
    notes: "",
  },
  buttonText = "Save Expense",
}: ExpenseFormProps) {
  const { toast } = useToast();

  // Format date for form input
  const formattedDate = initialValues.date
    ? new Date(initialValues.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      ...initialValues,
      date: formattedDate,
    },
  });

  const handleSubmit = (values: z.infer<typeof expenseSchema>) => {
    try {
      // Format date to ISO
      const formattedValues = {
        ...values,
        date: new Date(values.date).toISOString(),
      };
      
      onSubmit(formattedValues);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the expense.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Title</FormLabel>
                <FormControl>
                  <Input placeholder="Adobe Subscription" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tools">Tools & Software</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about this expense..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include any relevant details about this expense.
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
