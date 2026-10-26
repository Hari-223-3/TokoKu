import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatRupiah, initials } from "../utils/format";
import OrderList from "./OrderList";
import ProductCatalog from "./ProductCatalog";
import StatCard from "./StatCard";

function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-xs font-bold tracking-[0.08em] text-muted uppercase">{children}</h2>
      {action}
    </div>
  );
}

export default function ClientDashboard({ view }) {
  const { user } = useAuth();
  const { products, orders } = useData();

  // Client hanya melihat pesanan miliknya sendiri
  const myOrders = orders.filter((o) => o.customerId === user.id);
  const inProgress = myOrders.filter((o) => o.status !== "Selesai").length;
  const totalSpent = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  if (view === "katalog") {
    return (
      <>
        <h1 className="mb-1 font-display text-[26px] font-bold text-ink">Katalog Produk</h1>
        <p className="mb-6 text-sm text-muted">Koleksi fashion pilihan TokoKu — pakaian, sepatu, tas, dan aksesoris.</p>
        <ProductCatalog products={products} />
      </>
    );
  }

  if (view === "pesanan") {
    return (
      <>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-bold text-ink">Pesanan Saya</h1>
            <p className="mt-0.5 text-sm text-muted">
              {myOrders.length} pesanan · {inProgress} sedang diproses
            </p>
          </div>
          <Link to="/form" className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-ivory transition hover:-translate-y-px hover:bg-ink-hover">
            Buat Pesanan
          </Link>
        </div>
        <OrderList orders={myOrders} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        {/* Kartu profil bergaya desain Account */}
        <div className="tk-fade-up flex items-center gap-3.5 rounded-[22px] bg-ink p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF4E32,#2F5D50)] font-display text-lg font-extrabold text-ivory">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-ivory/60">Halo,</div>
            <div className="truncate font-display text-[19px] font-bold text-ivory">{user.name}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:contents">
          <StatCard label="Pesanan Saya" value={myOrders.length} />
          <StatCard label="Sedang Diproses" value={inProgress} hint={inProgress > 0 ? "aktif" : undefined} tone="warning" />
        </div>
        <StatCard label="Total Belanja" value={formatRupiah(totalSpent)} />
      </div>

      <section>
        <SectionTitle
          action={
            myOrders.length > 3 && (
              <Link to="/dashboard?view=pesanan" className="text-xs font-bold text-coral hover:underline">
                Lihat semua
              </Link>
            )
          }
        >
          Pesanan terbaru
        </SectionTitle>
        <OrderList orders={myOrders.slice(0, 3)} />
      </section>

      <section>
        <SectionTitle>Katalog produk</SectionTitle>
        <ProductCatalog products={products} limit={8} />
      </section>
    </div>
  );
}
