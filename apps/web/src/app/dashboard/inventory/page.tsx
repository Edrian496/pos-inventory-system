"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddInventoryModal } from "./add-inventory-modal";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorder_level: number;
  cost_per_unit: number;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFrom, setExportFrom] = useState<Date | null>(null);
  const [exportTo, setExportTo] = useState<Date | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error.message);
    } else {
      setItems(data || []);

      // Derive categories dynamically
      const uniqueCategories = Array.from(
        new Set(data?.map((item) => item.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      categoryFilter ? item.category === categoryFilter : true
    );

  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const exportInventoryToExcel = () => {
    if (!exportFrom || !exportTo) {
      alert("Please select both From and To dates.");
      return;
    }

    const filtered = items.filter((item) => {
      const updated = new Date(item.updated_at);
      return updated >= exportFrom && updated <= exportTo;
    });

    if (filtered.length === 0) {
      alert("No items found in selected date range.");
      return;
    }

    const rows = filtered.map((item) => ({
      Name: item.name,
      Quantity: item.quantity,
      Unit: item.unit,
      "Reorder Level": item.reorder_level,
      "Cost per Unit": item.cost_per_unit,
      Category: item.category || "Uncategorized",
      "Updated At": new Date(item.updated_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    XLSX.writeFile(
      workbook,
      `Inventory Report From ${exportFrom.toISOString().split("T")[0]}_to_${
        exportTo.toISOString().split("T")[0]
      }.xlsx`
    );

    setExportOpen(false); // close dialog
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <AddInventoryModal onItemAdded={fetchItems} />
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="float-right">
            Export to Excel
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Export Inventory</DialogTitle>
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
            <Button onClick={exportInventoryToExcel} className="w-full">
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 items-center flex-wrap">
        <Input
          placeholder="Search item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={fetchItems}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ReloadIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {paginatedItems.length === 0 ? (
        <p className="text-muted-foreground">No inventory items found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((item) => (
            <Card
              key={item.id}
              className={
                item.quantity <= item.reorder_level
                  ? "border-red-500"
                  : "border-muted"
              }
            >
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  Quantity:{" "}
                  <span className="font-medium text-foreground">
                    {item.quantity}
                  </span>{" "}
                  {item.unit}
                </p>
                <p>
                  Reorder Level:{" "}
                  <span className="text-red-500 font-medium">
                    {item.reorder_level}
                  </span>
                </p>
                <p>
                  Cost per Unit: ₱
                  {parseFloat(item.cost_per_unit?.toString() || "0").toFixed(2)}
                </p>
                <p>Category: {item.category || "Uncategorized"}</p>
                <p>Updated: {new Date(item.updated_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm pt-1">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
