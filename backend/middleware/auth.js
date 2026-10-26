import jwt from "jsonwebtoken";
import db from "../db.js";

const TOKEN_EXPIRES_IN = "1d";

// Token hanya berisi id user; data user (nama, role) selalu diambil ulang dari database
export function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

const findUser = db.prepare("SELECT id, username, name, role FROM users WHERE id = ?");

// Membaca header "Authorization: Bearer <token>" -> user, atau null jika tidak ada / tidak valid
function userFromRequest(req) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return findUser.get(payload.sub) ?? null;
  } catch {
    // token kedaluwarsa atau tanda tangannya salah
    return null;
  }
}

// Wajib login. req.user = { id, username, name, role }
export function requireAuth(req, res, next) {
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ message: "Silakan login terlebih dahulu" });
  req.user = user;
  next();
}

// Dipakai SETELAH requireAuth
export function requireAdmin(req, res, next) {
  if (req.user.role !== "administrator") {
    return res.status(403).json({ message: "Hanya administrator yang boleh mengakses fitur ini" });
  }
  next();
}

export function requireClient(req, res, next) {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Fitur ini khusus untuk akun client" });
  }
  next();
}

// Login tidak wajib: req.user diisi jika token valid, selain itu null (dipakai katalog publik)
export function optionalAuth(req, res, next) {
  req.user = userFromRequest(req);
  next();
}
