import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import Icon from "./Icon";
import Logo from "./Logo";

// Isi menu toko berbeda per role (MidTermProject.md bagian 4.2)
const MENU = {
  administrator: [
    { label: "Dashboard", to: "/dashboard", view: null, icon: "grid" },
    { label: "Kelola Produk", to: "/dashboard?view=produk", view: "produk", icon: "box" },
    { label: "Kelola Pesanan", to: "/dashboard?view=pesanan", view: "pesanan", icon: "bag" },
    { label: "Statistik Penjualan", to: "/dashboard?view=statistik", view: "statistik", icon: "chart" },
  ],
  client: [
    { label: "Dashboard", to: "/dashboard", view: null, icon: "grid" },
    { label: "Katalog Produk", to: "/dashboard?view=katalog", view: "katalog", icon: "shop" },
    { label: "Pesanan Saya", to: "/dashboard?view=pesanan", view: "pesanan", icon: "bag" },
  ],
};

const ROLE_LABEL = { administrator: "Administrator", client: "Client" };

function useActiveView() {
  const { pathname, search } = useLocation();
  const { isAdmin } = useAuth();
  // Halaman form ditandai sebagai bagian dari menu terkait
  if (pathname === "/form") return isAdmin ? "produk" : "pesanan";
  return new URLSearchParams(search).get("view");
}

function UserChip({ user, dark = false }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-2xl p-3 ${dark ? "bg-ivory/5" : "bg-ivory-alt"}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF4E32,#2F5D50)] font-display text-xs font-bold text-ivory">
        {initials(user.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-[13px] font-bold ${dark ? "text-ivory" : "text-ink"}`}>{user.name}</div>
        <div className={`text-[11px] ${dark ? "text-ivory/50" : "text-muted"}`}>{ROLE_LABEL[user.role]}</div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const activeView = useActiveView();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = MENU[user.role];

  // setelah logout, ProtectedRoute otomatis mengarahkan ke beranda company profile
  function handleLogout() {
    logout();
  }

  return (
    <>
      {/* ---------- Sidebar Administrator (desktop) ---------- */}
      {isAdmin && (
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-[244px] flex-col bg-ink px-4 py-6 lg:flex">
          <Link to="/" className="flex items-center gap-2 px-2 pb-6" title="Ke beranda TokoKu">
            <Logo size={32} textClassName="text-[19px] text-ivory" />
            <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink">ADMIN</span>
          </Link>
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const active = activeView === item.view;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-colors ${
                    active ? "bg-coral font-bold text-ink" : "font-semibold text-ivory hover:bg-ivory/10"
                  }`}
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          <UserChip user={user} dark />
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-semibold text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
          >
            <Icon name="logout" size={16} /> Logout
          </button>
        </aside>
      )}

      {/* ---------- Top bar (client desktop + semua role di mobile) ---------- */}
      <header className={`sticky top-0 z-10 border-b border-border-soft bg-ivory/90 backdrop-blur ${isAdmin ? "lg:hidden" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setDrawerOpen(true)}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-white hover:bg-ivory-alt md:hidden"
          >
            <Icon name="menu" size={16} strokeWidth={2} />
          </button>

          <Link to="/" title="Ke beranda TokoKu">
            <Logo size={34} textClassName="text-[21px] text-ink" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {items.map((item) => {
              const active = activeView === item.view;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative py-1 text-sm font-semibold text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-ink after:transition-transform ${
                    active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-[13px] font-bold text-ink">{user.name}</div>
              <div className="text-[11px] text-muted">{ROLE_LABEL[user.role]}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-xs font-bold text-ivory">
              {initials(user.name)}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-ink hover:border-ink md:block"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Drawer (mobile), mengikuti desain "Menu / Navigation" ---------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-ink/55" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div className="tk-drawer absolute inset-y-0 left-0 flex w-[320px] max-w-[85vw] flex-col bg-ivory px-5 pt-7 pb-6 shadow-[12px_0_32px_rgba(0,0,0,0.25)]">
            <div className="mb-6 flex items-center justify-between">
              <Logo size={32} textClassName="text-xl text-ink" />
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setDrawerOpen(false)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-white hover:bg-ivory-alt"
              >
                <Icon name="close" size={15} strokeWidth={2} />
              </button>
            </div>

            <div className="mb-1.5 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
              {isAdmin ? "Kelola Toko" : "Belanja"}
            </div>
            <nav className="flex flex-col">
              {items.map((item) => {
                const active = activeView === item.view;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-ivory-alt ${active ? "bg-ivory-alt" : ""}`}
                  >
                    <Icon name={item.icon} size={18} className={active ? "text-coral" : "text-ink"} />
                    <span className={`flex-1 text-[15px] ${active ? "font-bold text-coral" : "font-semibold text-ink"}`}>
                      {item.label}
                    </span>
                    <Icon name="chevron" size={15} className="text-muted" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 mb-1.5 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">Website</div>
            <Link to="/" className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-ivory-alt">
              <Icon name="sparkle" size={18} />
              <span className="flex-1 text-[15px] font-semibold text-ink">Beranda TokoKu</span>
              <Icon name="chevron" size={15} className="text-muted" />
            </Link>

            <div className="flex-1" />
            <UserChip user={user} />
            <button type="button" onClick={handleLogout} className="mt-2 px-2 py-1 text-left text-[13px] font-semibold text-muted hover:underline">
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
