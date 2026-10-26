import { useState } from "react";
import { useData } from "../context/DataContext";
import { ORDER_STATUSES } from "../data/orders";
import { formatDate, formatRupiah } from "../utils/format";
import EmptyState from "./EmptyState";
import StatusBadge, { STATUS_COLORS } from "./StatusBadge";

const TH = "px-3 py-2.5 text-left text-[11.5px] font-bold tracking-[0.05em] text-muted uppercase whitespace-nowrap";
const TD = "border-t border-[#F1EBDE] px-3 py-3.5 text-[13px] text-ink";

// Dropdown untuk mengubah status pesanan (PATCH /api/orders/:id/status), warnanya sama dengan StatusBadge
function StatusSelect({ order }) {
  const { updateOrderStatus } = useData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    setSaving(true);
    setError("");
    try {
      await updateOrderStatus(order.id, e.target.value);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <select
        value={order.status}
        onChange={handleChange}
        disabled={saving}
        aria-label={`Ubah status pesanan ${order.orderNumber}`}
        className={`cursor-pointer rounded-full border-0 py-1 pr-1.5 pl-2.5 text-[11px] font-bold outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${STATUS_COLORS[order.status]}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s} className="bg-white text-ink">
            {s}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 max-w-[160px] text-[11px] font-semibold text-coral">{error}</p>}
    </>
  );
}

// Tabel pesanan masuk untuk Administrator. statusEditable -> status bisa diubah lewat dropdown.
export default function OrderTable({ orders, showItems = false, statusEditable = false }) {
  if (orders.length === 0) {
    return <EmptyState message="Belum ada pesanan masuk" icon="inbox" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead className="bg-ivory-soft">
          <tr>
            <th className={`${TH} pl-5 sm:pl-6`}>No. Pesanan</th>
            <th className={TH}>Pembeli</th>
            {showItems && <th className={TH}>Item</th>}
            <th className={TH}>Status</th>
            <th className={TH}>Tanggal</th>
            <th className={`${TH} pr-5 text-right sm:pr-6`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-ivory-soft">
              <td className={`${TD} pl-5 font-bold whitespace-nowrap sm:pl-6`}>{order.orderNumber}</td>
              <td className={TD}>{order.customerName}</td>
              {showItems && (
                <td className={`${TD} text-muted`}>
                  {order.items.map((i) => `${i.productName} ×${i.qty}`).join(", ")}
                  <div className="mt-0.5 text-[11.5px]">{order.shippingMethod}</div>
                </td>
              )}
              <td className={TD}>
                {statusEditable ? <StatusSelect order={order} /> : <StatusBadge status={order.status} />}
              </td>
              <td className={`${TD} whitespace-nowrap text-muted`}>{formatDate(order.createdAt)}</td>
              <td className={`${TD} pr-5 text-right font-bold whitespace-nowrap sm:pr-6`}>{formatRupiah(order.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
