
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientReport } from "@/components/reports/ClientReport";
import { OrderReport } from "@/components/reports/OrderReport";
import { ExpenseReport } from "@/components/reports/ExpenseReport";
import { ProfitLossReport } from "@/components/reports/ProfitLossReport";
import { useData } from "@/context/DataContext";
import { FileText, FileExcel, FilePdf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Reports() {
  const { clients, orders, expenses } = useData();
  const [activeTab, setActiveTab] = useState("clients");

  const handleExport = (format: "pdf" | "excel") => {
    const reportType = activeTab === "clients" ? "Client" : 
      activeTab === "orders" ? "Order" : 
      activeTab === "expenses" ? "Expense" : "Profit & Loss";

    toast.success(`${reportType} report exported!`, {
      description: `Your report was exported as ${format.toUpperCase()}`
    });
  };

  const handlePrint = () => {
    toast.success("Print-ready view opened", {
      description: "Print dialog will open in a new window"
    });
    // In a real app, we would open a print-friendly version here
    window.print();
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export reports for your business
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => handleExport("pdf")}
          >
            <FilePdf className="h-4 w-4" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => handleExport("excel")}
          >
            <FileExcel className="h-4 w-4" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handlePrint}
          >
            <FileText className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="clients" 
        onValueChange={(value) => setActiveTab(value)}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
        </TabsList>
        <TabsContent value="clients" className="space-y-4">
          <ClientReport clients={clients} orders={orders} />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <OrderReport orders={orders} clients={clients} />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <ExpenseReport expenses={expenses} />
        </TabsContent>
        <TabsContent value="profit-loss" className="space-y-4">
          <ProfitLossReport orders={orders} expenses={expenses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
