
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AmountInputProps {
  amount: string;
  currency: string;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}

export function AmountInput({ amount, currency, onAmountChange, onCurrencyChange }: AmountInputProps) {
  const formatAsRupiah = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    onAmountChange(rawValue);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
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
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="IDR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IDR">IDR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
