import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (!error) setItems(data || []);
      setLoading(false);
    };

    fetchInventory();
  }, []);

  return { items, loading };
}
