
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  
  // Fetch savings goals to suggest in the description when "Saving" category is selected
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
      date: format(date, "dd/MM/yyyy"),
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

  const formatAsRupiah = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmount(rawValue);
  };
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    
    // If "Saving" is selected and there are savings goals, show a helper message
    if (value === "Saving" && savingsGoals.length > 0) {
      toast.info(
        "Include a savings goal name in the description to automatically update its progress", 
        { duration: 5000 }
      );
    }
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

            <div className="col-span-3">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {currency === "IDR" ? "Rp" : "$"}
                </div>
                <Input
                  id="amount"
                  value={formatAsRupiah(amount)}
                  onChange={handleAmountChange}
                  className="pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="col-span-1">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="IDR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="col-span-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Saving">Saving</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder={category === "Saving" ? "Include goal name to update progress (e.g. New Car)" : "Enter description"} 
                className="resize-none"
              />
              {category === "Saving" && savingsGoals.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Available goals:</p>
                  <div className="flex flex-wrap gap-1">
                    {savingsGoals.map(goal => (
                      <Badge 
                        key={goal.title} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setDescription(goal.title)}
                      >
                        {goal.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
