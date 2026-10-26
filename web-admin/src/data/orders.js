// Urutan status yang valid — sama dengan CHECK constraint tabel orders di backend/db.js
export const ORDER_STATUSES = ["Pending", "Dibayar", "Diproses", "Dikirim", "Selesai"];

export const SHIPPING_METHODS = ["JNE Reguler", "JNE Express", "J&T", "SiCepat"];

// Pesanan sekarang diambil dari backend (GET /api/orders atau /api/orders/mine), lihat context/DataContext.jsx.
