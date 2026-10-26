import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Nilai yang valid — dipakai di CHECK constraint dan validasi route (sama dengan web-admin/src/data/)
export const ORDER_STATUSES = ["Pending", "Dibayar", "Diproses", "Dikirim", "Selesai"];
export const SHIPPING_METHODS = ["JNE Reguler", "JNE Express", "J&T", "SiCepat"];
export const CATEGORIES = ["Pakaian Pria", "Pakaian Wanita", "Sepatu", "Tas", "Aksesoris"];

// File database selalu di folder backend/, dari mana pun server dijalankan
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, "tokoku.db");

const db = new Database(DB_PATH);
// SQLite mematikan foreign key secara default, jadi harus dinyalakan di setiap koneksi
db.pragma("foreign_keys = ON");

const quoted = (list) => list.map((v) => `'${v}'`).join(", ");

// Harga & total disimpan sebagai INTEGER (rupiah, tanpa desimal). Tanggal disimpan sebagai TEXT "YYYY-MM-DD".
// product_name & price_at_purchase di order_items sengaja disalin dari produk saat pesanan dibuat,
// agar riwayat pesanan tidak berubah ketika produk diganti nama atau harganya.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    role          TEXT    NOT NULL CHECK (role IN ('administrator', 'client'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    category       TEXT    NOT NULL,
    price          INTEGER NOT NULL CHECK (price > 0),
    stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description    TEXT    NOT NULL DEFAULT '',
    image_url      TEXT    NOT NULL DEFAULT '',
    estimated_days INTEGER NOT NULL CHECK (estimated_days > 0),
    is_active      INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number      TEXT    NOT NULL UNIQUE,
    customer_id       INTEGER NOT NULL REFERENCES users(id),
    total_amount      INTEGER NOT NULL,
    status            TEXT    NOT NULL DEFAULT 'Pending' CHECK (status IN (${quoted(ORDER_STATUSES)})),
    shipping_method   TEXT    NOT NULL,
    shipping_address  TEXT    NOT NULL,
    estimated_arrival TEXT    NOT NULL,
    notes             TEXT    NOT NULL DEFAULT '',
    created_at        TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id        INTEGER NOT NULL REFERENCES products(id),
    product_name      TEXT    NOT NULL,
    qty               INTEGER NOT NULL CHECK (qty > 0),
    price_at_purchase INTEGER NOT NULL
  );
`;

export function createSchema() {
  db.exec(SCHEMA);
}

// Tabel dibuat otomatis saat server pertama kali jalan (isi datanya lewat `npm run seed`)
createSchema();

export default db;
