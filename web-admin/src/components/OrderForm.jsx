import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { SHIPPING_METHODS } from "../data/orders";
import { addDays, formatDate, formatRupiah, toIsoDate } from "../utils/format";
import FormField, { SubmitButton, SuccessPanel, primaryLinkClass, secondaryLinkClass } from "./FormField";
import ProductThumb from "./ProductThumb";

// Pengiriman express 1 hari lebih cepat dari estimasi produk (minimal 1 hari)
const FAST_METHODS = ["JNE Express", "SiCepat"];

function estimateDays(product, method) {
  return FAST_METHODS.includes(method) ? Math.max(1, product.estimatedDays - 1) : product.estimatedDays;
}

function arrivalDate(product, method) {
  return toIsoDate(addDays(new Date(), estimateDays(product, method)));
}

function validate(values, product) {
  const errors = {};
  if (!values.productId) errors.productId = "Produk wajib dipilih";

  const qty = Number(values.qty);
  if (values.qty === "") errors.qty = "Jumlah wajib diisi";
  else if (!Number.isInteger(qty) || qty < 1) errors.qty = "Jumlah minimal 1";
  else if (product && qty > product.stock) errors.qty = "Stok tidak mencukupi";

  if (!values.shippingAddress.trim()) errors.shippingAddress = "Alamat pengiriman wajib diisi";
  if (!values.shippingMethod) errors.shippingMethod = "Metode pengiriman wajib dipilih";
  return errors;
}

// Form Client — Buat Pesanan (mengikuti desain Checkout / Shipping form)
export default function OrderForm({ initialProductId }) {
  const { user } = useAuth();
  const { products, orders, addOrder } = useData();
  const available = products.filter((p) => p.isActive);

  // alamat terakhir client dipakai sebagai isian awal
  const lastAddress = orders.find((o) => o.customerId === user.id)?.shippingAddress ?? "";
  const initialProduct = available.find((p) => p.id === initialProductId && p.stock > 0);

  const [values, setValues] = useState({
    productId: initialProduct ? String(initialProduct.id) : "",
    qty: "1",
    shippingAddress: lastAddress,
    shippingMethod: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const product = products.find((p) => p.id === Number(values.productId));
  const qty = Number(values.qty) || 0;
  const total = product ? product.price * qty : 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values, product);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setTimeout(() => {
      const order = addOrder({
        customerId: user.id,
        customerName: user.name,
        items: [{ productId: product.id, productName: product.name, qty, priceAtPurchase: product.price }],
        totalAmount: product.price * qty,
        status: "Pending",
        shippingMethod: values.shippingMethod,
        shippingAddress: values.shippingAddress.trim(),
        estimatedArrival: arrivalDate(product, values.shippingMethod),
        notes: values.notes.trim(),
      });
      setSaving(false);
      setCreatedOrder(order);
    }, 700);
  }

  if (createdOrder) {
    return (
      <SuccessPanel
        title="Pesanan berhasil dibuat"
        actions={
          <>
            <Link to="/dashboard?view=pesanan" className={primaryLinkClass}>
              Lihat Pesanan Saya
            </Link>
            <Link to="/katalog" className={secondaryLinkClass}>
              Lanjut belanja
            </Link>
          </>
        }
      >
        Nomor pesanan <b className="text-ink">{createdOrder.orderNumber}</b> senilai{" "}
        <b className="text-ink">{formatRupiah(createdOrder.totalAmount)}</b>. Estimasi tiba {formatDate(createdOrder.estimatedArrival)} via{" "}
        {createdOrder.shippingMethod}.
      </SuccessPanel>
    );
  }

  const invalid = (field) => ({ "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `${field}-error` : undefined });

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="tk-fade-up flex flex-col gap-4 rounded-card border border-border-soft bg-white p-5 sm:p-7">
        <p className="-mt-1 text-[13.5px] leading-relaxed text-muted">Pilih produk dan ke mana pesanan harus dikirim.</p>

        <FormField id="productId" label="Pilih produk" error={errors.productId}>
          <select id="productId" name="productId" value={values.productId} onChange={handleChange} className="tk-input h-[46px]" {...invalid("productId")}>
            <option value="">Pilih produk</option>
            {available.map((p) => (
              <option key={p.id} value={p.id} disabled={p.stock === 0}>
                {p.name} — {formatRupiah(p.price)} {p.stock === 0 ? "(habis)" : ""}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="qty" label="Jumlah" error={errors.qty} hint={product ? `Stok tersedia: ${product.stock}` : undefined}>
          <input id="qty" name="qty" type="number" min="1" max={product?.stock} inputMode="numeric" value={values.qty} onChange={handleChange} className="tk-input h-[46px] sm:max-w-[160px]" {...invalid("qty")} />
        </FormField>

        <FormField id="shippingAddress" label="Alamat pengiriman" error={errors.shippingAddress}>
          <textarea id="shippingAddress" name="shippingAddress" rows={3} value={values.shippingAddress} onChange={handleChange} placeholder="Nama jalan, nomor rumah, kota" className="tk-input py-3" {...invalid("shippingAddress")} />
        </FormField>

        <FormField id="shippingMethod" label="Metode pengiriman" error={errors.shippingMethod}>
          <select id="shippingMethod" name="shippingMethod" value={values.shippingMethod} onChange={handleChange} className="tk-input h-[46px]" {...invalid("shippingMethod")}>
            <option value="">Pilih kurir</option>
            {SHIPPING_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </FormField>

        <FormField id="notes" label="Catatan" optional>
          <textarea id="notes" name="notes" rows={2} value={values.notes} onChange={handleChange} placeholder="mis. ukuran L, warna hitam" className="tk-input py-3" />
        </FormField>
      </div>

      {/* Ringkasan pesanan + CTA, seperti bar bawah pada desain checkout */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-card border border-border-soft bg-white p-5">
          <div className="mb-3 text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Ringkasan</div>
          {product ? (
            <div className="mb-4 flex items-center gap-3">
              <ProductThumb product={product} className="h-14 w-14 shrink-0 rounded-xl" iconSize={20} />
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-bold text-ink">{product.name}</div>
                <div className="text-xs text-muted">
                  {qty} × {formatRupiah(product.price)}
                </div>
              </div>
            </div>
          ) : (
            <p className="mb-4 text-sm text-muted">Belum ada produk dipilih.</p>
          )}
          {product && values.shippingMethod && (
            <div className="mb-3 flex justify-between text-[13px] text-muted">
              <span>Estimasi tiba</span>
              <span className="font-semibold text-ink">{formatDate(arrivalDate(product, values.shippingMethod))}</span>
            </div>
          )}
          <div className="flex items-end justify-between border-t border-[#EEE8DA] pt-3">
            <span className="text-xs text-muted">Total pesanan</span>
            <span className="font-display text-[20px] font-extrabold text-ink">{formatRupiah(total)}</span>
          </div>
        </div>
        <SubmitButton loading={saving} className="w-full">
          Buat Pesanan
        </SubmitButton>
        <Link to="/katalog" className="text-center text-sm font-semibold text-muted hover:underline">
          Kembali ke katalog
        </Link>
      </aside>
    </form>
  );
}
