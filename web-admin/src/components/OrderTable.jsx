import { formatDate, formatRupiah } from "../utils/format";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

const TH = "px-3 py-2.5 text-left text-[11.5px] font-bold tracking-[0.05em] text-muted uppercase whitespace-nowrap";
const TD = "border-t border-[#F1EBDE] px-3 py-3.5 text-[13px] text-ink";

// Tabel pesanan masuk untuk Administrator
export default function OrderTable({ orders, showItems = false }) {
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
                <StatusBadge status={order.status} />
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
