import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expense, ExpenseCategory } from "@/types";
import { format } from "date-fns";

interface ExpenseCardProps {
  expense: Expense;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ExpenseCard({
  expense,
  onEditClick,
  onDeleteClick,
}: ExpenseCardProps) {
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);

  const labels: Record<ExpenseCategory,string> = {
    tools: "Tools & Software",
    communication: "Communication",
    utilities: "Utilities",
    supplies: "Supplies",
    travel: "Travel",
    other: "Other",
  };

  const colors: Record<ExpenseCategory,string> = {
    tools: "bg-blue-50 text-blue-800",
    communication: "bg-purple-50 text-purple-800",
    utilities: "bg-yellow-50 text-yellow-800",
    supplies: "bg-green-50 text-green-800",
    travel: "bg-orange-50 text-orange-800",
    other: "bg-gray-50 text-gray-800",
  };

  return (
    <Card className="hover-card card-glow">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-lg">{expense.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={colors[expense.category]}>
                {labels[expense.category]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(expense.date), "PPP")}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            {fmtCurrency(expense.amount)}
          </div>
        </div>
        {expense.notes && (
          <p className="mt-3 text-sm text-muted-foreground">
            {expense.notes}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onEditClick}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDeleteClick}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
