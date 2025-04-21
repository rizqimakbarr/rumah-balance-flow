
import { useEffect, useRef, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import StatsCard from "@/components/dashboard/StatsCard";
import ExpenseByCategory from "@/components/dashboard/ExpenseByCategory";
import MonthlyOverview from "@/components/dashboard/MonthlyOverview";
import SavingsGoal from "@/components/dashboard/SavingsGoal";
import BudgetUsage from "@/components/dashboard/BudgetUsage";
import TransactionsList from "@/components/dashboard/TransactionsList";
import FamilyMembers from "@/components/dashboard/FamilyMembers";
import TransactionForm from "@/components/transactions/TransactionForm";
import ExportOptions from "@/components/export/ExportOptions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const initialCategories = [
  { name: "Housing", value: 1200000, color: "#3b82f6", budget: 1500000 },
  { name: "Food", value: 450000, color: "#10b981", budget: 400000 },
  { name: "Transport", value: 300000, color: "#f59e0b", budget: 350000 },
  { name: "Utilities", value: 150000, color: "#8b5cf6", budget: 200000 },
  { name: "Entertainment", value: 200000, color: "#ec4899", budget: 150000 },
];

const initialMonthlyData = [
  { name: "Jan", income: 4000000, expenses: 3100000 },
  { name: "Feb", income: 4200000, expenses: 3000000 },
  { name: "Mar", income: 3800000, expenses: 3200000 },
  { name: "Apr", income: 4100000, expenses: 3400000 },
  { name: "May", income: 3900000, expenses: 3100000 },
  { name: "Jun", income: 4000000, expenses: 3050000 },
];

const initialTransactions = [
  { id: "1", date: "18/04/2025", description: "Grocery Shopping", category: "Food", amount: 85750, type: "expense", currency: "IDR" },
  { id: "2", date: "15/04/2025", description: "Monthly Salary", category: "Salary", amount: 3200000, type: "income", currency: "IDR" },
  { id: "3", date: "14/04/2025", description: "Electricity Bill", category: "Utilities", amount: 65400, type: "expense", currency: "IDR" },
  { id: "4", date: "10/04/2025", description: "Movie Night", category: "Entertainment", amount: 32500, type: "expense", currency: "IDR" },
];

const initialFamilyMembers = [
  { id: "1", name: "John Doe", role: "Admin", status: "online" },
  { id: "2", name: "Jane Smith", role: "Member", status: "online" },
  { id: "3", name: "Mike Johnson", role: "Member", status: "offline" }
];

const Index = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [categories, setCategories] = useState(initialCategories);
  const [monthlyData, setMonthlyData] = useState(initialMonthlyData);

  // "open-transaction-modal" global event (from header)
  useEffect(() => {
    const handleOpenModal = () => setShowTransactionModal(true);
    document.addEventListener("open-transaction-modal", handleOpenModal);
    return () => document.removeEventListener("open-transaction-modal", handleOpenModal);
  }, []);

  // Calculate financial summary based on transactions
  const financialSummary = transactions.reduce(
    (summary, transaction) => {
      const currentMonth = new Date().getMonth();
      const transactionMonth = parseInt(transaction.date.split('/')[1]) - 1; 
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

  // Calculate savings rate
  const savingsRate = financialSummary.income > 0 
    ? ((financialSummary.income - financialSummary.expenses) / financialSummary.income * 100).toFixed(1)
    : "0.0";

  // Convert category data for chart
  const categoryChartData = categories.map(cat => {
    const categoryTransactions = transactions.filter(
      t => t.type === "expense" && t.category === cat.name
    );
    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { ...cat, value: totalSpent };
  });

  // Convert budget data for chart
  const budgetData = categories.map(cat => {
    const categoryTransactions = transactions.filter(
      t => t.type === "expense" && t.category === cat.name
    );
    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, budget: cat.budget, spent: totalSpent };
  });

  // CRUD logic for transactions
  const handleAddTransaction = (tx: any) => {
    setTransactions(prev => [{ ...tx, id: Date.now().toString() }, ...prev]);
    const currentMonth = new Date().getMonth();
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonth];
    setMonthlyData(prev => {
      const updatedData = [...prev];
      const monthIndex = updatedData.findIndex(m => m.name === monthName);
      if (monthIndex !== -1) {
        if (tx.type === "income") {
          updatedData[monthIndex].income += parseFloat(tx.amount);
        } else {
          updatedData[monthIndex].expenses += parseFloat(tx.amount);
        }
      }
      return updatedData;
    });
    setShowTransactionModal(false);
  };

  // Format currency as Rupiah (could expand to support other currencies)
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  // English only; language now in settings
  const t = {
    dashboard: "Dashboard",
    totalBalance: "Total Balance",
    asOf: "As of April 21, 2025",
    monthlyIncome: "Monthly Income",
    thisMonth: "This month",
    monthlyExpenses: "Monthly Expenses",
    savingsRate: "Savings Rate",
    ofMonthlyIncome: "Of monthly income",
    monthlyOverview: "Monthly Overview",
    expensesByCategory: "Expenses by Category",
    budgetUsage: "Budget Usage",
    newCar: "New Car",
    emergencyFund: "Emergency Fund",
    recentTransactions: "Recent Transactions",
    viewAll: "View All",
    addTransaction: "Add Transaction"
  };

  return (
    <Dashboard>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title={t.totalBalance}
          value={formatRupiah(financialSummary.totalBalance)}
          description={t.asOf}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title={t.monthlyIncome}
          value={formatRupiah(financialSummary.income)}
          description={t.thisMonth}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title={t.monthlyExpenses}
          value={formatRupiah(financialSummary.expenses)}
          description={t.thisMonth}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title={t.savingsRate}
          value={`${savingsRate}%`}
          description={t.ofMonthlyIncome}
          trend={{ value: 3, isPositive: true }}
        />
        <div className="md:col-span-2">
          <MonthlyOverview 
            data={monthlyData}
            formatCurrency={formatRupiah}
            title={t.monthlyOverview}
            gradient // NEW prop to indicate modern style
          />
        </div>
        <div className="md:col-span-2">
          <ExpenseByCategory
            data={categoryChartData}
            formatCurrency={formatRupiah}
            title={t.expensesByCategory}
            glass // NEW prop to indicate modern style
          />
        </div>
        <div className="md:col-span-3">
          <BudgetUsage
            data={budgetData}
            formatCurrency={formatRupiah}
            title={t.budgetUsage}
          />
        </div>
        <div className="md:col-span-1 space-y-6">
          <SavingsGoal 
            title={t.newCar} 
            current={4500000} 
            target={10000000} 
            dueDate="Dec 2025"
            formatCurrency={formatRupiah}
          />
          <SavingsGoal
            title={t.emergencyFund}
            current={8000000}
            target={10000000}
            formatCurrency={formatRupiah}
          />
          <ExportOptions />
        </div>
        <div className="md:col-span-3">
          <TransactionsList
            transactions={transactions}
            title={t.recentTransactions}
            viewAllLabel={t.viewAll}
            formatCurrency={formatRupiah}
          />
        </div>
        <div className="md:col-span-1">
          <FamilyMembers members={initialFamilyMembers} />
        </div>
      </div>
      {showTransactionModal && (
        <TransactionForm
          open={showTransactionModal}
          onOpenChange={setShowTransactionModal}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </Dashboard>
  );
};

export default Index;

// src/pages/Index.tsx is getting very long; consider asking for refactor soon!
