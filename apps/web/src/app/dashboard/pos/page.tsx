"use client";

import { useEffect, useState } from "react";
import PaymentModal from "@/components/modals/PaymentModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/classnames";
import { Input } from "@/components/ui/input";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

type CartItem = MenuItem & { quantity: number };

export default function POSPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );
  const [removeModeId, setRemoveModeId] = useState<string | null>(null);
  const [removeQty, setRemoveQty] = useState<number>(1);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("User not logged in");
      } else {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) {
        toast.error("Failed to load menu");
      } else {
        setMenu(data || []);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    setHighlightedItemId(item.id);
    setTimeout(() => setHighlightedItemId(null), 300);
  };

  const triggerRemoveMode = (id: string) => {
    setRemoveModeId(id === removeModeId ? null : id); // toggle
    setRemoveQty(1);
  };

  const confirmRemove = (id: string) => {
    const item = cart.find((ci) => ci.id === id);
    if (!item) return;

    const qtyToRemove = Math.min(removeQty, item.quantity);
    if (qtyToRemove >= item.quantity) {
      setCart((prev) => prev.filter((ci) => ci.id !== id));
    } else {
      setCart((prev) =>
        prev.map((ci) =>
          ci.id === id ? { ...ci, quantity: ci.quantity - qtyToRemove } : ci
        )
      );
    }

    toast.success(`Removed ${qtyToRemove} ${item.name}`);
    setRemoveModeId(null);
    setRemoveQty(1);
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      // Insert into `sales`
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
            total_amount: totalAmount,
            payment_method_id: paymentMethod,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (saleError || !sale) {
        toast.error("Failed to record sale.");
        return;
      }

      // Build sale_items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) {
        toast.error("Failed to record sale items.");
        return;
      }

      toast.success("Transaction complete!");
      setCart([]);
      setShowPaymentModal(false);
      setPaymentMethod("");
    } catch (err) {
      toast.error("Unexpected error occurred during checkout.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 grid md:grid-cols-3 gap-6">
      {/* Menu Items */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {menu.map((item) => (
          <div
            key={item.id}
            onClick={() => addToCart(item)}
            className={cn(
              "border p-4 rounded shadow cursor-pointer transition-all duration-200",
              highlightedItemId === item.id
                ? "bg-indigo-100 scale-[1.03]"
                : "hover:shadow-md hover:bg-gray-50"
            )}
          >
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-gray-600">₱{item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">No items selected</p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => triggerRemoveMode(item.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>

                {removeModeId === item.id && (
                  <div className="flex items-center gap-3 mt-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center border rounded px-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-xl px-2"
                        onClick={() =>
                          setRemoveQty((prev) => (prev > 1 ? prev - 1 : 1))
                        }
                      >
                        –
                      </Button>
                      <span className="px-2 min-w-[20px] text-center text-sm">
                        {removeQty}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-xl px-2"
                        onClick={() =>
                          setRemoveQty((prev) =>
                            prev < item.quantity ? prev + 1 : prev
                          )
                        }
                      >
                        +
                      </Button>
                    </div>

                    <Button size="sm" onClick={() => confirmRemove(item.id)}>
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRemoveModeId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </li>
            ))}

            <li className="font-semibold flex justify-between border-t pt-2 mt-2">
              <span>Total:</span>
              <span>
                ₱
                {cart
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toFixed(2)}
              </span>
            </li>
          </ul>
        )}

        <Button
          className="mt-4 w-full"
          disabled={cart.length === 0}
          onClick={() => setShowPaymentModal(true)}
        >
          Checkout
        </Button>
      </div>

      {/* Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onConfirm={handleCheckout}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
    </div>
  );
}
