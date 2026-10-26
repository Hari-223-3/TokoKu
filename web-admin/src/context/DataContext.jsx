import { createContext, useContext, useState } from "react";
import { PRODUCTS } from "../data/products";
import { ORDERS } from "../data/orders";
import { toIsoDate } from "../utils/format";

const DataContext = createContext(null);

// Menyimpan produk & pesanan di state agar hasil form langsung terlihat di dashboard dan katalog.
// Data hilang saat refresh — wajar untuk tahap UTS (belum ada database).
export function DataProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS);
  // pesanan terbaru ditampilkan paling atas
  const [orders, setOrders] = useState(() => [...ORDERS].sort((a, b) => b.id - a.id));

  function addProduct(data) {
    const nextId = Math.max(0, ...products.map((p) => p.id)) + 1;
    setProducts((prev) => [...prev, { ...data, id: nextId }]);
  }

  function updateProduct(id, data) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function addOrder(data) {
    const nextId = Math.max(0, ...orders.map((o) => o.id)) + 1;
    const createdAt = toIsoDate(new Date());
    // format nomor: INV-YYYYMMDD-XXX
    const orderNumber = `INV-${createdAt.replaceAll("-", "")}-${String(nextId).padStart(3, "0")}`;
    const order = { ...data, id: nextId, orderNumber, createdAt };

    setOrders((prev) => [order, ...prev]);
    // kurangi stok produk yang dipesan
    setProducts((prev) =>
      prev.map((p) => {
        const item = order.items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.qty } : p;
      })
    );
    return order;
  }

  const value = { products, orders, addProduct, updateProduct, addOrder };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
