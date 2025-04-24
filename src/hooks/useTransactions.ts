
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTransactions = (userId: string | undefined) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!userId) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
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

  const updateSavingsGoals = async (transaction: any) => {
    if (!userId) return;
    
    try {
      const { data: goals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId);
        
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
            .update({ 
              current_amount: newAmount, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', goal.id);
            
          if (updateError) throw updateError;
          toast.success(`Updated savings goal: ${goal.title}`);
        }
      }
    } catch (error: any) {
      toast.error("Failed to update savings goals: " + error.message);
    }
  };

  const handleAddOrUpdate = async (tx: any) => {
    if (!userId) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    try {
      let formattedDate: string;
      
      if (tx.date instanceof Date) {
        formattedDate = tx.date.toISOString();
      } else if (typeof tx.date === 'string') {
        try {
          formattedDate = new Date(tx.date).toISOString();
        } catch {
          formattedDate = new Date().toISOString();
        }
      } else {
        formattedDate = new Date().toISOString();
      }

      const transactionData = {
        ...tx,
        user_id: userId,
        date: formattedDate,
      };
      
      if ('id' in tx) {
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

  return {
    transactions,
    isLoading,
    fetchTransactions,
    handleAddOrUpdate,
    handleDelete
  };
};

