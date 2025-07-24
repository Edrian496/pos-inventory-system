export async function createSale(saleData: {
  user_id: string;
  payment_method_id: string;
  items: {
    menu_item_id: string;
    quantity: number;
    price: number;
  }[];
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create sale');
  }

  return res.json(); // return sale result
}
