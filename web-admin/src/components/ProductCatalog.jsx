import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, LOW_STOCK_LIMIT } from "../data/products";
import { formatRupiah } from "../utils/format";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import ProductThumb from "./ProductThumb";

const BTN = "rounded-full px-3.5 py-1.5 text-xs font-bold transition hover:-translate-y-px";

// Tombol aksi kartu menyesuaikan siapa yang melihat katalog
function CardAction({ product }) {
  const { user, isAdmin } = useAuth();
  const orderPath = `/form?productId=${product.id}`;

  if (isAdmin) {
    return (
      <Link to={`/form?id=${product.id}`} className={`${BTN} border border-border bg-white text-ink hover:border-ink`}>
        Edit
      </Link>
    );
  }
  if (product.stock === 0) {
    return <span className="rounded-full bg-ivory-alt px-3.5 py-1.5 text-xs font-bold text-muted">Habis</span>;
  }
  // Pengunjung belum login -> ke halaman login, lalu kembali ke form pesanan produk ini
  return (
    <Link
      to={user ? orderPath : "/login"}
      state={user ? undefined : { from: orderPath }}
      className={`${BTN} bg-ink text-ivory hover:bg-ink-hover`}
    >
      Pesan
    </Link>
  );
}

export function ProductCard({ product }) {
  return (
    <article className="group tk-fade-up flex flex-col">
      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl">
        <ProductThumb product={product} className="h-full w-full transition-transform duration-300 group-hover:scale-105" iconSize={40} />
        {product.stock === 0 ? (
          <span className="absolute top-3 left-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-ivory">Stok habis</span>
        ) : (
          product.stock <= LOW_STOCK_LIMIT && (
            <span className="absolute top-3 left-3 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-ivory">Sisa {product.stock}</span>
          )
        )}
      </div>
      <span className="text-[11.5px] font-semibold text-muted">{product.category}</span>
      <h3 className="mt-0.5 line-clamp-2 min-h-[2.5em] text-[14px] leading-tight font-bold text-ink">{product.name}</h3>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-display text-[16px] font-extrabold text-ink">{formatRupiah(product.price)}</span>
        <CardAction product={product} />
      </div>
      <span className="mt-1 text-[11.5px] text-muted">Dikirim ± {product.estimatedDays} hari</span>
    </article>
  );
}

// Katalog: filter kategori + pencarian. `limit` untuk tampilan ringkas, `moreLink` untuk tombol "lihat semua".
// initialCategory/initialQuery dipakai saat katalog dibuka dari beranda (mis. ?kategori=Sepatu).
export default function ProductCatalog({
  products,
  limit,
  moreLink = "/dashboard?view=katalog",
  initialCategory = "Semua",
  initialQuery = "",
}) {
  const [category, setCategory] = useState(CATEGORIES.includes(initialCategory) ? initialCategory : "Semua");
  const [query, setQuery] = useState(initialQuery);

  const keyword = query.trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.isActive &&
      (category === "Semua" || p.category === category) &&
      (keyword === "" || p.name.toLowerCase().includes(keyword))
  );
  const shown = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mt-1.5 flex gap-2 overflow-x-auto pt-1.5 pb-1 [scrollbar-width:none]">
          {["Semua", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition ${
                category === cat ? "border-ink bg-ink text-ivory" : "border-border bg-white text-ink hover:-translate-y-0.5 hover:border-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-full border-[1.5px] border-border bg-white py-1.5 pr-1.5 pl-4 transition focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgba(21,19,15,0.06)] lg:w-72">
          <Icon name="search" size={16} className="text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b0a898]"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState message="Produk tidak ditemukan" icon="search">
          <button
            type="button"
            onClick={() => {
              setCategory("Semua");
              setQuery("");
            }}
            className="text-sm font-bold text-coral hover:underline"
          >
            Reset filter
          </button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {limit && filtered.length > limit && (
        <div className="mt-7 text-center">
          <Link
            to={moreLink}
            className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-border bg-white px-5 py-2.5 text-sm font-bold text-ink hover:border-ink"
          >
            Lihat semua {filtered.length} produk <Icon name="chevron" size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
