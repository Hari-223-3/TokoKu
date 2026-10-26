import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatRupiah } from "../utils/format";
import AboutSection from "../components/AboutSection";
import CatalogSection from "../components/CatalogSection";
import Icon from "../components/Icon";
import { smoothScrollTo, smoothScrollToId } from "../utils/scroll";
import ProductThumb from "../components/ProductThumb";

const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8";

// Link katalog yang sudah terfilter, mis. /katalog?kategori=Sepatu
const catalogLink = (params) => `/katalog?${new URLSearchParams(params)}`;

const CATEGORY_PILLS = [
  { label: "Wanita", category: "Pakaian Wanita", icon: "shirt", bg: "bg-[#ECE5D8]" },
  { label: "Pria", category: "Pakaian Pria", icon: "shirt", bg: "bg-[#E3E7EC]" },
  { label: "Sepatu", category: "Sepatu", icon: "shoe", bg: "bg-[#F3E3DE]" },
  { label: "Tas", category: "Tas", icon: "shop", bg: "bg-[#E1EAE5]" },
  { label: "Aksesoris", category: "Aksesoris", icon: "sparkle", bg: "bg-[#EFE9DC]" },
];

// Kartu produk putih yang mengambang di hero (mengikuti desain Home — Storefront).
// Klik -> ke katalog kategori produk ini (bukan cari nama persis), supaya katalognya tidak terlihat kosong
// karena kebetulan cuma produk itu sendiri yang cocok dengan pencarian nama lengkap.
function FloatCard({ product, className }) {
  if (!product) return null;
  return (
    <Link
      to={catalogLink({ kategori: product.category })}
      className={`tk-float-card absolute block rounded-[18px] bg-white p-2.5 shadow-[0_14px_30px_rgba(21,19,15,0.12)] ${className}`}
    >
      {/* key={product.id} -> setiap kali produknya berganti otomatis, kartu ini fade-in ulang */}
      <div key={product.id} className="tk-crossfade">
        <ProductThumb product={product} className="mb-2 aspect-square w-full rounded-xl" iconSize={34} />
        <div className="truncate text-[12.5px] font-bold text-ink">{product.name}</div>
        <div className="mt-0.5 text-[11.5px] font-semibold text-muted">{formatRupiah(product.price)}</div>
      </div>
    </Link>
  );
}

// Kotak kategori berisi foto produk + label; lapisan gelap agar label tetap terbaca di atas foto.
// Foto di dalamnya ikut berganti otomatis, tapi label & tautan kategori tetap tetap.
function CategoryChip({ label, category, product, className }) {
  if (!product) return null;
  return (
    <Link
      to={catalogLink({ kategori: category })}
      className={`tk-float-card group absolute block overflow-hidden rounded-2xl shadow-[0_14px_26px_rgba(21,19,15,0.14)] ${className}`}
    >
      <ProductThumb
        key={product.id}
        product={product}
        className="tk-crossfade h-full w-full transition-transform duration-300 group-hover:scale-110"
        iconSize={28}
      />
      <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink/75 via-ink/15 to-transparent pb-2.5">
        <span className="font-display text-[12px] font-extrabold text-ivory sm:text-[13px]">{label}</span>
      </span>
    </Link>
  );
}

// Bentuk dekoratif (lengkung, bulat, kotak) yang diisi foto produk.
// Klik -> ke katalog kategori produk ini (bukan cari nama persis), lihat catatan di FloatCard di atas.
function PhotoShape({ product, className }) {
  if (!product) return null;
  return (
    <Link
      to={catalogLink({ kategori: product.category })}
      title={product.name}
      aria-label={`Lihat kategori ${product.category}, terinspirasi dari ${product.name}`}
      className={`tk-float-card group absolute hidden overflow-hidden lg:block ${className}`}
    >
      <ProductThumb
        key={product.id}
        product={product}
        className="tk-crossfade h-full w-full transition-transform duration-300 group-hover:scale-110"
        iconSize={28}
      />
    </Link>
  );
}

