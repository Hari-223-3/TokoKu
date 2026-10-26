import bcrypt from "bcryptjs";
import db, { DB_PATH, createSchema } from "./db.js";
import { ORDERS, PRODUCTS, USERS } from "./data/seedData.js";

// `npm run seed`: hapus semua tabel lalu isi ulang dengan data awal.
// Aman dijalankan berkali-kali — hasilnya selalu sama seperti data awal.

// Urutan drop: tabel anak dulu (order_items) agar tidak bentrok dengan foreign key
db.exec(`
  DROP TABLE IF EXISTS order_items;
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS users;
`);
createSchema();

const insertUser = db.prepare(
  "INSERT INTO users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)"
);
const insertProduct = db.prepare(`
  INSERT INTO products (id, name, category, price, stock, description, image_url, estimated_days, is_active)
  VALUES (@id, @name, @category, @price, @stock, @description, @imageUrl, @estimatedDays, @isActive)
`);
const insertOrder = db.prepare(`
  INSERT INTO orders (id, order_number, customer_id, total_amount, status, shipping_method,
                      shipping_address, estimated_arrival, notes, created_at)
  VALUES (@id, @orderNumber, @customerId, @totalAmount, @status, @shippingMethod,
          @shippingAddress, @estimatedArrival, @notes, @createdAt)
`);
const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, product_name, qty, price_at_purchase)
  VALUES (?, ?, ?, ?, ?)
`);

// Semua insert dalam satu transaksi: kalau ada yang gagal, database tidak setengah terisi
const seed = db.transaction(() => {
  for (const u of USERS) {
    // password tidak pernah disimpan polos, hanya hash bcrypt (cost 10)
    insertUser.run(u.id, u.username, bcrypt.hashSync(u.password, 10), u.name, u.role);
  }
  for (const p of PRODUCTS) {
    // SQLite tidak punya tipe boolean -> simpan 1/0
    insertProduct.run({ ...p, isActive: p.isActive ? 1 : 0 });
  }
  for (const o of ORDERS) {
    insertOrder.run({ ...o, notes: o.notes ?? "" });
    for (const item of o.items) {
      insertItem.run(o.id, item.productId, item.productName, item.qty, item.priceAtPurchase);
    }
  }
});
seed();

const count = (table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
console.log(`Seed selesai -> ${DB_PATH}`);
console.log(
  `  ${count("users")} user, ${count("products")} produk, ${count("orders")} pesanan, ${count("order_items")} item pesanan`
);
db.close();
