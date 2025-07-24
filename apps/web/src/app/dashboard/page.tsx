"use client";

import { useEffect, useState } from "react";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import { supabase } from "@/lib/supabase/client";

// Utility to get first and last day of a month
function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number); // month is in format "2025-07"
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 0); // last day of the month
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState("2025-07");
  const [incomeByPayment, setIncomeByPayment] = useState([]);
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [cashflowByPayment, setCashflowByPayment] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { startDate, endDate } = getMonthRange(selectedMonth);

      // Cashflow by payment method
      const { data: cashflowPayment, error: cashflowError } =
        await supabase.rpc("get_cashflow_by_payment_method", {
          from_date: startDate,
          to_date: endDate,
        });

      if (cashflowError) {
        console.error("Error fetching cashflow:", cashflowError.message);
      }

      // Income percentage by payment method (🆕 updated function name)
      const { data: incomePayment, error: incomeError } = await supabase.rpc(
        "get_income_percentage_by_payment_method",
        {
          from_date: startDate,
          to_date: endDate,
        }
      );

      if (incomeError) {
        console.error("Error fetching income breakdown:", incomeError.message);
      }

      // Expense by category
      const { data: expenseCategory, error: expenseError } = await supabase.rpc(
        "get_expense_by_ingredient_percentage",
        {
          from_date: startDate,
          to_date: endDate,
        }
      );

      if (expenseError) {
        console.error(
          "Error fetching expense breakdown:",
          expenseError.message
        );
      }

      setCashflowByPayment(cashflowPayment || []);
      setIncomeByPayment(incomePayment || []);
      setExpenseByCategory(expenseCategory || []);
    };

    fetchData();
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Month Filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <select
          className="border px-3 py-2 rounded-md"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {[
            "2025-01",
            "2025-02",
            "2025-03",
            "2025-04",
            "2025-05",
            "2025-06",
            "2025-07",
            "2025-08",
            "2025-09",
            "2025-10",
            "2025-11",
            "2025-12",
          ].map((month) => (
            <option key={month} value={month}>
              {new Date(`${month}-01`).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
