
import { useEffect, useRef, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import TransactionsList from "@/components/dashboard/TransactionsList";
import TransactionForm from "@/components/transactions/TransactionForm";
import { toast } from "sonner";

const getInitialTransactions = () => [
  { id: "1", date: "18/04/2025", description: "Grocery Shopping", category: "Food", amount: 85750, type: "expense", currency: "IDR" },
  { id: "2", date: "15/04/2025", description: "Monthly Salary", category: "Salary", amount: 3200000, type: "income", currency: "IDR" },
  { id: "3", date: "14/04/2025", description: "Electricity Bill", category: "Utilities", amount: 65400, type: "expense", currency: "IDR" },
  { id: "4", date: "10/04/2025", description: "Movie Night", category: "Entertainment", amount: 32500, type: "expense", currency: "IDR" },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState(getInitialTransactions);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

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

  const handleAddOrUpdate = (tx: any) => {
    if (editData) {
      setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
      toast.success("Transaction updated.");
    } else {
      setTransactions((prev) => [{ ...tx, id: Date.now().toString() }, ...prev]);
      toast.success("Transaction added.");
    }
    setShowForm(false);
    setEditData(null);
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    toast.success("Transaction deleted.");
  };

  return (
    <Dashboard>
      <div className="max-w-2xl mx-auto w-full">
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
