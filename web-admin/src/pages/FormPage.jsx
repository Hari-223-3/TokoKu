import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import OrderForm from "../components/OrderForm";
import ProductForm from "../components/ProductForm";

// Satu halaman form, field menyesuaikan role:
// Administrator -> tambah/edit produk (?id=...), Client -> buat pesanan (?productId=...)
export default function FormPage() {
  const { isAdmin } = useAuth();
  const { products } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = Number(searchParams.get("id"));
  const product = isAdmin && editId ? products.find((p) => p.id === editId) : null;
  const notFound = isAdmin && editId && !product;

  const title = isAdmin ? (product ? "Edit Produk" : "Tambah Produk") : "Buat Pesanan";

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-border bg-white hover:bg-ivory-alt"
        >
          <Icon name="back" size={16} strokeWidth={2} />
        </button>
        <h1 className="font-display text-[26px] font-bold text-ink">{title}</h1>
      </div>

      {notFound ? (
        <EmptyState message="Produk tidak ditemukan" icon="box" />
      ) : isAdmin ? (
        // key memastikan form di-reset saat berpindah dari "edit" ke "tambah"
        <ProductForm key={product?.id ?? "new"} product={product} />
      ) : (
        <OrderForm key={searchParams.get("productId") ?? "new"} initialProductId={Number(searchParams.get("productId"))} />
      )}
    </>
  );
}
