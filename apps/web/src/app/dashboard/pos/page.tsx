"use client";

import { useEffect, useState } from "react";
import PaymentModal from "@/components/modals/PaymentModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/classnames";
import { MenuItem } from "@/lib/types";

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
    setRemoveModeId(id === removeModeId ? null : id);
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
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            date: new Date().toISOString().split("T")[0],
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
      toast.error("Unexpected error during checkout.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-muted px-4 sm:px-6 py-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {menu.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className={cn(
                "rounded-xl border bg-white transition-all shadow-sm hover:shadow-md cursor-pointer overflow-hidden group",
                highlightedItemId === item.id ? "ring-2 ring-indigo-400" : ""
              )}
            >
              <div className="aspect-[3/4] bg-muted">
                {item.image_url ? (
                  <picture>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-indigo-600 mt-1 font-semibold">
                  ₱{item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between h-full border">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Cart
            </h2>

            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No items selected.
              </p>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.id}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-800">
                        {item.name} × {item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => triggerRemoveMode(item.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {removeModeId === item.id && (
                      <div className="flex items-center gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center border rounded-md px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setRemoveQty((prev) => (prev > 1 ? prev - 1 : 1))
                            }
                            className="text-lg"
                          >
                            –
                          </Button>
                          <span className="px-2 text-sm">{removeQty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setRemoveQty((prev) =>
                                prev < item.quantity ? prev + 1 : prev
                              )
                            }
                            className="text-lg"
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          variant="indigo"
                          size="sm"
                          onClick={() => confirmRemove(item.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="red"
                          size="sm"
                          onClick={() => setRemoveModeId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
                <li className="flex justify-between font-semibold pt-4 border-t text-base mt-4 text-gray-900">
                  <span>Total:</span>
                  <span>
                    ₱
                    {cart
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </li>
              </ul>
            )}
          </div>

          <Button
            className="mt-6 w-full text-base py-5 bg-indigo-100 text-indigo-600 font-semibold"
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(true)}
          >
            Proceed to Checkout
          </Button>
        </div>

        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onConfirm={handleCheckout}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      </div>
    </div>
  );
}
