import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { CATEGORIES } from "../data/products";
import { formatRupiah } from "../utils/format";
import FormField, { SubmitButton, SuccessPanel, primaryLinkClass, secondaryLinkClass } from "./FormField";
import ProductThumb from "./ProductThumb";

const EMPTY = {
  name: "",
  category: "",
  price: "",
  stock: "",
  estimatedDays: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Nama produk wajib diisi";
  else if (name.length < 3) errors.name = "Nama produk minimal 3 karakter";

  if (!values.category) errors.category = "Kategori wajib dipilih";

  if (values.price === "") errors.price = "Harga wajib diisi";
  else if (Number(values.price) <= 0) errors.price = "Harga harus lebih dari 0";

  if (values.stock === "") errors.stock = "Stok wajib diisi";
  else if (Number(values.stock) < 0) errors.stock = "Stok tidak boleh negatif";
  else if (!Number.isInteger(Number(values.stock))) errors.stock = "Stok harus bilangan bulat";

  if (values.estimatedDays === "") errors.estimatedDays = "Estimasi pengiriman wajib diisi";
  else if (Number(values.estimatedDays) <= 0) errors.estimatedDays = "Estimasi harus lebih dari 0 hari";
  else if (!Number.isInteger(Number(values.estimatedDays))) errors.estimatedDays = "Estimasi harus bilangan bulat";

  return errors;
}

// Form Administrator — Tambah / Edit Produk
export default function ProductForm({ product }) {
  const { addProduct, updateProduct } = useData();
  const isEdit = Boolean(product);

  const initial = product
    ? { ...product, price: String(product.price), stock: String(product.stock), estimatedDays: String(product.estimatedDays) }
    : EMPTY;
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // hapus error field saat user mulai memperbaiki
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setTimeout(() => {
      const data = {
        name: values.name.trim(),
        category: values.category,
        price: Number(values.price),
        stock: Number(values.stock),
        estimatedDays: Number(values.estimatedDays),
        description: values.description.trim(),
        imageUrl: values.imageUrl.trim(),
        isActive: values.isActive,
      };
      if (isEdit) updateProduct(product.id, data);
      else addProduct(data);
      setSaving(false);
      setSaved(true);
    }, 700);
  }

  if (saved) {
    return (
      <SuccessPanel
        title={isEdit ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan"}
        actions={
          <>
            <Link to="/dashboard?view=produk" className={primaryLinkClass}>
              Lihat daftar produk
            </Link>
            <Link to="/katalog" className={secondaryLinkClass}>
              Lihat di katalog publik
            </Link>
            {!isEdit && (
              <button
                type="button"
                className={secondaryLinkClass}
                onClick={() => {
                  setValues(EMPTY);
                  setSaved(false);
                }}
              >
                Tambah lagi
              </button>
            )}
          </>
        }
      >
        <b className="text-ink">{values.name}</b> sudah tersimpan dan langsung tampil di katalog. Data hanya tersimpan
        sementara dan akan kembali seperti semula saat halaman di-refresh.
      </SuccessPanel>
    );
  }

  const invalid = (field) => ({ "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `${field}-error` : undefined });
  const preview = { ...values, id: product?.id ?? 0, price: Number(values.price) || 0 };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="tk-fade-up flex flex-col gap-4 rounded-card border border-border-soft bg-white p-5 sm:p-7">
        <FormField id="name" label="Nama produk" error={errors.name}>
          <input id="name" name="name" value={values.name} onChange={handleChange} placeholder="mis. Kemeja Linen, Ivory" className="tk-input h-[46px]" {...invalid("name")} />
        </FormField>

        <FormField id="category" label="Kategori" error={errors.category}>
          <select id="category" name="category" value={values.category} onChange={handleChange} className="tk-input h-[46px]" {...invalid("category")}>
            <option value="">Pilih kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="price" label="Harga (Rp)" error={errors.price}>
            <input id="price" name="price" type="number" min="0" inputMode="numeric" value={values.price} onChange={handleChange} placeholder="250000" className="tk-input h-[46px]" {...invalid("price")} />
          </FormField>
          <FormField id="stock" label="Stok" error={errors.stock}>
            <input id="stock" name="stock" type="number" min="0" inputMode="numeric" value={values.stock} onChange={handleChange} placeholder="20" className="tk-input h-[46px]" {...invalid("stock")} />
          </FormField>
          <FormField id="estimatedDays" label="Estimasi kirim (hari)" error={errors.estimatedDays}>
            <input id="estimatedDays" name="estimatedDays" type="number" min="1" inputMode="numeric" value={values.estimatedDays} onChange={handleChange} placeholder="3" className="tk-input h-[46px]" {...invalid("estimatedDays")} />
          </FormField>
        </div>

        <FormField id="description" label="Deskripsi" optional>
          <textarea id="description" name="description" rows={4} value={values.description} onChange={handleChange} placeholder="Bahan, ukuran, warna yang tersedia..." className="tk-input py-3" />
        </FormField>

        <FormField id="imageUrl" label="URL gambar" optional hint="Kosongkan untuk memakai placeholder bawaan.">
          <input id="imageUrl" name="imageUrl" type="url" value={values.imageUrl} onChange={handleChange} placeholder="https://..." className="tk-input h-[46px]" />
        </FormField>

        <label className="flex items-center gap-2.5 text-[13.5px] font-medium text-ink">
          <input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} className="h-[18px] w-[18px] accent-ink" />
          Tampilkan produk di katalog (aktif)
        </label>
      </div>

      {/* Pratinjau kartu produk + tombol simpan */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-card border border-border-soft bg-white p-4">
          <div className="mb-3 text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Pratinjau</div>
          <ProductThumb key={values.imageUrl} product={preview} className="mb-3 aspect-[4/5] w-full rounded-2xl" iconSize={40} />
          <div className="text-[11.5px] font-semibold text-muted">{values.category || "Kategori"}</div>
          <div className="text-[14px] font-bold text-ink">{values.name || "Nama produk"}</div>
          <div className="mt-1 font-display text-[16px] font-extrabold text-ink">{formatRupiah(preview.price)}</div>
        </div>
        <SubmitButton loading={saving} className="w-full">
          {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
        </SubmitButton>
        <Link to="/dashboard?view=produk" className="text-center text-sm font-semibold text-muted hover:underline">
          Batal
        </Link>
      </aside>
    </form>
  );
}
