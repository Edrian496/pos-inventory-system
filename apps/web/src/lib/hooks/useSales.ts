import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*, menu_items(name))')
        .order('created_at', { ascending: false });

      if (!error) setSales(data || []);
      setLoading(false);
    };

    fetchSales();
  }, []);

  return { sales, loading };
}
