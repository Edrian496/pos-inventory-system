"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AddMenuItemModal } from "@/components/modals/MenuModal";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const fetchMenu = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, price, description, image_url")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching menu:", error.message);
      setError("Failed to load menu");
    } else {
      setMenuItems(data ?? []);
      setError(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("menu_items")
      .update({ is_active: false }) // Soft delete
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      toast.error(`Failed to delete menu item.`);
      return;
    }

    toast.success("Menu item deleted.");
    await fetchMenu(); // Refresh the list
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Menu</h1>
        <AddMenuItemModal onItemAdded={fetchMenu} />
      </div>

      {loading ? (
        <p className="text-gray-500 italic">Loading menu...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : menuItems.length === 0 ? (
        <p className="text-gray-500 italic">No menu items available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 border hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{item.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Edit"
                    onClick={() => setEditingItem(item)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="h-6 w-6"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p className="text-indigo-600 font-semibold mb-2">
                ₱{item.price.toFixed(2)}
              </p>
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <AddMenuItemModal
          item={editingItem}
          onItemAdded={() => {
            fetchMenu();
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
