import { Router } from "express";
import db, { CATEGORIES } from "../db.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

// Baris database (snake_case) -> objek yang dipakai komponen React (camelCase)
export function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    stock: row.stock,
    description: row.description,
    imageUrl: row.image_url,
    estimatedDays: row.estimated_days,
    isActive: row.is_active === 1,
  };
}

const isWholeNumber = (value) => value !== "" && value !== null && Number.isInteger(Number(value));

// Aturan sama dengan validate() di web-admin/src/components/ProductForm.jsx.
// Mengembalikan pesan error pertama, atau null jika data valid.
function validateProduct(p) {
  const name = String(p.name ?? "").trim();
  if (!name) return "Nama produk wajib diisi";
  if (name.length < 3) return "Nama produk minimal 3 karakter";

  if (!p.category) return "Kategori wajib dipilih";
  if (!CATEGORIES.includes(p.category)) return "Kategori tidak dikenal";

  if (p.price === undefined || p.price === "" || p.price === null) return "Harga wajib diisi";
  if (!(Number(p.price) > 0)) return "Harga harus lebih dari 0";
  if (!isWholeNumber(p.price)) return "Harga harus bilangan bulat (rupiah)";

  if (p.stock === undefined || p.stock === "" || p.stock === null) return "Stok wajib diisi";
  if (Number(p.stock) < 0) return "Stok tidak boleh negatif";
  if (!isWholeNumber(p.stock)) return "Stok harus bilangan bulat";

  if (p.estimatedDays === undefined || p.estimatedDays === "" || p.estimatedDays === null) {
    return "Estimasi pengiriman wajib diisi";
  }
  if (!(Number(p.estimatedDays) > 0)) return "Estimasi harus lebih dari 0 hari";
  if (!isWholeNumber(p.estimatedDays)) return "Estimasi harus bilangan bulat";

  return null;
}

// Hanya field ini yang boleh dikirim dari form (id tidak bisa diubah lewat body)
const FIELDS = ["name", "category", "price", "stock", "description", "imageUrl", "estimatedDays", "isActive"];
const pickFields = (body = {}) => Object.fromEntries(FIELDS.filter((f) => f in body).map((f) => [f, body[f]]));

// Data yang sudah valid -> parameter untuk query INSERT/UPDATE
function toRow(p) {
  return {
    name: String(p.name).trim(),
    category: p.category,
    price: Number(p.price),
    stock: Number(p.stock),
    description: String(p.description ?? "").trim(),
    imageUrl: String(p.imageUrl ?? "").trim(),
    estimatedDays: Number(p.estimatedDays),
    isActive: p.isActive === false ? 0 : 1,
  };
}

const findProduct = db.prepare("SELECT * FROM products WHERE id = ?");

// Ambil produk dari :id, kirim 404 jika tidak ada. Produk nonaktif hanya terlihat oleh admin.
function getProductOr404(req, res) {
  const row = Number.isInteger(Number(req.params.id)) ? findProduct.get(Number(req.params.id)) : undefined;
  if (!row || (row.is_active === 0 && req.user?.role !== "administrator")) {
    res.status(404).json({ message: "Produk tidak ditemukan" });
    return null;
  }
  return row;
}

// GET /api/products — katalog publik hanya produk aktif; admin (dengan token) melihat semua
router.get("/", optionalAuth, (req, res) => {
  const isAdmin = req.user?.role === "administrator";
  const rows = db.prepare(`SELECT * FROM products ${isAdmin ? "" : "WHERE is_active = 1"} ORDER BY id`).all();
  res.json(rows.map(toProduct));
});

// GET /api/products/:id
router.get("/:id", optionalAuth, (req, res) => {
  const row = getProductOr404(req, res);
  if (row) res.json(toProduct(row));
});

// POST /api/products — tambah produk (admin)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const data = { isActive: true, ...pickFields(req.body) };
  const error = validateProduct(data);
  if (error) return res.status(400).json({ message: error });

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO products (name, category, price, stock, description, image_url, estimated_days, is_active)
      VALUES (@name, @category, @price, @stock, @description, @imageUrl, @estimatedDays, @isActive)
    `)
    .run(toRow(data));
  res.status(201).json(toProduct(findProduct.get(lastInsertRowid)));
});

// PUT /api/products/:id — ubah sebagian atau semua field (admin)
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const row = getProductOr404(req, res);
  if (!row) return;

  // field yang tidak dikirim tetap memakai nilai lama, lalu hasil gabungannya divalidasi ulang
  const data = { ...toProduct(row), ...pickFields(req.body) };
  const error = validateProduct(data);
  if (error) return res.status(400).json({ message: error });

  db.prepare(`
    UPDATE products
    SET name = @name, category = @category, price = @price, stock = @stock, description = @description,
        image_url = @imageUrl, estimated_days = @estimatedDays, is_active = @isActive
    WHERE id = @id
  `).run({ ...toRow(data), id: row.id });
  res.json(toProduct(findProduct.get(row.id)));
});

// DELETE /api/products/:id (admin)
// Produk yang sudah pernah dipesan tidak dihapus permanen (riwayat pesanan masih menunjuk ke produk ini),
// cukup dinonaktifkan agar hilang dari katalog.
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const row = getProductOr404(req, res);
  if (!row) return;

  const ordered = db.prepare("SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1").get(row.id);
  if (ordered) {
    db.prepare("UPDATE products SET is_active = 0 WHERE id = ?").run(row.id);
    return res.json({
      message: "Produk sudah pernah dipesan, jadi dinonaktifkan (disembunyikan dari katalog)",
      deleted: false,
      product: toProduct(findProduct.get(row.id)),
    });
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(row.id);
  res.json({ message: "Produk dihapus", deleted: true });
});

export default router;
