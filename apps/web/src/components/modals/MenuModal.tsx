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

import { MenuItem } from "../../app/dashboard/menu/page";

interface AddMenuItemModalProps {
  item?: MenuItem;
  onItemAdded: () => void;
  onClose?: () => void;
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
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setDescription(item.description || "");
      setOpen(true);
    }
  }, [item]);

  const handleSave = async () => {
    if (!name || !price) {
      toast.warning("Name and price are required.");
      return;
    }

    setLoading(true);

    let imageUrl = item?.image_url || null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `menu-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu")
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

      toast.success("Menu item updated!");
      handleClose();
      onItemAdded();
    } else {
      const { data: newItem, error: insertError } = await supabase
        .from("menu_items")
        .insert([
          { name, price: parseFloat(price), description, image_url: imageUrl },
        ])
        .select()
        .single();

      if (insertError || !newItem) {
        toast.error("Failed to add menu item.");
        setLoading(false);
        return;
      }

      toast.success("Menu item added!");
      handleClose();
      onItemAdded();
    }

    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setPrice("");
    setDescription("");
    setImageFile(null);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      {!item && (
        <DialogTrigger asChild>
          <Button
            className="flex items-center gap-2"
            variant="indigo"
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

          <Button variant="indigo" onClick={handleSave} disabled={loading}>
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
