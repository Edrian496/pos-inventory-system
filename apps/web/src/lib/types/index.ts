export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  reorder_level: number;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
};

export type Sale = {
  id: string;
  date: string;
  total_amount: number;
  payment_method_id: string;
  user_id: string;
  created_at: string;
};

export type SalesRow = {
  sale_id: string;
  date: string;
  total_amount: string;
  created_at: string;
  payment_method_name: string;
  menu_item_name: string;
  quantity: number;
  price: string;
}

export type GroupedSale = {
  sale_id: string;
  date: string;
  total_amount: string;
  created_at: string;
  payment_method_name: string;
  items: {
    menu_item_name: string;
    quantity: number;
    price: string;
  }[];
}

export type Ingredient = {
  name: string;
  quantity: number;
  unit: string | null;
}

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  ingredients: Ingredient[];
  image_url?: string;
}

export type RawMenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  menu_item_ingredients: {
    quantity: number;
    inventory_items: {
      name: string;
      unit: string | null;
    } | null;
  }[];
}

export type AddMenuItemModalProps = {
  item?: MenuItem; // ← edit mode
  onItemAdded: () => void;
  onClose?: () => void;
}

export type IngredientInput={
  inventory_item_id: string;
  quantity: string;
}
