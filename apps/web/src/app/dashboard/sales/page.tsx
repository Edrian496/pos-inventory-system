"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesModal } from "./sales-modal";
import { supabase } from "@/lib/supabase/client";
import { ReloadIcon } from "@radix-ui/react-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SalesRow {
  sale_id: string;
  date: string;
  total_amount: string;
  created_at: string;
  payment_method_name: string;
  menu_item_name: string;
  quantity: number;
  price: string;
}

interface GroupedSale {
  sale_id: string;
  date: string;
  total_amount: string;
  created_at: string;
  payment_method_name: string;
  items: {
    menu_item_name: string;
    quantity: number;
    price: string;
  }[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<GroupedSale[]>([]);
  const [filteredSales, setFilteredSales] = useState<GroupedSale[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPayment, setSelectedPayment] = useState("All");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFrom, setExportFrom] = useState<Date | null>(null);
  const [exportTo, setExportTo] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSales = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc("get_sales_view");

    if (error) {
      setError("Failed to load sales.");
      console.error("❌ Error fetching sales:", error.message);
      setLoading(false);
      return;
    }

    const grouped: Record<string, GroupedSale> = {};
    const paymentSet = new Set<string>();

    (data as SalesRow[]).forEach((row) => {
      if (!grouped[row.sale_id]) {
        grouped[row.sale_id] = {
          sale_id: row.sale_id,
          date: row.date,
          total_amount: row.total_amount,
          created_at: row.created_at,
          payment_method_name: row.payment_method_name,
          items: [],
        };
      }

      grouped[row.sale_id].items.push({
        menu_item_name: row.menu_item_name,
        quantity: row.quantity,
        price: row.price,
      });

      if (row.payment_method_name) {
        paymentSet.add(row.payment_method_name);
      }
    });

    const sorted = Object.values(grouped).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setSales(sorted);
    setFilteredSales(sorted);
    setPaymentMethods(["All", ...Array.from(paymentSet)]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const applyFilters = () => {
    let filtered = [...sales];

    const filterDate = selectedDate ?? new Date(); // fallback to today

    filtered = filtered.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === filterDate.toDateString();
    });

    if (selectedPayment !== "All") {
      filtered = filtered.filter(
        (sale) => sale.payment_method_name === selectedPayment
      );
    }

    setFilteredSales(filtered);
    setPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const paginatedSales = filteredSales.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const exportToExcel = () => {
    if (!exportFrom || !exportTo) {
      alert("Please select both From and To dates.");
      return;
    }

    const filtered = sales.filter((sale) => {
      const date = new Date(sale.date);
      return date >= exportFrom && date <= exportTo;
    });

    if (filtered.length === 0) {
      alert("No sales found in selected range.");
      return;
    }

    const rows = filtered.flatMap((sale) =>
      sale.items.map((item) => ({
        SaleID: sale.sale_id,
        Date: sale.date,
        PaymentMethod: sale.payment_method_name,
        MenuItem: item.menu_item_name,
        Quantity: item.quantity,
        PricePerUnit: parseFloat(item.price),
        Subtotal: parseFloat(item.price) * item.quantity,
        TotalSaleAmount: parseFloat(sale.total_amount),
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    XLSX.writeFile(
      workbook,
      `Sales Report From ${exportFrom.toISOString().split("T")[0]}_to_${exportTo.toISOString().split("T")[0]}.xlsx`
    );

    setExportOpen(false); // Close dialog after export
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Sales Record</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchSales} disabled={loading}>
            <ReloadIcon
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {/* <SalesModal onSuccess={fetchSales} /> */}
        </div>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="float-right">
            Export to Excel
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <DatePicker
                selected={exportFrom}
                onChange={(date) => setExportFrom(date)}
                className="border rounded px-2 py-1 w-full"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <DatePicker
                selected={exportTo}
                onChange={(date) => setExportTo(date)}
                className="border rounded px-2 py-1 w-full"
                placeholderText="Select end date"
              />
            </div>
            <Button onClick={exportToExcel} className="w-full">
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Date
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date || new Date())}
            placeholderText="Select a date"
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Method
          </label>
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {paymentMethods.map((pm) => (
              <option key={pm}>{pm}</option>
            ))}
          </select>
        </div>

        <div className="self-end md:self-auto">
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>

      {/* Sales */}
      {loading ? (
        <p className="text-muted-foreground">Loading sales...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredSales.length === 0 ? (
        <p className="text-muted-foreground">No matching sales found.</p>
      ) : (
        <>
          {paginatedSales.map((sale) => (
            <Card key={sale.sale_id}>
              <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <CardTitle className="text-lg">
                  {new Date(sale.date).toLocaleDateString()} —{" "}
                  {sale.payment_method_name}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleExpand(sale.sale_id)}
                >
                  {expanded[sale.sale_id] ? "Hide Items" : "Show Items"}
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {expanded[sale.sale_id] && (
                  <div>
                    {sale.items.map((item, idx) => (
                      <div key={idx}>
                        {item.menu_item_name} × {item.quantity} — ₱
                        {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    ))}
                  </div>
                )}
                <p className="font-semibold">
                  Total: ₱{parseFloat(sale.total_amount).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm px-2 mt-1">
              Page {page} of {Math.ceil(filteredSales.length / itemsPerPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * itemsPerPage >= filteredSales.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
