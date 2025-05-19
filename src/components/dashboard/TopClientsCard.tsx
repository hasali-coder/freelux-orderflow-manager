
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopClient {
  clientId: string;
  clientName: string;
  revenue: number;
}

interface TopClientsCardProps {
  clients: TopClient[];
}

export function TopClientsCard({ clients }: TopClientsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card className="col-span-2 hover-card card-glow">
      <CardHeader>
        <CardTitle>Top Clients</CardTitle>
        <CardDescription>Your most valuable clients by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No client data available
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.clientId}>
                  <TableCell>{client.clientName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(client.revenue)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
