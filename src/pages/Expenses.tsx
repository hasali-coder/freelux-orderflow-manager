// src/pages/Expenses.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Expense, ExpenseCategory } from "@/types";

// ✏️ NEW: bring in your icons
import { Plus, Search } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const { toast } = useToast();

  /** Load all expenses */
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<Expense>("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Load failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /** Handlers */
  const handleAdd = async (vals: Omit<Expense, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("expenses").insert([vals]);
      if (error) throw error;
      toast({ title: "Expense added" });
      setIsAddOpen(false);
      await fetchExpenses();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Add failed", description: err.message });
    }
  };

  const handleUpdate = async (vals: Omit<Expense, "created_at">) => {
    if (!editExpense) return;
    try {
      const { error } = await supabase
        .from("expenses")
        .update(vals)
        .eq("id", editExpense.id);
      if (error) throw error;
      toast({ title: "Expense updated" });
      setEditExpense(null);
      await fetchExpenses();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteExpense) return;
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", deleteExpense.id);
      if (error) throw error;
      toast({ title: "Expense deleted" });
      setDeleteExpense(null);
      await fetchExpenses();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    }
  };

  /** Filtering */
  const filtered = expenses.filter((e) => {
    const matchText =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchText && matchCategory;
  });

  /** Pie‐chart data */
  const byCategory = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});
  const pieData = Object.entries(byCategory).map(([category, amount]) => ({ category, amount }));
  const COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#F97316", "#6B7280"];
  const categoryLabels: Record<ExpenseCategory, string> = {
    tools: "Tools & Software",
    communication: "Communication",
    utilities: "Utilities",
    supplies: "Supplies",
    travel: "Travel",
    other: "Other",
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Header + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your business expenses.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80 w-full bg-card p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Expenses by Category</h2>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ category, amount }) =>
                `${categoryLabels[category as ExpenseCategory] || category}: ${amount.toLocaleString("en-KE", {
                  style: "currency",
                  currency: "KES",
                })}`
              }
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString("en-KE", { style: "currency", currency: "KES" })
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as ExpenseCategory | "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([cat, label]) => (
              <SelectItem key={cat} value={cat}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">No expenses found.</p>
        ) : (
          filtered.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEditClick={() => setEditExpense(exp)}
              onDeleteClick={() => setDeleteExpense(exp)}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <span /> {/* no-op */}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSubmit={handleAdd} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editExpense && (
        <Dialog open onOpenChange={() => setEditExpense(null)}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm initialValues={editExpense} onSubmit={handleUpdate} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {deleteExpense && (
        <AlertDialog open onOpenChange={() => setDeleteExpense(null)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      )}
    </div>
  );
}
