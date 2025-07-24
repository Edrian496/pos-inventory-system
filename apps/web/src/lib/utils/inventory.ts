export function isLowStock(quantity: number, reorderLevel: number) {
  return quantity <= reorderLevel;
}

export function calculateTotalStock(items: { quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
