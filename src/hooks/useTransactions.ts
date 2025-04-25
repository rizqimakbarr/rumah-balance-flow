
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
      
      // Fix the date handling to ensure we have a proper ISO string
      if (tx.date instanceof Date) {
        formattedDate = tx.date.toISOString();
      } else if (typeof tx.date === 'string') {
        // If it's already a string, make sure it's a valid date before converting
        try {
          formattedDate = new Date(tx.date).toISOString();
        } catch {
          formattedDate = new Date().toISOString();
        }
      } else {
        // If date is undefined or something else, use current date
        formattedDate = new Date().toISOString();
      }

      const transactionData = {
        ...tx,
        user_id: userId,
        date: formattedDate,
      };
      
      // Remove the client-side generated ID from the data sent to Supabase
      if ('id' in tx && typeof tx.id === 'string' && !isUUID(tx.id)) {
        // If the ID is not a valid UUID, remove it before insertion
        const { id, ...dataWithoutId } = transactionData;
        
        const { error } = await supabase
          .from('transactions')
          .insert([dataWithoutId]);
          
        if (error) throw error;
        toast.success("Transaction added successfully");
      } else if ('id' in tx && isUUID(tx.id)) {
        // If it's a valid UUID, this is an update
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', tx.id);
          
        if (error) throw error;
        toast.success("Transaction updated successfully");
      } else {
        // No ID or non-string ID, just insert without it
        const { id, ...dataWithoutId } = transactionData;
        
        const { error } = await supabase
          .from('transactions')
          .insert([dataWithoutId]);
          
        if (error) throw error;
        toast.success("Transaction added successfully");
      }
      
      if (tx.category.toLowerCase().includes('saving')) {
        await updateSavingsGoals(tx);
      }
      
      fetchTransactions();
    } catch (error: any) {
      toast.error("Failed to save transaction: " + error.message);
      console.error("Transaction error:", error);
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

  // Helper function to check if a string is a valid UUID
  const isUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  return {
    transactions,
    isLoading,
    fetchTransactions,
    handleAddOrUpdate,
    handleDelete
  };
};
