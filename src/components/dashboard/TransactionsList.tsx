
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TransactionsListProps {
  transactions: any[];
  formatCurrency?: (value: number) => string;
  title?: string;
  viewAllLabel?: string;
  onEdit?: (transaction: any) => void;
  onDelete?: (id: string) => void;
  enableActions?: boolean;
}

export default function TransactionsList({
  transactions,
  formatCurrency = (value) => `$${value}`,
  title = "Recent Transactions",
  viewAllLabel = "View All",
  onEdit,
  onDelete,
  enableActions = false,
}: TransactionsListProps) {
  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-br from-background to-muted/30">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        {viewAllLabel && (
          <Button variant="outline" size="sm">
            {viewAllLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="text-left">Description</TableHead>
                <TableHead className="text-left">Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {enableActions ? <TableHead className="w-[150px]">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction: any) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{transaction.date}</TableCell>
                  <TableCell className="text-left">{transaction.description}</TableCell>
                  <TableCell className="text-left">
                    <Badge variant="outline" className="font-medium">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  {enableActions ? (
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => onEdit && onEdit(transaction)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete && onDelete(transaction.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
