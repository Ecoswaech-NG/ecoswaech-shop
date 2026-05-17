"use client";
 
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
 
interface CalcProps {
  sellingPrice: number;
}
 
export function FinancialCalculator({ sellingPrice }: CalcProps) {
  const [price,          setPrice]          = useState(sellingPrice);
  const [interestRate,   setInterestRate]   = useState(0);
  const [loanTerm,       setLoanTerm]       = useState(0);
  const [initialPayment, setInitialPayment] = useState(0);
  const [monthly,        setMonthly]        = useState<string | null>(null);
 
  const calculate = () => {
    const principal  = price - initialPayment;
    const monthlyRate = interestRate / 1200;
 
    if (monthlyRate === 0) {
      setMonthly((principal / loanTerm).toFixed(2));
      return;
    }
 
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);
 
    setMonthly(isNaN(payment) || !isFinite(payment) ? null : payment.toFixed(2));
  };
 
  return (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-[#2d1e5f] shadow-sm bg-white dark:bg-[#18122b]">
      <p className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] tracking-widest uppercase mb-4">
        Payment Planner
      </p>
 
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 dark:text-[#8b949e]">Price (₦)</label>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-[#8b949e]">Interest Rate (%)</label>
          <Input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-[#8b949e]">Loan Term (months)</label>
          <Input type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-[#8b949e]">Initial Payment (₦)</label>
          <Input type="number" value={initialPayment} onChange={(e) => setInitialPayment(Number(e.target.value))} className="mt-1" />
        </div>
      </div>
 
      <div className="flex items-center gap-4 mt-4">
        <Button
          onClick={calculate}
          className="flex-1 bg-[#220a77] hover:bg-[#00C8FF] text-white hover:text-[#18122b] rounded-full transition-all"
        >
          Calculate
        </Button>
        {monthly && (
          <p className="flex-1 text-sm font-medium text-gray-700 dark:text-[#c4b8e8]">
            Monthly: <span className="font-bold text-xl text-[#7b2ff2] dark:text-[#c4b8e8]">
              ₦{Number(monthly).toLocaleString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}