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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const fetchInventory = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("inventory_items")
      .select("id, name, unit, quantity, cost_per_unit, created_at");

    if (error) {
      setError("Failed to load inventory.");
      console.error("❌ Error fetching inventory:", error.message);
      setLoading(false);
      return;
    }

    setInventory(data || []);
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchInventory();
  }, []);

  // Set filteredInventory to all data after fetch
  useEffect(() => {
    setFilteredInventory(inventory);
  }, [inventory]);

  const applyFilters = () => {
    let filtered = [...inventory];
    if (selectedDate) {
      filtered = filtered.filter((item) => {
        const createdAt = new Date(item.created_at);
        return createdAt.toDateString() === selectedDate.toDateString();
      });
    }
    setFilteredInventory(filtered);
    setPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const paginatedInventory = filteredInventory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
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

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Created Date
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date || new Date())}
            placeholderText="Select a date"
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="self-end md:self-auto">
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading inventory...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredInventory.length === 0 ? (
        <p className="text-muted-foreground">No matching items found.</p>
      ) : (
        <>
          {paginatedInventory.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <CardTitle className="text-lg">
                  {item.name} —{" "}
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleExpand(item.id)}
                >
                  {expanded[item.id] ? "Hide Info" : "Show More"}
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {expanded[item.id] && (
                  <div className="space-y-1">
                    <div>
                      Bought on:{" "}
                      {new Date(item.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div>Unit: {item.unit}</div>
                    <div>Quantity: {item.quantity}</div>
                    <div>Cost Per Unit: ₱{item.cost_per_unit.toFixed(2)}</div>
                  </div>
                )}
                <p className="font-semibold">
                  Total: ₱{(item.cost_per_unit * item.quantity).toFixed(2)}
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
