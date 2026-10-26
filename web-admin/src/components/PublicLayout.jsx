import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COMPANY } from "../data/company";
import Logo from "./Logo";

// Menu utama website: Katalog dan About Us (company profile) — tanpa login.
// Urutan harus sama dengan urutan section di halaman (dipakai scroll-spy).
const MAIN_MENU = [
  { label: "Katalog", to: "/katalog", section: "katalog" },
  { label: "About Us", to: "/about", section: "about" },
];

// Tinggi header sticky + sedikit toleransi: section dianggap aktif bila bagian atasnya sudah melewati garis ini
const SPY_OFFSET = 120;

// Scroll-spy: mencari section yang sedang terlihat tepat di bawah header saat halaman di-scroll
function useActiveSection() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    function handleScroll() {
      let current = null;
      for (const { section } of MAIN_MENU) {
        const el = document.getElementById(section);
        if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = section;
      }
      setActive(current);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    // hitung sekali setelah render pertama (mis. halaman dibuka langsung di /katalog)
    const frame = requestAnimationFrame(handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return active;
}

function PublicNavbar() {
  const { user } = useAuth();
  const activeSection = useActiveSection();

  return (
    <header className="sticky top-0 z-10 border-b border-border-soft bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Link to="/" aria-label={`${COMPANY.name} — ke beranda`}>
          <Logo size={36} textClassName="text-[21px] text-ink" />
        </Link>

        <nav className="flex items-center gap-5 sm:gap-8">
          {MAIN_MENU.map((item) => {
            const isActive = activeSection === item.section;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "true" : undefined}
                className={`relative py-1 text-[13.5px] text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:bg-ink after:transition-transform sm:text-sm ${
                  isActive ? "font-bold after:scale-x-100" : "font-semibold after:scale-x-0 hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sudah login -> ke dashboard, belum login -> tombol Masuk */}
        <Link
          to={user ? "/dashboard" : "/login"}
          className="flex h-[38px] items-center rounded-full border-[1.5px] border-border px-4 text-[13.5px] font-bold text-ink transition hover:border-ink hover:bg-ivory-alt sm:px-[18px]"
        >
          {user ? "Dashboard" : "Masuk"}
        </Link>
      </div>
    </header>
  );
}

// Bar promo gelap di atas navigasi (desain Home — Storefront)
function PromoBar() {
  return (
    <Link
      to="/katalog"
      className="flex items-center justify-center gap-2 bg-ink px-5 py-2.5 text-center text-[12.5px] font-semibold text-ivory hover:bg-[#26221B]"
    >
      Gratis ongkir se-Indonesia untuk belanja di atas Rp500rb
      <span aria-hidden="true">→</span>
    </Link>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo size={30} textClassName="text-lg text-ink" />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
          {MAIN_MENU.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-ink hover:underline">
              {item.label}
            </Link>
          ))}
          <Link to="/login" className="hover:text-ink hover:underline">
            Masuk toko
          </Link>
        </div>
        <span className="text-[13px] text-muted">© 2026 {COMPANY.name}</span>
      </div>
      {/* Atribusi wajib untuk foto berlisensi CC BY / CC BY-SA (rincian di CREDITS.md) */}
      <p className="mx-auto max-w-[1280px] px-4 pb-6 text-[11.5px] leading-relaxed text-muted sm:px-8">
        Foto produk dari Wikimedia Commons, rawpixel &amp; StockSnap (CC0, CC BY, CC BY-SA). Daftar pembuat &amp; lisensi lengkap
        ada di file CREDITS.md pada repository.
      </p>
    </footer>
  );
}

// Layout untuk halaman publik (Beranda + section Katalog & About Us)
export default function PublicLayout({ children, promo = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      {promo && <PromoBar />}
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
