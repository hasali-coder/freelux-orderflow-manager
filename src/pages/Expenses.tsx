
import React, { useState } from "react";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Expense, ExpenseCategory } from "@/types";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const { toast } = useToast();

  const filteredExpenses = expenses.filter((expense) => {
    // Text search
    const matchesSearch = 
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    addExpense(expenseData);
    setIsAddDialogOpen(false);
    toast({
      title: "Expense added",
      description: "New expense has been added successfully.",
    });
  };

  const handleUpdateExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (currentExpense) {
      updateExpense({
        ...currentExpense,
        ...expenseData,
      });
      setIsEditDialogOpen(false);
      toast({
        title: "Expense updated",
        description: "Expense has been updated successfully.",
      });
    }
  };

  const handleDeleteExpense = () => {
    if (currentExpense) {
      deleteExpense(currentExpense.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Expense deleted",
        description: "Expense has been deleted successfully.",
      });
    }
  };

  const handleEditClick = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Format for PieChart
  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
  }));

  const categoryLabels: Record<string, string> = {
    tools: 'Tools & Software',
    communication: 'Communication',
    utilities: 'Utilities',
    supplies: 'Supplies',
    travel: 'Travel',
    other: 'Other',
  };

  const COLORS = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#10B981', // green
    '#F97316', // orange
    '#6B7280', // gray
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your business expenses.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details for your new expense.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm onSubmit={handleAddExpense} buttonText="Add Expense" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 hover-card card-glow">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              Breakdown of your expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="category"
                    label={({ category, amount }) => `${categoryLabels[category] || category}: ${formatCurrency(amount)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    labelFormatter={(category) => categoryLabels[category as string] || category}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-center font-semibold">
                Total: {formatCurrency(totalExpenses)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sm:ml-auto">
              <Select 
                value={categoryFilter || ""} 
                onValueChange={(val) => setCategoryFilter(val || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="tools">Tools & Software</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expenses found. Add your first expense to start tracking!</p>
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEditClick={() => handleEditClick(expense)}
                  onDeleteClick={() => handleDeleteClick(expense)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Expense Dialog */}
      {currentExpense && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>
                Update information for {currentExpense.title}.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm 
              onSubmit={handleUpdateExpense} 
              initialValues={currentExpense} 
              buttonText="Update Expense"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
