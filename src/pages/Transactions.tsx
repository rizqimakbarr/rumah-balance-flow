
import { useEffect, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import TransactionsList from "@/components/dashboard/TransactionsList";
import TransactionForm from "@/components/transactions/TransactionForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns"; // Make sure to import format from date-fns

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setTransactions(data || []);
    } catch (error: any) {
      toast.error("Failed to load transactions: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    const handleOpenModal = () => {
      setShowForm(true);
      setEditData(null);
    };
    document.addEventListener("open-transaction-modal", handleOpenModal);
    return () => document.removeEventListener("open-transaction-modal", handleOpenModal);
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const handleAddOrUpdate = async (tx: any) => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    try {
      const transactionData = {
        ...tx,
        user_id: user.id,
        date: format(new Date(tx.date.split('/').reverse().join('-')), 'yyyy-MM-dd'), // Convert to ISO-compatible string format
      };
      
      if (editData) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', tx.id);
          
        if (error) throw error;
        toast.success("Transaction updated successfully");
      } else {
        const { id, ...newTx } = transactionData;
        const { error } = await supabase
          .from('transactions')
          .insert([newTx]);
          
        if (error) throw error;
        toast.success("Transaction added successfully");
      }
      
      if (tx.category.toLowerCase().includes('saving')) {
        await updateSavingsGoals(tx);
      }
      
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setShowForm(false);
      setEditData(null);
    }
  };

  const updateSavingsGoals = async (transaction: any) => {
    if (!user) return;
    
    try {
      const { data: goals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (!goals || goals.length === 0) return;
      
      const txDescription = transaction.description.toLowerCase();
      
      for (const goal of goals) {
        if (txDescription.includes(goal.title.toLowerCase())) {
          const newAmount = transaction.type === 'income' 
            ? goal.current_amount + transaction.amount
            : Math.max(0, goal.current_amount - transaction.amount);
          
          const { error: updateError } = await supabase
            .from('savings_goals')
            .update({ current_amount: newAmount, updated_at: new Date() })
            .eq('id', goal.id);
            
          if (updateError) throw updateError;
          toast.success(`Updated savings goal: ${goal.title}`);
        }
      }
    } catch (error: any) {
      toast.error("Failed to update savings goals: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("Transaction deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete transaction: " + error.message);
    }
  };

  return (
    <Dashboard>
      <div className="w-full">
        <TransactionsList
          transactions={transactions}
          formatCurrency={formatRupiah}
          title="All Transactions"
          viewAllLabel=""
          onEdit={tx => { setEditData(tx); setShowForm(true); }}
          onDelete={handleDelete}
          enableActions
        />
      </div>
      {showForm && (
        <TransactionForm
          open={showForm}
          onOpenChange={setShowForm}
          onAddTransaction={handleAddOrUpdate}
          editData={editData}
        />
      )}
    </Dashboard>
  );
}
