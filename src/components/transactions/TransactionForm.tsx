
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { AmountInput } from "./form/AmountInput";
import { TransactionDatePicker } from "./form/TransactionDatePicker";
import { CategorySelect } from "./form/CategorySelect";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: any) => void;
  editData?: any;
}

export default function TransactionForm({ open, onOpenChange, onAddTransaction, editData }: TransactionFormProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);

  useEffect(() => {
    if (user && open && category === "Saving") {
      supabase.from('savings_goals')
        .select('title')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setSavingsGoals(data);
          }
        });
    }
  }, [user, category, open]);

  useEffect(() => {
    if (editData) {
      setDate(new Date(editData.date.split("/").reverse().join("-")));
      setAmount(editData.amount.toString());
      setType(editData.type);
      setCategory(editData.category);
      setDescription(editData.description || "");
      setCurrency(editData.currency || "IDR");
    } else {
      resetForm();
    }
  }, [editData, open]);

  const handleSubmit = () => {
    if (!amount || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTransaction = {
      id: editData?.id || Date.now().toString(),
      date: date,
      amount: parseFloat(amount),
      type,
      category,
      description,
      currency
    };

    onAddTransaction(newTransaction);
  };

  const resetForm = () => {
    setDate(new Date());
    setAmount("");
    setType("expense");
    setCategory("");
    setDescription("");
    setCurrency("IDR");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              <AmountInput
                amount={amount}
                currency={currency}
                onAmountChange={setAmount}
                onCurrencyChange={setCurrency}
              />
            </div>

            <TransactionDatePicker date={date} onDateChange={setDate} />

            <CategorySelect
              category={category}
              onCategoryChange={setCategory}
              savingsGoals={savingsGoals}
              onSavingsGoalClick={(title) => setDescription(title)}
            />

            <div className="col-span-4">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder={category === "Saving" ? "Include goal name to update progress (e.g. New Car)" : "Enter description"} 
                className="resize-none"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{editData ? "Update" : "Add"} Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
