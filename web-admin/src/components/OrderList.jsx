import { formatDate, formatRupiah } from "../utils/format";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import StatusBadge from "./StatusBadge";

// Daftar pesanan milik client, bergaya kartu "Recent orders" pada desain Account
export default function OrderList({ orders }) {
  if (orders.length === 0) {
    return <EmptyState message="Anda belum memiliki pesanan" icon="bag" />;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {orders.map((order) => {
        const [first, ...rest] = order.items;
        return (
          <li
            key={order.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 transition-colors hover:border-ink sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ECE5D8] text-muted">
                <Icon name="shirt" size={20} strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-bold text-ink">
                  {order.orderNumber} · {first.productName}
                  {first.qty > 1 && ` (×${first.qty})`}
                  {rest.length > 0 && ` +${rest.length} item lain`}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  Dipesan {formatDate(order.createdAt)} · {order.shippingMethod}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 pl-[60px] sm:justify-end sm:pl-0">
              <div className="text-left sm:text-right">
                <div className="text-[13.5px] font-bold text-ink">{formatRupiah(order.totalAmount)}</div>
                <div className="flex items-center gap-1 text-[11.5px] text-muted sm:justify-end">
                  <Icon name="truck" size={13} />
                  {order.status === "Selesai" ? "Tiba" : "Estimasi tiba"} {formatDate(order.estimatedArrival)}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
