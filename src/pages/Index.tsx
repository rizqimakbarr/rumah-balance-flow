import { useEffect, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import StatsCard from "@/components/dashboard/StatsCard";
import ExpenseByCategory from "@/components/dashboard/ExpenseByCategory";
import MonthlyOverview from "@/components/dashboard/MonthlyOverview";
import SavingsGoal from "@/components/dashboard/SavingsGoal";
import BudgetUsage from "@/components/dashboard/BudgetUsage";
import TransactionsList from "@/components/dashboard/TransactionsList";
import TransactionForm from "@/components/transactions/TransactionForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SavingsGoalType {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  due_date?: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalType[]>([]);
  const [editTransactionData, setEditTransactionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });
          
        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("budget_categories")
          .select("*")
          .eq("user_id", user.id);
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        const { data: savingsData, error: savingsError } = await supabase
          .from("savings_goals")
          .select("*")
          .eq("user_id", user.id);
          
        if (savingsError) throw savingsError;
        setSavingsGoals(savingsData || []);
        
        generateMonthlyData(transactionsData || []);
      } catch (error: any) {
        toast.error("Failed to load dashboard data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const generateMonthlyData = (transactionsData: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyStats: any[] = [];
    
    months.forEach((month, index) => {
      const monthNum = index + 1;
      const monthTransactions = transactionsData.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === index;
      });
      
      const income = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const expenses = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      monthlyStats.push({ name: month, income, expenses });
    });
    
    setMonthlyData(monthlyStats);
  };

  useEffect(() => {
    const handleOpenModal = () => {
      setShowTransactionModal(true);
      setEditTransactionData(null);
    };
    document.addEventListener("open-transaction-modal", handleOpenModal);
    return () => document.removeEventListener("open-transaction-modal", handleOpenModal);
  }, []);

  const financialSummary = transactions.reduce(
    (summary, transaction) => {
      const currentMonth = new Date().getMonth();
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth(); 
      
      if (transactionMonth === currentMonth) {
        if (transaction.type === "income") {
          summary.income += transaction.amount;
        } else {
          summary.expenses += transaction.amount;
        }
      }
      
      if (transaction.type === "income") {
        summary.totalBalance += transaction.amount;
      } else {
        summary.totalBalance -= transaction.amount;
      }
      
      return summary;
    },
    { totalBalance: 0, income: 0, expenses: 0 }
  );

  const savingsRate = financialSummary.income > 0 
    ? ((financialSummary.income - financialSummary.expenses) / financialSummary.income * 100).toFixed(1)
    : "0.0";

  const categoryChartData = categories.map(cat => {
    const categoryTransactions = transactions.filter(
      t => t.type === "expense" && t.category === cat.name
    );
    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { ...cat, value: totalSpent };
  });

  const budgetData = categories.map(cat => {
    const categoryTransactions = transactions.filter(
      t => t.type === "expense" && t.category === cat.name
    );
    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, budget: cat.budget, spent: totalSpent };
  });

  const handleAddTransaction = async (tx: any) => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    try {
      const transactionData = {
        ...tx,
        user_id: user.id,
        date: new Date(tx.date.split('/').reverse().join('-')),
      };
      
      if (editTransactionData) {
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
      
      if (user) {
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });
          
        setTransactions(data || []);
        generateMonthlyData(data || []);
      }
    } catch (error: any) {
      toast.error("Failed to save transaction: " + error.message);
    } finally {
      setShowTransactionModal(false);
      setEditTransactionData(null);
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
          
          const { data: refreshedGoals } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('user_id', user.id);
            
          if (refreshedGoals) {
            setSavingsGoals(refreshedGoals);
          }
        }
      }
    } catch (error: any) {
      toast.error("Failed to update savings goals: " + error.message);
    }
  };

  const handleEditTransaction = (tx: any) => {
    setEditTransactionData(tx);
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
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

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <Dashboard>
      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Balance"
            value={formatRupiah(financialSummary.totalBalance)}
            helperText="As of today"
            icon="balance"
          />
          <StatsCard
            title="Monthly Income"
            value={formatRupiah(financialSummary.income)}
            helperText="This month"
            icon="income"
          />
          <StatsCard
            title="Monthly Expenses"
            value={formatRupiah(financialSummary.expenses)}
            helperText="This month"
            icon="expense"
          />
          <StatsCard
            title="Savings Rate"
            value={`${savingsRate}%`}
            helperText="Of monthly income"
            icon="savings"
          />

          <div className="md:col-span-2">
            <MonthlyOverview 
              data={monthlyData}
              formatCurrency={formatRupiah}
              title="Monthly Overview"
              gradient
              rounded
              modern
            />
          </div>

          <div className="md:col-span-2">
            <ExpenseByCategory
              data={categoryChartData}
              formatCurrency={formatRupiah}
              title="Expenses by Category"
              glass
              rounded
              modern
            />
          </div>

          <div className="md:col-span-3">
            <BudgetUsage
              data={budgetData}
              formatCurrency={formatRupiah}
              title="Budget Usage"
            />
          </div>

          <div className="md:col-span-1 space-y-6">
            {savingsGoals.length > 0 ? (
              savingsGoals.map(goal => (
                <SavingsGoal
                  key={goal.id}
                  title={goal.title}
                  current={goal.current_amount}
                  target={goal.target_amount}
                  dueDate={goal.due_date}
                  formatCurrency={formatRupiah}
                />
              ))
            ) : (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground mb-2">No savings goals yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/savings')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </Card>
            )}
          </div>

          <div className="md:col-span-4">
            <TransactionsList
              transactions={transactions.slice(0, 5)}
              title="Recent Transactions"
              viewAllLabel="View All"
              formatCurrency={formatRupiah}
              enableActions
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      )}
      
      {showTransactionModal && (
        <TransactionForm
          open={showTransactionModal}
          onOpenChange={(open: boolean) => {
            setShowTransactionModal(open);
            if (!open) setEditTransactionData(null);
          }}
          onAddTransaction={handleAddTransaction}
          editData={editTransactionData}
        />
      )}
    </Dashboard>
  );
};

export default Index;
