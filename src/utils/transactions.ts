
import { format } from "date-fns";

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

export const formatDate = (date: string | Date) => {
  if (typeof date === 'string') {
    return format(new Date(date), "dd/MM/yyyy");
  }
  return format(date, "dd/MM/yyyy");
};

