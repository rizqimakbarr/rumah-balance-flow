import { useEffect, useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import TransactionsList from "@/components/dashboard/TransactionsList";
import TransactionForm from "@/components/transactions/TransactionForm";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { formatRupiah } from "@/utils/transactions";

export default function Transactions() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
  const {
    transactions,
    fetchTransactions,
    handleAddOrUpdate,
    handleDelete
  } = useTransactions(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id, fetchTransactions]);
  
  useEffect(() => {
    const handleOpenModal = () => {
      setShowForm(true);
      setEditData(null);
    };
    document.addEventListener("open-transaction-modal", handleOpenModal);
    return () => document.removeEventListener("open-transaction-modal", handleOpenModal);
  }, []);

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
