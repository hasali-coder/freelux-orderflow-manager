
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expense, ExpenseCategory } from "@/types";

interface ExpenseCardProps {
  expense: Expense;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ExpenseCard({ expense, onEditClick, onDeleteClick }: ExpenseCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const categoryLabels: Record<ExpenseCategory, string> = {
    tools: 'Tools & Software',
    communication: 'Communication',
    utilities: 'Utilities',
    supplies: 'Supplies',
    travel: 'Travel',
    other: 'Other',
  };

  const categoryColors: Record<ExpenseCategory, string> = {
    tools: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    communication: 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    utilities: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    supplies: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    travel: 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    other: 'bg-gray-50 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };

  return (
    <Card className="hover-card card-glow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{expense.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={categoryColors[expense.category]}>
                {categoryLabels[expense.category]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(expense.date)}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            {formatCurrency(expense.amount)}
          </div>
        </div>
        
        {expense.notes && (
          <div className="mt-4 text-sm">
            <p className="text-muted-foreground">{expense.notes}</p>
          </div>
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
