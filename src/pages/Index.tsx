
import Dashboard from "@/components/layout/Dashboard";
import StatsCard from "@/components/dashboard/StatsCard";
import ExpenseByCategory from "@/components/dashboard/ExpenseByCategory";
import MonthlyOverview from "@/components/dashboard/MonthlyOverview";
import SavingsGoal from "@/components/dashboard/SavingsGoal";
import BudgetUsage from "@/components/dashboard/BudgetUsage";
import TransactionsList from "@/components/dashboard/TransactionsList";
import FamilyMembers from "@/components/dashboard/FamilyMembers";

// Sample data for development purposes
const categoryData = [
  { name: "Housing", value: 1200, color: "#3b82f6" },
  { name: "Food", value: 450, color: "#10b981" },
  { name: "Transport", value: 300, color: "#f59e0b" },
  { name: "Utilities", value: 150, color: "#8b5cf6" },
  { name: "Entertainment", value: 200, color: "#ec4899" },
];

const monthlyData = [
  { name: "Jan", income: 4000, expenses: 3100 },
  { name: "Feb", income: 4200, expenses: 3000 },
  { name: "Mar", income: 3800, expenses: 3200 },
  { name: "Apr", income: 4100, expenses: 3400 },
  { name: "May", income: 3900, expenses: 3100 },
  { name: "Jun", income: 4000, expenses: 3050 },
];

const budgetData = [
  { name: "Housing", budget: 1500, spent: 1200 },
  { name: "Food", budget: 400, spent: 450 },
  { name: "Transport", budget: 350, spent: 300 },
  { name: "Utilities", budget: 200, spent: 150 },
  { name: "Entertainment", budget: 150, spent: 200 },
];

const transactions = [
  { 
    id: "1", 
    date: "Apr 18, 2025", 
    description: "Grocery Shopping", 
    category: "Food", 
    amount: 85.75,
    type: "expense" as const
  },
  { 
    id: "2", 
    date: "Apr 15, 2025", 
    description: "Monthly Salary", 
    category: "Salary", 
    amount: 3200.00, 
    type: "income" as const
  },
  { 
    id: "3", 
    date: "Apr 14, 2025", 
    description: "Electricity Bill", 
    category: "Utilities", 
    amount: 65.40, 
    type: "expense" as const
  },
  { 
    id: "4", 
    date: "Apr 10, 2025", 
    description: "Movie Night", 
    category: "Entertainment", 
    amount: 32.50, 
    type: "expense" as const
  },
];

const familyMembers = [
  {
    id: "1",
    name: "John Doe",
    role: "Admin",
    status: "online" as const
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Member",
    status: "online" as const
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "Member",
    status: "offline" as const
  }
];

const Index = () => {
  return (
    <Dashboard>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Balance"
          value="$12,560.00"
          description="As of April 21, 2025"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Monthly Income"
          value="$4,210.00"
          description="This month"
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Monthly Expenses"
          value="$2,890.00"
          description="This month"
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Savings Rate"
          value="31.4%"
          description="Of monthly income"
          trend={{ value: 3, isPositive: true }}
        />
        
        <div className="md:col-span-2">
          <MonthlyOverview data={monthlyData} />
        </div>
        <div className="md:col-span-2">
          <ExpenseByCategory data={categoryData} />
        </div>
        
        <div className="md:col-span-3">
          <BudgetUsage data={budgetData} />
        </div>
        <div className="md:col-span-1 space-y-6">
          <SavingsGoal 
            title="New Car" 
            current={4500} 
            target={10000} 
            dueDate="Dec 2025"
          />
          <SavingsGoal 
            title="Emergency Fund" 
            current={8000} 
            target={10000}
          />
        </div>
        
        <div className="md:col-span-3">
          <TransactionsList transactions={transactions} />
        </div>
        <div className="md:col-span-1">
          <FamilyMembers members={familyMembers} />
        </div>
      </div>
    </Dashboard>
  );
};

export default Index;
