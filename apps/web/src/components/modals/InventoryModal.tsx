"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface AddInventoryModalProps {
  onItemAdded: () => void;
}

export function AddInventoryModal({ onItemAdded }: AddInventoryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnit("");
    setReorderLevel("");
    setCostPerUnit("");
    setCategory("");
  };

  const handleAddItem = async () => {
    if (!name || !quantity || !unit || !reorderLevel || !costPerUnit) {
      toast.warning("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("inventory_items").insert([
      {
        name,
        quantity: parseFloat(quantity),
        unit,
        reorder_level: parseFloat(reorderLevel),
        cost_per_unit: parseFloat(costPerUnit),
        category: category || null,
      },
    ]);

    setLoading(false);

    if (error) {
      toast.error("Failed to add item.");
    } else {
      toast.success("Item added successfully!");
      onItemAdded();
      setOpen(false);
      resetForm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm(); // reset when closing
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" variant="indigo">
          <Plus size={16} />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tomatoes"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., kg, pcs"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost Per Unit (₱)</Label>
            <Input
              id="costPerUnit"
              type="number"
              min="0"
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              placeholder="e.g., 12.50"
              required
            />
          </div>
          <Button variant="indigo" onClick={handleAddItem} disabled={loading}>
            {loading ? "Saving..." : "Save Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