// 8 slot dekoratif di hero. `category` mengunci slot kategori (chip) supaya foto yang dirotasi
// tetap relevan dengan tautannya; slot lain ("float"/"shape") bebas diisi produk apa saja.
const HERO_SLOTS = [
  { key: "leftCard", kind: "float", className: "tk-bob-a top-4 left-3 w-[112px] sm:top-[30px] sm:left-1 sm:w-[168px]" },
  { key: "leftChip", kind: "chip", category: "Tas", label: "tas kulit", className: "tk-bob-b top-[285px] left-10 h-[76px] w-[76px] sm:top-[210px] sm:left-[150px] sm:h-[118px] sm:w-[118px]" },
  { key: "leftArch", kind: "shape", className: "tk-bob-c top-[70px] left-[330px] h-[190px] w-[150px] rounded-[100px_100px_16px_16px] shadow-[0_16px_30px_rgba(21,19,15,0.14)]" },
  { key: "leftCircle", kind: "shape", className: "tk-bob-d top-[250px] left-[470px] h-24 w-24 rounded-full shadow-[0_12px_24px_rgba(21,19,15,0.18)]" },
  { key: "rightRect", kind: "shape", className: "tk-bob-c top-[260px] right-[470px] h-[148px] w-[108px] rounded-2xl shadow-[0_14px_28px_rgba(21,19,15,0.16)]" },
  { key: "rightCircle", kind: "shape", className: "tk-bob-b top-[90px] right-[330px] h-32 w-32 rounded-full shadow-[0_14px_26px_rgba(21,19,15,0.12)]" },
  { key: "rightChip", kind: "chip", category: "Sepatu", label: "sneakers", className: "tk-bob-d top-[295px] right-10 h-[76px] w-[76px] sm:top-[220px] sm:right-[150px] sm:h-[118px] sm:w-[118px]" },
  { key: "rightCard", kind: "float", className: "tk-bob-a top-6 right-3 w-[112px] sm:top-5 sm:right-1 sm:w-[180px]" },
];

// Ganti 1 slot secara acak kira-kira tiap ROTATE_MS, supaya tidak semua bentuk berganti serentak
const ROTATE_MS = 3500;

