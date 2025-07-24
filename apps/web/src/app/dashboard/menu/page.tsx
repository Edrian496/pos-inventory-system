// MenuPage.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { AddMenuItemModal } from "./add-menu-modal";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  ingredients: Ingredient[];
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const fetchMenuWithIngredients = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("menu_items").select(`
        id,
        name,
        price,
        category,
        description,
        menu_item_ingredients (
          quantity,
          inventory_items (
            name,
            unit
          )
        )
      `);

    if (error) {
      console.error("Error fetching menu:", error.message);
      setError("Failed to load menu");
      setLoading(false);
      return;
    }

    const formattedMenu = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category ?? "Uncategorized",
      description: item.description || "",
      ingredients: (item.menu_item_ingredients || []).map((i: any) => ({
        name: i.inventory_items?.name || "Unknown",
        unit: i.inventory_items?.unit || "",
        quantity: i.quantity,
      })),
    }));

    setMenuItems(formattedMenu);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenuWithIngredients();
  }, []);

  const handleDelete = async (id: string) => {
    const { error: deleteIngredients } = await supabase
      .from("menu_item_ingredients")
      .delete()
      .eq("menu_item_id", id);

    const { error: deleteMenu } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (deleteMenu || deleteIngredients) {
      console.error(deleteMenu || deleteIngredients);
      alert("Failed to delete menu item.");
    } else {
      fetchMenuWithIngredients();
    }
  };

  const groupedMenu = menuItems.reduce(
    (acc: Record<string, MenuItem[]>, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Menu</h1>
        <AddMenuItemModal onItemAdded={fetchMenuWithIngredients} />
      </div>

      {loading ? (
        <p className="text-gray-500 italic">Loading menu...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : menuItems.length === 0 ? (
        <p className="text-gray-500 italic">No menu items available.</p>
      ) : (
        Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-indigo-600 mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
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
                  {item.ingredients.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Ingredients:
                      </p>
                      <ul className="text-sm text-gray-500 list-disc list-inside">
                        {item.ingredients.map((i, index) => (
                          <li key={index}>
                            {i.quantity} {i.unit} {i.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400">
                      No ingredients listed.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {editingItem && (
        <AddMenuItemModal
          item={editingItem}
          onItemAdded={() => {
            fetchMenuWithIngredients();
            setEditingItem(null); // close modal
          }}
          onClose={() => setEditingItem(null)} // reset form on close
        />
      )}
    </div>
  );
}
