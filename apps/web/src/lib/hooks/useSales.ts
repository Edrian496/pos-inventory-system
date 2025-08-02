import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface SaleItem {
  id: string;
  sale_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  menu_items: {
    name: string;
  };
}

interface Sale {
  id: string;
  user_id: string;
  payment_method_id: string;
  date: string;
  total_amount: number;
  created_at: string;
  sale_items: SaleItem[];
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*, menu_items(name))')
        .order('created_at', { ascending: false });

      if (!error && data) setSales(data as Sale[]);
      setLoading(false);
    };

    fetchSales();
  }, []);

  return { sales, loading };
}
