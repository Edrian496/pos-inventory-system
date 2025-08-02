import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost_per_unit: number;
  created_at: string;
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (!error && data) setItems(data as InventoryItem[]);
      setLoading(false);
    };

    fetchInventory();
  }, []);

  return { items, loading };
} 
