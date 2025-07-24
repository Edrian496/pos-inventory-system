// src/app/dashboard/expenses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type Expense = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data, error } = await supabase.from("expenses").select("*");

      if (error) {
        console.error("Failed to fetch expenses:", error.message);
        return;
      }

      setExpenses(data || []);
    };

    fetchExpenses();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-md font-semibold">{expense.category}</p>
                  <p className="text-sm text-gray-500">{expense.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    ₱{expense.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
