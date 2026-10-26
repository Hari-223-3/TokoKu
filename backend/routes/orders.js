import { Router } from "express";
import db, { ORDER_STATUSES, SHIPPING_METHODS } from "../db.js";
import { requireAdmin, requireAuth, requireClient } from "../middleware/auth.js";

const router = Router();

// ---------------------------------------------------------------------------
// Tanggal & estimasi tiba (dipindah dari OrderForm.jsx agar dihitung di server)
// ---------------------------------------------------------------------------

// Date -> "2026-09-05" (tanggal lokal server, bukan UTC)
function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

// Pengiriman express 1 hari lebih cepat dari estimasi produk (minimal 1 hari)
const FAST_METHODS = ["JNE Express", "SiCepat"];

function estimateDays(product, method) {
  return FAST_METHODS.includes(method) ? Math.max(1, product.estimated_days - 1) : product.estimated_days;
}

// ---------------------------------------------------------------------------
// Membaca pesanan + item-nya dalam bentuk camelCase untuk web
// ---------------------------------------------------------------------------

function toOrder(row, items) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    items: items.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      qty: i.qty,
      priceAtPurchase: i.price_at_purchase,
    })),
    totalAmount: row.total_amount,
    status: row.status,
    shippingMethod: row.shipping_method,
    shippingAddress: row.shipping_address,
    estimatedArrival: row.estimated_arrival,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// `where` memakai alias o (tabel orders). Item diambil dengan satu query lalu dikelompokkan per pesanan.
function findOrders(where = "", params = []) {
  const rows = db
    .prepare(`
      SELECT o.*, u.name AS customer_name
      FROM orders o JOIN users u ON u.id = o.customer_id
      ${where}
      ORDER BY o.id DESC
    `)
    .all(...params);
  const items = db
    .prepare(`SELECT oi.* FROM order_items oi JOIN orders o ON o.id = oi.order_id ${where} ORDER BY oi.id`)
    .all(...params);
  return rows.map((row) => toOrder(row, items.filter((i) => i.order_id === row.id)));
}

const findOrder = (id) => findOrders("WHERE o.id = ?", [id])[0];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/orders — semua pesanan, terbaru di atas (admin)
router.get("/", requireAuth, requireAdmin, (req, res) => {
  res.json(findOrders());
});

// GET /api/orders/mine — hanya pesanan milik client yang sedang login
router.get("/mine", requireAuth, requireClient, (req, res) => {
  res.json(findOrders("WHERE o.customer_id = ?", [req.user.id]));
});

// Error yang sengaja dilempar dari dalam transaksi -> dikirim sebagai 400
class OrderError extends Error {}

const findProduct = db.prepare("SELECT * FROM products WHERE id = ?");
const reduceStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
const insertOrder = db.prepare(`
  INSERT INTO orders (id, order_number, customer_id, total_amount, status, shipping_method,
                      shipping_address, estimated_arrival, notes, created_at)
  VALUES (@id, @orderNumber, @customerId, @totalAmount, 'Pending', @shippingMethod,
          @shippingAddress, @estimatedArrival, @notes, @createdAt)
`);
const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, product_name, qty, price_at_purchase)
  VALUES (?, ?, ?, ?, ?)
`);

// Semua langkah dalam SATU transaksi: cek stok, simpan pesanan, kurangi stok.
// Jika ada satu item yang gagal, semuanya dibatalkan (stok tidak berkurang setengah-setengah).
const createOrder = db.transaction((customerId, items, shipping) => {
  const lines = items.map(({ productId, qty }) => {
    const product = findProduct.get(productId);
    if (!product || product.is_active === 0) throw new OrderError(`Produk #${productId} tidak tersedia`);
    if (product.stock < qty) throw new OrderError(`Stok ${product.name} tidak mencukupi (sisa ${product.stock})`);
    return { product, qty };
  });

  const today = new Date();
  const createdAt = toIsoDate(today);
  // Nama & harga diambil dari database, bukan dari browser
  const totalAmount = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  // Pesanan berisi beberapa produk tiba bersamaan -> pakai estimasi yang paling lama
  const days = Math.max(...lines.map((l) => estimateDays(l.product, shipping.method)));

  const id = db.prepare("SELECT COALESCE(MAX(id), 0) + 1 AS next FROM orders").get().next;
  // format nomor: INV-YYYYMMDD-XXX (sama dengan data lama)
  const orderNumber = `INV-${createdAt.replaceAll("-", "")}-${String(id).padStart(3, "0")}`;

  insertOrder.run({
    id,
    orderNumber,
    customerId,
    totalAmount,
    shippingMethod: shipping.method,
    shippingAddress: shipping.address,
    estimatedArrival: toIsoDate(addDays(today, days)),
    notes: shipping.notes,
    createdAt,
  });
  for (const { product, qty } of lines) {
    insertItem.run(id, product.id, product.name, qty, product.price);
    reduceStock.run(qty, product.id);
  }
  return id;
});

// POST /api/orders — client membuat pesanan.
// Body: { items: [{ productId, qty }], shippingMethod, shippingAddress, notes }
router.post("/", requireAuth, requireClient, (req, res) => {
  const { items, shippingMethod, shippingAddress, notes = "" } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Pesanan harus berisi minimal 1 produk" });
  }
  // produk yang sama dipesan dua kali digabung, supaya pengecekan stoknya benar
  const qtyByProduct = new Map();
  for (const item of items) {
    const productId = Number(item?.productId);
    const qty = Number(item?.qty);
    if (!Number.isInteger(productId)) return res.status(400).json({ message: "Produk wajib dipilih" });
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: "Jumlah minimal 1" });
    qtyByProduct.set(productId, (qtyByProduct.get(productId) ?? 0) + qty);
  }

  const address = String(shippingAddress ?? "").trim();
  if (!address) return res.status(400).json({ message: "Alamat pengiriman wajib diisi" });
  if (!SHIPPING_METHODS.includes(shippingMethod)) {
    return res.status(400).json({ message: "Metode pengiriman wajib dipilih dari daftar kurir" });
  }

  try {
    const id = createOrder(
      req.user.id,
      [...qtyByProduct].map(([productId, qty]) => ({ productId, qty })),
      { method: shippingMethod, address, notes: String(notes).trim() }
    );
    res.status(201).json(findOrder(id));
  } catch (err) {
    if (err instanceof OrderError) return res.status(400).json({ message: err.message });
    throw err;
  }
});

// PATCH /api/orders/:id/status — admin mengubah status pesanan. Body: { status }
router.patch("/:id/status", requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body ?? {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status harus salah satu dari: ${ORDER_STATUSES.join(", ")}` });
  }

  const { changes } = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, Number(req.params.id));
  if (changes === 0) return res.status(404).json({ message: "Pesanan tidak ditemukan" });
  res.json(findOrder(Number(req.params.id)));
});

export default router;
