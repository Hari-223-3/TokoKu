// Alamat backend diambil dari .env (VITE_API_URL). Jika belum diisi, pakai backend lokal.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const TOKEN_KEY = "tokoku_token";

// Token disimpan di variabel + localStorage (agar tetap login setelah refresh).
// localStorage bisa diblokir browser (mis. mode privat), jadi selalu dibungkus try/catch.
let token = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
} catch {
  token = null;
}

export function getToken() {
  return token;
}

export function setToken(value) {
  token = value;
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // tidak bisa menyimpan -> sesi hanya bertahan sampai halaman ditutup
  }
}

// Pembungkus fetch: menambah header Authorization, mengubah body ke JSON,
// dan melempar Error berisi pesan dari server ({ message }) jika gagal.
export async function api(path, { method = "GET", body } = {}) {
  const options = { method, headers: {} };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message ?? `Terjadi kesalahan (kode ${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}
