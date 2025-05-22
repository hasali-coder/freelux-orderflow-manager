// src/components/orders/OrderForm.tsx
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  client_id: z.string().uuid("You must select a client"),
  cost: z.number().min(0, "Cost must be at least 0"),
  deadline: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Please pick a valid date"),
  status: z.enum(["pending", "complete", "overdue"]).default("pending"),
  payment_status: z.enum(["unpaid", "partial", "paid"]).default("unpaid"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (values: FormValues) => void;
  initialValues?: Partial<FormValues>;
}

export function OrderForm({ onSubmit, initialValues = {} }: Props) {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name", { ascending: true });
      if (!error && data) setClients(data);
    })();
  }, []);

  return (
    <form className="space-y-4" onSubmit={handleSubmit((vals) => onSubmit(vals))}>
      <div>
        <Label>Title</Label>
        <Input {...register("title")} />
        {errors.title && <p className="text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} />
      </div>

      <div>
        <Label>Client</Label>
        <Controller
          control={control}
          name="client_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.client_id && (
          <p className="text-red-600">{errors.client_id.message}</p>
        )}
      </div>

      <div>
        <Label>Cost</Label>
        <Input
          type="number"
          step="0.01"
          {...register("cost", { valueAsNumber: true })}
        />
        {errors.cost && <p className="text-red-600">{errors.cost.message}</p>}
      </div>

      <div>
        <Label>Deadline</Label>
        <Controller
          control={control}
          name="deadline"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  {field.value
                    ? new Date(field.value).toLocaleDateString()
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(d) => field.onChange(d?.toISOString() as string)}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.deadline && (
          <p className="text-red-600">{errors.deadline.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Payment Status</Label>
          <Controller
            control={control}
            name="payment_status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialValues.id ? "Update Order" : "Add Order"}
      </Button>
    </form>
  );
}
