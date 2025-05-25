// ─ src/components/expenses/ExpenseForm.tsx ─────────────

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Expense, ExpenseCategory } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0.01, "Amount must be > 0"),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Must pick a valid date"),
  category: z.enum([
    "tools",
    "communication",
    "utilities",
    "supplies",
    "travel",
    "other",
  ]) as any as z.ZodType<ExpenseCategory>,
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initialValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  buttonText: string;
}

export function ExpenseForm({ initialValues = {}, onSubmit, buttonText }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues as any,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((vals) => onSubmit(vals))}
    >
      <div>
        <Label>Title</Label>
        <Input {...register("title")} />
        {errors.title && <p className="text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-red-600">{errors.amount.message}</p>}
      </div>

      <div>
        <Label>Date</Label>
        <Input type="date" {...register("date")} />
        {errors.date && <p className="text-red-600">{errors.date.message}</p>}
      </div>

      <div>
        <Label>Category</Label>
        <Select
          {...register("category")}
          defaultValue={initialValues.category}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tools">Tools &amp; Software</SelectItem>
            <SelectItem value="communication">Communication</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea {...register("notes")} />
      </div>

      <Button type="submit" className="w-full">
        {buttonText}
      </Button>
    </form>
  );
}
