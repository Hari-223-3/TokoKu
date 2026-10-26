import bcrypt from "bcryptjs";
import { Router } from "express";
import db from "../db.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

// Data user yang dikirim ke browser — password_hash tidak pernah ikut
const publicUser = ({ id, username, name, role }) => ({ id, username, name, role });

// Username disimpan huruf kecil agar "Budi" dan "budi" dianggap akun yang sama
const normalizeUsername = (value) => String(value ?? "").trim().toLowerCase();

// POST /api/auth/register — daftar akun baru, selalu sebagai client
router.post("/register", (req, res) => {
  const { password = "", name = "" } = req.body ?? {};
  const username = normalizeUsername(req.body?.username);
  const cleanName = String(name).trim();

  if (username.length < 3) return res.status(400).json({ message: "Username minimal 3 karakter" });
  if (!/^[a-z0-9_.]+$/.test(username)) {
    return res.status(400).json({ message: "Username hanya boleh huruf, angka, titik, dan garis bawah (tanpa spasi)" });
  }
  if (String(password).length < 6) return res.status(400).json({ message: "Password minimal 6 karakter" });
  if (!cleanName) return res.status(400).json({ message: "Nama wajib diisi" });

  if (db.prepare("SELECT 1 FROM users WHERE username = ?").get(username)) {
    return res.status(409).json({ message: "Username sudah dipakai, coba yang lain" });
  }

  const hash = bcrypt.hashSync(String(password), 10);
  // role selalu 'client' — akun administrator tidak bisa dibuat lewat route ini
  const { lastInsertRowid } = db
    .prepare("INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, 'client')")
    .run(username, hash, cleanName);

  const user = { id: Number(lastInsertRowid), username, name: cleanName, role: "client" };
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/login — cocokkan password dengan hash bcrypt, lalu kirim token JWT
router.post("/login", (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const password = String(req.body?.password ?? "");
  if (!username || !password) return res.status(400).json({ message: "Username dan password wajib diisi" });

  const found = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  // pesan sama untuk username salah maupun password salah, agar tidak membocorkan username yang terdaftar
  if (!found || !bcrypt.compareSync(password, found.password_hash)) {
    return res.status(401).json({ message: "Username atau password salah" });
  }

  res.json({ token: signToken(found), user: publicUser(found) });
});

// GET /api/auth/me — dipakai web untuk memulihkan sesi login setelah halaman di-refresh
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
