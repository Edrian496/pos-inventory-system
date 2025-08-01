"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface PaymentMethod {
  id: string;
  name: string;
}

export function SalesModal({ onSuccess }: { onSuccess: () => void }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    { menuItemId: string; quantity: number }[]
  >([{ menuItemId: "", quantity: 1 }]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedItems([{ menuItemId: "", quantity: 1 }]);
      setPaymentMethodId("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const [menuRes, paymentRes] = await Promise.all([
        supabase.from("menu_items").select("id, name, price"),
        supabase.from("payment_method").select("id, name"),
      ]);
      if (menuRes.data) setMenuItems(menuRes.data);
      if (paymentRes.data) setPaymentMethods(paymentRes.data);
    };
    fetchDropdownData();
  }, []);

  const addItem = () => {
    setSelectedItems([...selectedItems, { menuItemId: "", quantity: 1 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...selectedItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedItems(updated);
  };

  const removeItem = (index: number) => {
    if (selectedItems.length === 1) return;
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const totalAmount = selectedItems.reduce((acc, item) => {
    const found = menuItems.find((m) => m.id === item.menuItemId);
    return acc + (found?.price || 0) * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    if (
      !paymentMethodId ||
      selectedItems.some((i) => !i.menuItemId || !i.quantity)
    ) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("User not logged in.");

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          date: new Date().toISOString(),
          total_amount: totalAmount,
          payment_method_id: paymentMethodId,
          user_id: user.id,
        })
        .select()
        .single();

      if (saleError || !sale) throw new Error(saleError?.message);

      const itemsToInsert = selectedItems.map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        return {
          sale_id: sale.id,
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: menuItem?.price || 0,
        };
      });

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(itemsToInsert);

      if (itemsError) throw new Error(itemsError.message);

      toast.success("Sale added successfully!");
      setSelectedItems([{ menuItemId: "", quantity: 1 }]);
      setPaymentMethodId("");
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(`Failed to add sale: ${err.message || err}`);
      console.error("Add sale error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2">
          <Plus size={16} />
          Add Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-2xl p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Record New Sale
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 items-end bg-muted/30 p-4 rounded-lg"
            >
              <div className="col-span-7">
                <Label>Menu Item</Label>
                <select
                  value={item.menuItemId}
                  onChange={(e) =>
                    updateItem(index, "menuItemId", e.target.value)
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select item</option>
                  {menuItems.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — ₱{m.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="col-span-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="mt-5 text-red-500 hover:bg-red-100"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" type="button" onClick={addItem}>
            + Add another item
          </Button>

          <div>
            <Label>Payment Method</Label>
            <select
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right text-base font-semibold">
            Total: ₱{totalAmount.toFixed(2)}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <ReloadIcon className="animate-spin mr-2 h-4 w-4" />}
            {loading ? "Saving..." : "Save Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
