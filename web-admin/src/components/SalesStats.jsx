import { useState } from "react";
import { useData } from "../context/DataContext";
import { ORDER_STATUSES } from "../data/orders";
import { addDays, formatDate, formatRupiah, toIsoDate } from "../utils/format";
import EmptyState from "./EmptyState";
import ProductThumb from "./ProductThumb";
import SectionCard from "./SectionCard";

// ---------------------------------------------------------------------------
// Halaman Statistik Penjualan (Administrator). Semua angka dihitung dari
// array pesanan di DataContext — belum ada database di tahap UTS.
// Pendapatan = pesanan yang sudah dibayar (status selain "Pending").
// ---------------------------------------------------------------------------

const PERIODS = [
  { key: "7", label: "7 hari terakhir", days: 7 },
  { key: "30", label: "30 hari terakhir", days: 30 },
  { key: "all", label: "Semua waktu", days: null },
];

// Warna grafik: coral = pendapatan; status = satu gradasi hijau, muda (Pending) -> tua (Selesai)
const REVENUE_COLOR = "#FF4E32";
const STATUS_COLORS = {
  Pending: "#CFE2D8",
  Dibayar: "#97BFAA",
  Diproses: "#629B81",
  Dikirim: "#3A745C",
  Selesai: "#1F4A3E",
};

const isPaid = (order) => order.status !== "Pending";
const sumRevenue = (orders) => orders.filter(isPaid).reduce((sum, o) => sum + o.totalAmount, 0);

// Rp1,2 jt / Rp500 rb — untuk label sumbu yang ringkas
const compactRupiah = (value) =>
  `Rp${new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

// Batas atas sumbu Y yang "bulat" (mis. 1.000.000, bukan 878.000), dibagi 4 garis
function niceScale(max) {
  if (max <= 0) return { top: 4, step: 1 };
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw);
  return { top: step * 4, step };
}

// Rentang tanggal [start, end] berdasarkan periode yang dipilih
function getRange(period, orders, today) {
  if (period.days) return { start: toIsoDate(addDays(new Date(`${today}T00:00:00`), -(period.days - 1))), end: today };
  const earliest = orders.reduce((min, o) => (o.createdAt < min ? o.createdAt : min), today);
  return { start: earliest, end: today };
}

function listDays(start, end) {
  const days = [];
  for (let d = new Date(`${start}T00:00:00`); toIsoDate(d) <= end; d = addDays(d, 1)) days.push(toIsoDate(d));
  return days;
}

const inRange = (orders, { start, end }) => orders.filter((o) => o.createdAt >= start && o.createdAt <= end);

// ---------------------------------------------------------------------------

function PeriodFilter({ value, onChange }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Pilih periode">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          aria-pressed={value === p.key}
          className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition ${
            value === p.key ? "border-ink bg-ink text-ivory" : "border-border bg-white text-ink hover:border-ink"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// Kartu angka + perbandingan dengan periode sebelumnya (panah + tanda, bukan warna saja)
function KpiTile({ label, value, current, previous, compareLabel }) {
  let delta = null;
  if (compareLabel && previous > 0) {
    const pct = ((current - previous) / previous) * 100;
    const up = pct >= 0;
    delta = (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
          up ? "bg-[#E1EAE5] text-forest" : "bg-[#F3E1DF] text-[#A83A3A]"
        }`}
      >
        {up ? "▲" : "▼"} {up ? "+" : ""}
        {pct.toFixed(1).replace(".", ",")}%
      </span>
    );
  }
  // periode sebelumnya tidak punya data -> tidak ada yang bisa dibandingkan
  const note = !compareLabel ? null : previous > 0 ? `vs ${compareLabel}` : `Belum ada data ${compareLabel}`;

  return (
    <div className="tk-lift tk-fade-up flex min-w-0 flex-col gap-2 rounded-card border border-border-soft bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-muted">{label}</span>
        {delta}
      </div>
      {/* ukuran huruf lebih kecil di HP agar angka panjang (Rp 5.140.000) tidak keluar kartu */}
      <div className="font-display text-[19px] leading-tight font-extrabold break-words text-ink sm:text-[26px]">{value}</div>
      {note && <div className="text-[11.5px] text-muted">{note}</div>}
    </div>
  );
}

