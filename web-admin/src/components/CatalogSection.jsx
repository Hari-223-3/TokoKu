import { useSearchParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import ProductCatalog from "./ProductCatalog";

// Section Katalog Harga di beranda (menu utama "Katalog", id="katalog").
// Mendukung ?kategori=...&q=... dari pencarian / pill kategori di hero.
export default function CatalogSection() {
  const { products } = useData();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("kategori") ?? "Semua";
  const query = searchParams.get("q") ?? "";

  return (
    <section id="katalog" className="scroll-mt-[72px] border-t border-border-soft">
      <div className="mx-auto max-w-[1280px] px-4 pt-14 pb-12 sm:px-8">
        <div className="mb-7">
          <span className="mb-3 inline-block rounded-full border border-border px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
            Katalog Harga
          </span>
          <h2 className="mb-2 font-display text-[34px] leading-tight font-bold text-ink sm:text-[40px]">Koleksi TokoKu</h2>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted">
            Pakaian, sepatu, tas, dan aksesoris buatan studio kami. Semua harga dalam Rupiah — masuk sebagai pelanggan untuk memesan.
          </p>
        </div>
        {/* key: reset filter saat URL berubah (mis. klik pill kategori di hero) */}
        <ProductCatalog key={`${category}|${query}`} products={products} initialCategory={category} initialQuery={query} />
      </div>
    </section>
  );
}
