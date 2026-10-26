export const CATEGORIES = [
  "Pakaian Pria",
  "Pakaian Wanita",
  "Sepatu",
  "Tas",
  "Aksesoris",
];

// Stok <= batas ini dianggap "stok kritis" di dashboard admin
export const LOW_STOCK_LIMIT = 5;

// Daftar produk sekarang diambil dari backend (GET /api/products), lihat context/DataContext.jsx.
// Data awalnya ada di backend/data/seedData.js. Foto produk ada di public/images/products/ — sumber & lisensi di CREDITS.md
