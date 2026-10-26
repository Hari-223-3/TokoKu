import "dotenv/config";
import cors from "cors";
import express from "express";
import "./db.js";
import authRoutes from "./routes/auth.js";

const PORT = Number(process.env.PORT) || 3000;
// Boleh lebih dari satu origin, dipisah koma (mis. dev server + preview)
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",").map((o) => o.trim());

// Tanpa JWT_SECRET token tidak aman, jadi server sengaja tidak mau jalan
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET belum diisi. Salin .env.example menjadi .env lalu isi JWT_SECRET.");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

// Endpoint yang tidak ada -> 404 dalam format JSON yang sama
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Error handler terakhir: semua error dikirim sebagai { message } agar mudah ditampilkan di web
app.use((err, req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Format data (JSON) tidak valid" });
  }
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.expose ? err.message : "Terjadi kesalahan pada server" });
});

app.listen(PORT, () => {
  console.log(`TokoKu API berjalan di http://localhost:${PORT}/api`);
});
