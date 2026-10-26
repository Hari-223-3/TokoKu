import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

// Pesanan yang boleh dilihat: admin -> semua, client -> miliknya saja, belum login -> tidak ada
function fetchOrders(user) {
  if (!user) return Promise.resolve([]);
  return api(user.role === "administrator" ? "/orders" : "/orders/mine");
}

// Produk & pesanan diambil dari backend. Setelah tambah/ubah data, daftar dimuat ulang dari server
// agar yang tampil selalu sama dengan isi database.
export function DataProvider({ children }) {
  const { user, restoring } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Muat ulang setiap kali user berganti (login/logout): admin juga melihat produk nonaktif
  useEffect(() => {
    // tunggu sesi dipulihkan dulu, supaya request memakai token yang benar
    if (restoring) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productList, orderList] = await Promise.all([api("/products"), fetchOrders(user)]);
        if (ignore) return;
        setProducts(productList);
        setOrders(orderList);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();

    // abaikan hasil request lama jika user sudah berganti sebelum request selesai
    return () => {
      ignore = true;
    };
  }, [user, restoring]);

  async function reloadProducts() {
    setProducts(await api("/products"));
  }

  async function reloadOrders() {
    setOrders(await fetchOrders(user));
  }

  // Semua fungsi di bawah melempar Error berisi pesan server jika gagal, untuk ditampilkan di form
  async function addProduct(data) {
    const product = await api("/products", { method: "POST", body: data });
    await reloadProducts();
    return product;
  }

  async function updateProduct(id, data) {
    const product = await api(`/products/${id}`, { method: "PUT", body: data });
    await reloadProducts();
    return product;
  }

  // Cukup kirim { items: [{ productId, qty }], shippingMethod, shippingAddress, notes }.
  // Harga, total, nomor invoice, dan estimasi tiba dihitung oleh server.
  async function addOrder(data) {
    const order = await api("/orders", { method: "POST", body: data });
    // stok produk ikut berkurang, jadi keduanya dimuat ulang
    await Promise.all([reloadProducts(), reloadOrders()]);
    return order;
  }

  const value = { products, orders, loading, error, addProduct, updateProduct, addOrder };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
