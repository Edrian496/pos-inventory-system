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
