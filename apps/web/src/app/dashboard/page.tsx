"use client";

import { useEffect, useState } from "react";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import { supabase } from "@/lib/supabase/client";
import { generateRecentMonths, getMonthRange } from "@/lib/utils/generateMonth";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [monthOptions, setMonthOptions] = useState<string[]>([]);
  const [incomeByPayment, setIncomeByPayment] = useState([]);
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [cashflowByPayment, setCashflowByPayment] = useState([]);
  const [incomeExpenseData, setIncomeVsExpense] = useState<
    { name: string; amount: number }[]
  >([]);
  const [profit, setProfit] = useState<number>(0);

  useEffect(() => {
    setMonthOptions(generateRecentMonths(12));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { startDate, endDate } = getMonthRange(selectedMonth);

      const { data: cashflowPayment, error: cashflowError } =
        await supabase.rpc("get_cashflow_by_payment_method", {
          from_date: startDate,
          to_date: endDate,
        });

      const { data: incomePayment, error: incomeError } = await supabase.rpc(
        "get_income_percentage_by_payment_method",
        {
          from_date: startDate,
          to_date: endDate,
        }
      );

      const { data: expenseCategory, error: expenseError } = await supabase.rpc(
        "get_expense_by_ingredient_percentage",
        {
          from_date: startDate,
          to_date: endDate,
        }
      );

      const { data: incomeExpenseRaw, error: incomeExpenseError } =
        await supabase.rpc("get_total_income_expense", {
          target_month: selectedMonth,
        });

      const totals = Array.isArray(incomeExpenseRaw)
        ? incomeExpenseRaw[0]
        : incomeExpenseRaw;

      const income = Number(totals?.total_income ?? 0);
      const expense = Number(totals?.total_expense ?? 0);

      setIncomeVsExpense([
        { name: "Income", amount: income },
        { name: "Expense", amount: expense },
      ]);

      setProfit(income - expense);

      if (cashflowError)
        console.error("Error fetching cashflow:", cashflowError.message);
      if (incomeError)
        console.error("Error fetching income breakdown:", incomeError.message);
      if (expenseError)
        console.error(
          "Error fetching expense breakdown:",
          expenseError.message
        );
      if (incomeExpenseError)
        console.error(
          "Error fetching total income vs expense:",
          incomeExpenseError.message
        );

      setCashflowByPayment(cashflowPayment || []);
      setIncomeByPayment(incomePayment || []);
      setExpenseByCategory(expenseCategory || []);
    };

    fetchData();
  }, [selectedMonth]);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          📈 Dashboard Overview
        </h1>
        <select
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {new Date(`${month}-01`).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Net Profit Summary */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            💰 Net Profit
          </h2>
          <p
            className={`text-3xl font-bold ${
              profit > 0
                ? "text-green-600"
                : profit < 0
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {profit >= 0 ? "+" : "-"}₱{Math.abs(profit).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {profit > 0
              ? "You made a profit this month!"
              : profit < 0
              ? "You're operating at a loss this month."
              : "You broke even this month."}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <BarChartCard
          title="Cashflow by Payment Method"
          data={cashflowByPayment}
        />
        <PieChartCard title="Income by Payment Method" data={incomeByPayment} />
        <PieChartCard
          title="Expenses by Category"
          data={expenseByCategory}
          colors={["#ef4444", "#f97316", "#a855f7"]}
        />
        <BarChartCard title="Income vs Expense" data={incomeExpenseData} />
      </div>
    </div>
  );
}