// Pilih produk acak untuk sebuah slot, hindari produk yang sedang tampil di slot lain kalau bisa
function pickForSlot(slot, activeProducts, usedIds) {
  const matching = activeProducts.filter((p) => !slot.category || p.category === slot.category);
  const fresh = matching.filter((p) => !usedIds.has(p.id));
  const pool = fresh.length > 0 ? fresh : matching; // kehabisan produk unik -> boleh dipakai ulang
  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function initialHeroAssignment(activeProducts) {
  const usedIds = new Set();
  const assign = {};
  for (const slot of HERO_SLOTS) {
    const product = pickForSlot(slot, activeProducts, usedIds);
    if (product) {
      assign[slot.key] = product.id;
      usedIds.add(product.id);
    }
  }
  return assign;
}

function renderHeroSlot(slot, product) {
  if (slot.kind === "float") return <FloatCard key={slot.key} product={product} className={slot.className} />;
  if (slot.kind === "chip") return <CategoryChip key={slot.key} label={slot.label} category={slot.category} product={product} className={slot.className} />;
  return <PhotoShape key={slot.key} product={product} className={slot.className} />;
}

function Hero({ products }) {
  // ref berisi daftar produk aktif terbaru, dibaca dari dalam interval tanpa perlu me-restart timer-nya
  const activeRef = useRef([]);
  activeRef.current = products.filter((p) => p.isActive);
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const [assign, setAssign] = useState(() => initialHeroAssignment(activeRef.current));

  useEffect(() => {
    // kalau produk aktif terlalu sedikit, rotasi dimatikan supaya tidak mengulang-ulang produk yang sama
    if (activeRef.current.length < HERO_SLOTS.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      const active = activeRef.current;
      setAssign((prev) => {
        const slot = HERO_SLOTS[Math.floor(Math.random() * HERO_SLOTS.length)];
        const usedIds = new Set(Object.values(prev));
        usedIds.delete(prev[slot.key]); // produk yang lagi ditampilkan slot ini sendiri boleh terpilih lagi
        const next = pickForSlot(slot, active, usedIds);
        return next ? { ...prev, [slot.key]: next.id } : prev;
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`${WRAP} relative h-[390px] overflow-hidden sm:h-[480px] sm:overflow-visible`}>
      {HERO_SLOTS.slice(0, 4).map((slot) => renderHeroSlot(slot, productsById.get(assign[slot.key])))}

      {/* wordmark */}
      <div className="pointer-events-none absolute inset-x-0 top-[192px] text-center sm:top-[158px]">
        <h1 className="tk-word font-display text-[72px] leading-none font-extrabold tracking-[-0.02em] text-ink sm:text-[118px]">TokoKu</h1>
      </div>

      {HERO_SLOTS.slice(4).map((slot) => renderHeroSlot(slot, productsById.get(assign[slot.key])))}
    </section>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    navigate(query.trim() ? catalogLink({ q: query.trim() }) : "/katalog");
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="tk-fade-up mx-auto max-w-[800px] px-4 pb-7 sm:px-8">
      <div className="flex items-center gap-3 rounded-full border-[1.5px] border-border bg-white py-2 pr-2 pl-5 shadow-[0_10px_26px_rgba(21,19,15,0.06)] transition focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgba(21,19,15,0.06)]">
        <Icon name="search" size={19} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari yang kamu mau hari ini?"
          aria-label="Cari produk"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#b0a898] sm:text-base"
        />
        <button
          type="submit"
          aria-label="Cari"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral text-ivory transition hover:scale-105 hover:bg-coral-hover"
        >
          <Icon name="search" size={18} strokeWidth={2.2} />
        </button>
      </div>
    </form>
  );
}

// pt-2/-mt-2: ruang agar pill yang naik saat hover tidak terpotong oleh overflow-x-auto
function CategoryPills() {
  return (
    <div className={`${WRAP} tk-scroll -mt-2 flex gap-3 overflow-x-auto pt-2 pb-11 sm:flex-wrap sm:justify-center sm:gap-3.5 sm:overflow-visible`}>
      {CATEGORY_PILLS.map((pill) => (
        <Link
          key={pill.label}
          to={catalogLink({ kategori: pill.category })}
          className="flex shrink-0 items-center gap-2.5 rounded-full border-[1.5px] border-border bg-white py-2 pr-[18px] pl-2 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_8px_18px_rgba(21,19,15,0.1)]"
        >
          <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-ink ${pill.bg}`}>
            <Icon name={pill.icon} size={17} />
          </span>
          <span className="text-sm font-bold text-ink">{pill.label}</span>
        </Link>
      ))}
      <Link
        to="/katalog"
        className="flex shrink-0 items-center gap-2.5 rounded-full border-[1.5px] border-ink bg-ink py-2 pr-[18px] pl-2 transition hover:-translate-y-0.5"
      >
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-coral text-ivory">
          <Icon name="grid" size={16} />
        </span>
        <span className="text-sm font-bold text-ivory">Semua produk</span>
      </Link>
    </div>
  );
}

// Route -> id section yang dituju. /katalog dan /about membuka halaman yang sama lalu scroll.
const SECTION_BY_PATH = { "/katalog": "katalog", "/about": "about" };

// Satu halaman panjang: Beranda (desain "Home — Storefront") -> Katalog -> About Us
export default function HomePage() {
  const { products } = useData();
  const { user } = useAuth();
  const location = useLocation();

  // Setiap kali menu diklik (location berubah), scroll ke section terkait
  useEffect(() => {
    const id = SECTION_BY_PATH[location.pathname];
    // animasi scroll pelan (durasi diatur di utils/scroll.js)
    if (id) smoothScrollToId(id);
    else smoothScrollTo(0);
  }, [location]);

  return (
    <>
      <Hero products={products} />
      <SearchBar />
      <CategoryPills />

      <CatalogSection />
      <AboutSection />

      {/* CTA bawah */}
      <section className={`${WRAP} pb-16`}>
        <div className="flex flex-col gap-6 rounded-3xl bg-ink p-8 sm:flex-row sm:items-center sm:justify-between sm:px-11 sm:py-10">
          <div>
            <h2 className="mb-1.5 font-display text-2xl font-bold text-ivory">
              {user ? `Halo, ${user.name}` : "Ingin memesan di TokoKu?"}
            </h2>
            <p className="text-[13.5px] text-ivory/60">
              {user ? "Lanjutkan ke dashboard untuk melihat pesanan dan katalog." : "Masuk sebagai pelanggan untuk membuat pesanan dan melacak pengiriman."}
            </p>
          </div>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="flex h-[50px] shrink-0 items-center justify-center rounded-full bg-ivory px-[26px] text-[14.5px] font-bold text-ink transition hover:-translate-y-px hover:bg-ivory-alt"
          >
            {user ? "Ke Dashboard" : "Masuk"}
          </Link>
        </div>
      </section>
    </>
  );
}
