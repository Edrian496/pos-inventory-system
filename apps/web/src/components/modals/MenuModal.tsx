"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuItem } from "../../app/dashboard/menu/page";

interface AddMenuItemModalProps {
  item?: MenuItem;
  onItemAdded: () => void;
  onClose?: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
}

interface IngredientInput {
  inventory_item_id: string;
  quantity: string;
}

export function AddMenuItemModal({
  item,
  onItemAdded,
  onClose,
}: AddMenuItemModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setDescription(item.description || "");
      setIngredients(
        item.ingredients.map((ing) => ({
          inventory_item_id:
            inventoryItems.find((inv) => inv.name === ing.name)?.id || "",
          quantity: ing.quantity.toString(),
        }))
      );
      setOpen(true);
    }
  }, [item, inventoryItems]);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("id, name, unit");
      if (error) {
        toast.error("Failed to fetch inventory.");
      } else {
        setInventoryItems(data || []);
      }
    };
    fetchInventory();
  }, []);

  const addIngredientField = () => {
    setIngredients((prev) => [
      ...prev,
      { inventory_item_id: "", quantity: "" },
    ]);
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const handleSave = async () => {
    if (!name || !price) {
      toast.warning("Name and price are required.");
      return;
    }

    if (ingredients.some((i) => !i.inventory_item_id || !i.quantity)) {
      toast.warning("All ingredient fields must be filled.");
      return;
    }

    setLoading(true);

    let imageUrl = item?.image_url || null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `menu-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu") // replace with your actual bucket name
        .upload(filePath, imageFile);

      if (uploadError) {
        toast.error("Image upload failed.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("menu")
        .getPublicUrl(filePath);

      imageUrl = urlData?.publicUrl || null;
    }

    if (item) {
      const { error: updateError } = await supabase
        .from("menu_items")
        .update({
          name,
          price: parseFloat(price),
          description,
          image_url: imageUrl,
        })
        .eq("id", item.id);

      if (updateError) {
        toast.error("Failed to update menu item.");
        setLoading(false);
        return;
      }

      await supabase
        .from("menu_item_ingredients")
        .delete()
        .eq("menu_item_id", item.id);

      const mappedIngredients = ingredients.map((ing) => ({
        menu_item_id: item.id,
        inventory_item_id: ing.inventory_item_id,
        quantity: parseFloat(ing.quantity),
      }));

      const { error: insertError } = await supabase
        .from("menu_item_ingredients")
        .insert(mappedIngredients);

      if (insertError) {
        toast.error("Failed to update ingredients.");
      } else {
        toast.success("Menu item updated!");
        handleClose();
        onItemAdded();
      }
    } else {
      const { data: menuItem, error: insertError } = await supabase
        .from("menu_items")
        .insert([
          { name, price: parseFloat(price), description, image_url: imageUrl },
        ])
        .select()
        .single();

      if (insertError || !menuItem) {
        toast.error("Failed to add menu item.");
        setLoading(false);
        return;
      }

      const mappedIngredients = ingredients.map((ing) => ({
        menu_item_id: menuItem.id,
        inventory_item_id: ing.inventory_item_id,
        quantity: parseFloat(ing.quantity),
      }));

      const { error: ingredientError } = await supabase
        .from("menu_item_ingredients")
        .insert(mappedIngredients);

      if (ingredientError) {
        toast.error("Failed to add ingredients.");
      } else {
        toast.success("Menu item added!");
        handleClose();
        onItemAdded();
      }
    }

    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setPrice("");
    setDescription("");
    setIngredients([]);
    setImageFile(null);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      {!item && (
        <DialogTrigger asChild>
          <Button
            className="flex items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <Plus size={16} />
            Add Menu Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Photo (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading
              ? "Saving..."
              : item
              ? "Update Menu Item"
              : "Save Menu Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
