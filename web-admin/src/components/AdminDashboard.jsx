import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { CATEGORIES, LOW_STOCK_LIMIT } from "../data/products";
import { ORDER_STATUSES } from "../data/orders";
import { formatRupiah } from "../utils/format";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import OrderTable from "./OrderTable";
import ProductTable from "./ProductTable";
import SalesStats from "./SalesStats";
import ProductThumb from "./ProductThumb";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";

function AddProductButton() {
  return (
    <Link
      to="/form"
      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-ivory transition hover:-translate-y-px hover:bg-ink-hover"
    >
      <Icon name="plus" size={15} strokeWidth={2.2} /> Tambah Produk
    </Link>
  );
}

// Produk terlaris dihitung sederhana: jumlahkan qty per produk dari semua pesanan
function getBestSellers(orders, products, count = 5) {
  const totals = {};
  orders.forEach((order) =>
    order.items.forEach((item) => {
      totals[item.productId] = (totals[item.productId] ?? 0) + item.qty;
    })
  );
  return Object.entries(totals)
    .map(([productId, qty]) => ({ product: products.find((p) => p.id === Number(productId)), qty }))
    .filter((row) => row.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, count);
}

function Overview() {
  const { products, orders } = useData();

  const paidOrders = orders.filter((o) => o.status !== "Pending");
  const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const lowStock = products.filter((p) => p.isActive && p.stock <= LOW_STOCK_LIMIT);
  const bestSellers = getBestSellers(orders, products);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Pendapatan" value={formatRupiah(revenue)} hint={`${paidOrders.length} dibayar`} />
        <StatCard label="Jumlah Pesanan" value={orders.length} />
        <StatCard label="Pesanan Pending" value={pendingCount} hint={pendingCount > 0 ? "perlu dicek" : undefined} tone="warning" />
        <StatCard label="Stok Kritis" value={lowStock.length} hint={`≤ ${LOW_STOCK_LIMIT} unit`} tone={lowStock.length > 0 ? "warning" : "default"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Pesanan Masuk"
          action={
            <Link to="/dashboard?view=pesanan" className="text-[13px] font-bold text-coral hover:underline">
              Lihat semua
            </Link>
          }
        >
          <OrderTable orders={orders.slice(0, 6)} />
        </SectionCard>

        <SectionCard title="Produk Terlaris">
          {bestSellers.length === 0 ? (
            <EmptyState message="Belum ada data penjualan" icon="tag" />
          ) : (
            <ol className="flex flex-col gap-3.5 p-5 sm:p-6">
              {bestSellers.map(({ product, qty }, index) => (
                <li key={product.id} className="flex items-center gap-3">
                  <span className="w-4 font-display text-sm font-bold text-muted">{index + 1}</span>
                  <ProductThumb product={product} className="h-10 w-10 shrink-0 rounded-[10px]" iconSize={16} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-ink">{product.name}</div>
                    <div className="text-[11.5px] text-muted">{qty} unit terjual</div>
                  </div>
                  <div className="text-[13px] font-bold whitespace-nowrap text-ink">{formatRupiah(product.price)}</div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Produk"
        action={
          <Link to="/dashboard?view=produk" className="text-[13px] font-bold text-coral hover:underline">
            Kelola produk
          </Link>
        }
      >
        <ProductTable products={products.slice(0, 6)} emptyMessage="Belum ada produk" />
      </SectionCard>
    </div>
  );
}

function ManageProducts() {
  const { products } = useData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const keyword = query.trim().toLowerCase();
  const filtered = products.filter(
    (p) => (category === "" || p.category === category) && (keyword === "" || p.name.toLowerCase().includes(keyword))
  );

  return (
    <SectionCard
      title={`Semua Produk (${filtered.length})`}
      action={
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="tk-input h-9 w-44 rounded-full text-[13px]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter kategori"
            className="tk-input h-9 w-auto rounded-full pr-8 text-[13px]"
          >
            <option value="">Semua kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      }
    >
      <ProductTable products={filtered} />
    </SectionCard>
  );
}

function ManageOrders() {
  const { orders } = useData();
  const [status, setStatus] = useState("Semua");
  const filtered = status === "Semua" ? orders : orders.filter((o) => o.status === status);

  return (
    <SectionCard title={`Semua Pesanan (${filtered.length})`}>
      <div className="flex gap-2 overflow-x-auto border-b border-[#EEE8DA] px-5 py-3 sm:px-6">
        {["Semua", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`shrink-0 rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-bold transition ${
              status === s ? "border-ink bg-ink text-ivory" : "border-border bg-white text-ink hover:border-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <OrderTable orders={filtered} showItems />
    </SectionCard>
  );
}

const VIEWS = {
  produk: { title: "Kelola Produk", Component: ManageProducts, action: true },
  pesanan: { title: "Kelola Pesanan", Component: ManageOrders },
  statistik: { title: "Statistik Penjualan", Component: SalesStats },
};

const TODAY = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function AdminDashboard({ view }) {
  const { title, Component, action } = VIEWS[view] ?? { title: "Ringkasan Toko", Component: Overview, action: true };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">{title}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{TODAY}</p>
        </div>
        {action && <AddProductButton />}
      </div>
      <Component />
    </>
  );
}
