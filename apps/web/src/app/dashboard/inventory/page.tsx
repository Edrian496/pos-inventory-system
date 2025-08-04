"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AddInventoryModal } from "@/components/modals/InventoryModal";

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost_per_unit: number;
  created_at: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const fetchInventory = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load inventory.");
      console.error("❌ Error fetching inventory:", error.message);
      setLoading(false);
      return;
    }

    setInventory(data || []);
    setFilteredInventory(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const applyFilters = () => {
    const monthFilter = selectedMonth ?? new Date();

    const filtered = inventory.filter((item) => {
      const date = new Date(item.created_at);
      return (
        date.getMonth() === monthFilter.getMonth() &&
        date.getFullYear() === monthFilter.getFullYear()
      );
    });

    setFilteredInventory(filtered);
    setPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const paginatedItems = filteredInventory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Inventory Records</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchInventory} disabled={loading}>
            <ReloadIcon
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <AddInventoryModal onItemAdded={fetchInventory} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Date
          </label>
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="self-end md:self-auto">
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-muted-foreground">Loading inventory...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredInventory.length === 0 ? (
        <p className="text-muted-foreground">
          No matching inventory items found.
        </p>
      ) : (
        <>
          {/* Grouped by Month */}
          {(() => {
            const groupedByMonth: Record<string, InventoryItem[]> = {};

            paginatedItems.forEach((item) => {
              const date = new Date(item.created_at);
              const monthKey = date.toLocaleString("default", {
                month: "long",
                year: "numeric",
              });

              if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = [];
              groupedByMonth[monthKey].push(item);
            });

            return Object.entries(groupedByMonth).map(
              ([month, itemsInMonth]) => {
                const monthlyTotal = itemsInMonth.reduce(
                  (acc, item) => acc + item.quantity * item.cost_per_unit,
                  0
                );

                return (
                  <div key={month} className="space-y-4 mt-6">
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-xl font-bold text-primary">
                        {month}
                      </h2>
                      <span className="text-lg font-semibold text-blue-600">
                        ₱
                        {monthlyTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {itemsInMonth.map((item) => (
                      <Card key={item.id}>
                        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <CardTitle className="text-lg">
                            {item.name} —{" "}
                            {new Date(item.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpand(item.id)}
                          >
                            {expanded[item.id]
                              ? "Hide Details"
                              : "Show Details"}
                          </Button>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                          {expanded[item.id] && (
                            <div className="space-y-1">
                              <div>
                                Quantity: {item.quantity} {item.unit}
                              </div>
                              <div>
                                Cost per unit: ₱{item.cost_per_unit.toFixed(2)}
                              </div>

                              <div>
                                Bought on:{" "}
                                {new Date(item.created_at).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </div>
                            </div>
                          )}
                          <p className="font-semibold">
                            Total: ₱
                            {(item.cost_per_unit * item.quantity).toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              }
            );
          })()}

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
              Page {page} of{" "}
              {Math.ceil(filteredInventory.length / itemsPerPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * itemsPerPage >= filteredInventory.length}
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