// Grafik kolom pendapatan harian (satu seri -> tanpa legenda, judul kartu sudah menjelaskan)
function DailyRevenueChart({ days }) {
  const [hovered, setHovered] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...days.map((d) => d.revenue));
  const { top, step } = niceScale(max);
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const labelEvery = Math.ceil(days.length / 7);
  const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  if (max === 0) return <EmptyState message="Belum ada penjualan pada periode ini" icon="chart" />;

  return (
    <div className="p-5 sm:p-6">
      <div className="flex gap-3">
        {/* Sumbu Y */}
        <div className="relative h-56 w-14 shrink-0 text-right text-[11px] text-muted tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(t / top) * 100}%` }}>
              {t === 0 ? "0" : compactRupiah(t)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-56">
            {/* Garis grid tipis */}
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 h-px bg-[#EEE8DA]" style={{ bottom: `${(t / top) * 100}%` }} />
            ))}
            {/* Kolom: seluruh slot adalah area hover (lebih besar dari batangnya) */}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {days.map((d, i) => (
                <button
                  key={d.date}
                  type="button"
                  className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${formatDate(d.date)}: ${formatRupiah(d.revenue)}, ${d.orders} pesanan`}
                >
                  <span
                    className={`block w-full max-w-6 rounded-t-[4px] transition-opacity ${hovered !== null && hovered !== i ? "opacity-40" : ""}`}
                    style={{ height: `${(d.revenue / top) * 100}%`, minHeight: d.revenue > 0 ? 2 : 0, background: REVENUE_COLOR }}
                  />
                  {hovered === i && (
                    <span
                      role="tooltip"
                      className={`pointer-events-none absolute z-10 w-max rounded-xl bg-ink px-3 py-2 text-left shadow-lg ${
                        i < days.length / 2 ? "left-0" : "right-0"
                      }`}
                      style={{ bottom: `calc(${(d.revenue / top) * 100}% + 8px)` }}
                    >
                      <span className="block text-[13px] font-bold text-ivory">{formatRupiah(d.revenue)}</span>
                      <span className="block text-[11px] text-ivory/70">
                        {formatDate(d.date)} · {d.orders} pesanan
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Sumbu X: label tanggal secukupnya, tidak di setiap kolom */}
          <div className="mt-2 flex h-4 gap-[2px] text-[11px] text-muted">
            {days.map((d, i) => {
              const last = i === days.length - 1;
              // label biasa dilewati bila terlalu dekat dengan label terakhir (mencegah tabrakan)
              const regular = i % labelEvery === 0 && days.length - 1 - i >= labelEvery;
              // di layar kecil hanya tampil label ke-0, ke-2, ke-4, ... + label terakhir
              const mobileHidden = regular && (i / labelEvery) % 2 === 1 ? "hidden sm:block" : "";
              return (
                <span key={d.date} className="relative min-w-0 flex-1">
                  {(regular || last) && (
                    <span className={`absolute top-0 whitespace-nowrap ${last ? "right-0" : "left-1/2 -translate-x-1/2"} ${mobileHidden}`}>
                      {shortDate(d.date)}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tampilan tabel: semua nilai tetap bisa dibaca tanpa hover */}
      <button type="button" onClick={() => setShowTable((v) => !v)} className="mt-4 text-[12.5px] font-bold text-coral hover:underline">
        {showTable ? "Sembunyikan tabel data" : "Tampilkan tabel data"}
      </button>
      {showTable && (
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-border-soft">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-ivory-soft text-[11.5px] font-bold tracking-[0.05em] text-muted uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-right">Pesanan</th>
                <th className="px-4 py-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {days.map((d) => (
                <tr key={d.date} className="border-t border-[#F1EBDE]">
                  <td className="px-4 py-2 text-ink">{formatDate(d.date)}</td>
                  <td className="px-4 py-2 text-right text-muted">{d.orders}</td>
                  <td className="px-4 py-2 text-right font-semibold text-ink">{formatRupiah(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Batang horizontal pendapatan per kategori, nilai ditulis di ujung batang
function CategoryBars({ rows }) {
  if (rows.length === 0) return <EmptyState message="Belum ada penjualan pada periode ini" icon="box" />;
  const max = rows[0].revenue;

  return (
    <ul className="flex flex-col gap-3.5 p-5 sm:p-6">
      {rows.map((r) => (
        <li key={r.category} className="grid grid-cols-[104px_1fr] items-center gap-3">
          <span className="truncate text-[13px] font-semibold text-ink">{r.category}</span>
          <div className="flex items-center gap-2" title={`${r.category}: ${formatRupiah(r.revenue)}`}>
            {/* maks 70% lebar agar label nilai selalu muat di luar ujung batang */}
            <span className="block h-5 rounded-r-[4px]" style={{ width: `${(r.revenue / max) * 70}%`, background: REVENUE_COLOR }} />
            <span className="text-[12.5px] font-semibold whitespace-nowrap text-ink tabular-nums">{compactRupiah(r.revenue)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Satu batang bertumpuk: komposisi status pesanan (bagian dari keseluruhan)
function StatusComposition({ counts, total }) {
  const [hovered, setHovered] = useState(null);
  if (total === 0) return <EmptyState message="Belum ada pesanan masuk" icon="inbox" />;
  const pct = (n) => `${Math.round((n / total) * 100)}%`;
  const present = ORDER_STATUSES.filter((s) => counts[s] > 0);

  return (
    <div className="p-5 sm:p-6">
      <div className="relative">
        <div className="flex h-6 gap-[2px] overflow-hidden rounded-[4px] bg-white">
          {present.map((s) => (
            <button
              key={s}
              type="button"
              className={`h-full min-w-[6px] outline-none transition-opacity ${hovered && hovered !== s ? "opacity-50" : ""}`}
              style={{ width: pct(counts[s]), background: STATUS_COLORS[s] }}
              onPointerEnter={() => setHovered(s)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(s)}
              onBlur={() => setHovered(null)}
              aria-label={`${s}: ${counts[s]} pesanan (${pct(counts[s])})`}
            />
          ))}
        </div>
        {hovered && (
          <div role="tooltip" className="pointer-events-none absolute -top-12 left-1/2 w-max -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-center">
            <span className="block text-[13px] font-bold text-ivory">
              {counts[hovered]} pesanan · {pct(counts[hovered])}
            </span>
            <span className="block text-[11px] text-ivory/70">{hovered}</span>
          </div>
        )}
      </div>

      {/* Legenda selalu tampil: identitas tidak bergantung pada warna saja */}
      <ul className="mt-5 flex flex-col gap-2.5">
        {ORDER_STATUSES.map((s) => (
          <li key={s} className="flex items-center gap-2.5 text-[13px]">
            <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: STATUS_COLORS[s] }} aria-hidden="true" />
            <span className="flex-1 text-ink">{s}</span>
            <span className="font-bold text-ink tabular-nums">{counts[s]}</span>
            <span className="w-10 text-right text-muted tabular-nums">{pct(counts[s])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopProductsTable({ rows }) {
  if (rows.length === 0) return <EmptyState message="Belum ada produk terjual pada periode ini" icon="tag" />;
  const TH = "px-3 py-2.5 text-[11.5px] font-bold tracking-[0.05em] text-muted uppercase whitespace-nowrap";
  const TD = "border-t border-[#F1EBDE] px-3 py-3 text-[13px] text-ink";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-ivory-soft">
          <tr>
            <th className={`${TH} w-8 pl-5 text-left sm:w-10 sm:pl-6`}>#</th>
            <th className={`${TH} text-left`}>Produk</th>
            <th className={`${TH} text-right`}>Unit</th>
            <th className={`${TH} pr-5 text-right sm:pr-6`}>Pendapatan</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r, i) => (
            <tr key={r.productId} className="hover:bg-ivory-soft">
              <td className={`${TD} pl-5 font-display font-bold text-muted sm:pl-6`}>{i + 1}</td>
              <td className={TD}>
                <div className="flex items-center gap-3">
                  {r.product && <ProductThumb product={r.product} className="hidden h-9 w-9 shrink-0 rounded-[10px] sm:block" iconSize={14} />}
                  <span className="font-bold">{r.name}</span>
                </div>
              </td>
              <td className={`${TD} text-right`}>{r.qty}</td>
              <td className={`${TD} pr-5 text-right font-bold sm:pr-6`}>{formatRupiah(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function SalesStats() {
  const { orders, products } = useData();
  const [periodKey, setPeriodKey] = useState("30");
  const period = PERIODS.find((p) => p.key === periodKey);
  const today = toIsoDate(new Date());

  // Semua perhitungan memakai irisan data yang sama, jadi angka di setiap kartu selalu cocok
  const range = getRange(period, orders, today);
  const current = inRange(orders, range);
  const paid = current.filter(isPaid);

  // Periode sebelumnya (panjang sama) untuk perbandingan — hanya untuk 7/30 hari
  let previous = null;
  if (period.days) {
    const prevEnd = toIsoDate(addDays(new Date(`${range.start}T00:00:00`), -1));
    const prevStart = toIsoDate(addDays(new Date(`${prevEnd}T00:00:00`), -(period.days - 1)));
    previous = inRange(orders, { start: prevStart, end: prevEnd });
  }
  const compareLabel = period.days ? `${period.days} hari sebelumnya` : null;

  const revenue = sumRevenue(current);
  const unitsOf = (list) => list.filter(isPaid).reduce((n, o) => n + o.items.reduce((m, i) => m + i.qty, 0), 0);
  const avgOf = (list) => {
    const p = list.filter(isPaid);
    return p.length ? sumRevenue(list) / p.length : 0;
  };

  const days = listDays(range.start, range.end).map((date) => {
    const ofDay = current.filter((o) => o.createdAt === date);
    return { date, revenue: sumRevenue(ofDay), orders: ofDay.length };
  });

  const categoryOf = (productId) => products.find((p) => p.id === productId)?.category ?? "Lainnya";
  const byCategory = {};
  const byProduct = {};
  paid.forEach((o) =>
    o.items.forEach((item) => {
      const amount = item.priceAtPurchase * item.qty;
      const cat = categoryOf(item.productId);
      byCategory[cat] = (byCategory[cat] ?? 0) + amount;
      const row = (byProduct[item.productId] ??= { productId: item.productId, name: item.productName, qty: 0, revenue: 0 });
      row.qty += item.qty;
      row.revenue += amount;
    })
  );
  const categoryRows = Object.entries(byCategory)
    .map(([category, value]) => ({ category, revenue: value }))
    .sort((a, b) => b.revenue - a.revenue);
  const topProducts = Object.values(byProduct)
    .map((r) => ({ ...r, product: products.find((p) => p.id === r.productId) }))
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, 5);

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, current.filter((o) => o.status === s).length]));

  return (
    <>
      <PeriodFilter value={periodKey} onChange={setPeriodKey} />
      <p className="-mt-2 mb-5 text-[12.5px] text-muted">
        {formatDate(range.start)} – {formatDate(range.end)} · pendapatan dihitung dari pesanan yang sudah dibayar
      </p>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiTile label="Pendapatan" value={formatRupiah(revenue)} current={revenue} previous={previous && sumRevenue(previous)} compareLabel={compareLabel} />
          <KpiTile label="Jumlah pesanan" value={current.length} current={current.length} previous={previous?.length} compareLabel={compareLabel} />
          <KpiTile label="Rata-rata per pesanan" value={formatRupiah(Math.round(avgOf(current)))} current={avgOf(current)} previous={previous && avgOf(previous)} compareLabel={compareLabel} />
          <KpiTile label="Unit terjual" value={unitsOf(current)} current={unitsOf(current)} previous={previous && unitsOf(previous)} compareLabel={compareLabel} />
        </div>

        <SectionCard title="Pendapatan harian">
          <DailyRevenueChart days={days} />
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Pendapatan per kategori">
            <CategoryBars rows={categoryRows} />
          </SectionCard>
          <SectionCard title={`Status pesanan (${current.length})`}>
            <StatusComposition counts={statusCounts} total={current.length} />
          </SectionCard>
        </div>

        <SectionCard title="Produk terlaris">
          <TopProductsTable rows={topProducts} />
        </SectionCard>
      </div>
    </>
  );
}

