import { Link } from "react-router-dom";
import { LOW_STOCK_LIMIT } from "../data/products";
import { formatRupiah } from "../utils/format";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import ProductThumb from "./ProductThumb";

const TH = "px-3 py-2.5 text-left text-[11.5px] font-bold tracking-[0.05em] text-muted uppercase whitespace-nowrap";
const TD = "border-t border-[#F1EBDE] px-3 py-3 text-[13px] text-ink";

function StockCell({ stock }) {
  if (stock === 0) return <span className="font-bold text-coral">Habis</span>;
  if (stock <= LOW_STOCK_LIMIT)
    return <span className="rounded-full bg-[#FBE3DC] px-2 py-0.5 text-[12px] font-bold text-[#A83A21]">{stock} · kritis</span>;
  return <span className="font-semibold">{stock}</span>;
}

// Tabel produk untuk Administrator
export default function ProductTable({ products, emptyMessage = "Produk tidak ditemukan" }) {
  if (products.length === 0) {
    return <EmptyState message={emptyMessage} icon="box" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="bg-ivory-soft">
          <tr>
            <th className={`${TH} pl-5 sm:pl-6`}>Produk</th>
            <th className={TH}>Kategori</th>
            <th className={`${TH} text-right`}>Harga</th>
            <th className={TH}>Stok</th>
            <th className={TH}>Estimasi Kirim</th>
            <th className={TH}>Status</th>
            <th className={`${TH} pr-5 sm:pr-6`}>
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-ivory-soft">
              <td className={`${TD} pl-5 sm:pl-6`}>
                <div className="flex items-center gap-3">
                  <ProductThumb product={p} className="h-10 w-10 shrink-0 rounded-[10px]" iconSize={16} />
                  <span className="font-bold">{p.name}</span>
                </div>
              </td>
              <td className={`${TD} whitespace-nowrap text-muted`}>{p.category}</td>
              <td className={`${TD} text-right font-semibold whitespace-nowrap`}>{formatRupiah(p.price)}</td>
              <td className={`${TD} whitespace-nowrap`}>
                <StockCell stock={p.stock} />
              </td>
              <td className={`${TD} whitespace-nowrap text-muted`}>{p.estimatedDays} hari</td>
              <td className={TD}>
                {p.isActive ? (
                  <span className="rounded-full bg-[#E1EAE5] px-2.5 py-1 text-[11px] font-bold text-forest">Aktif</span>
                ) : (
                  <span className="rounded-full bg-ivory-alt px-2.5 py-1 text-[11px] font-bold text-muted">Nonaktif</span>
                )}
              </td>
              <td className={`${TD} pr-5 text-right sm:pr-6`}>
                <Link
                  to={`/form?id=${p.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-ink hover:border-ink"
                >
                  <Icon name="edit" size={13} /> Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
