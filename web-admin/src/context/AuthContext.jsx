import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

// Login lewat backend: server mengirim token JWT, token disimpan di localStorage (lihat api/client.js).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true selama sesi lama dipulihkan dari token (setelah refresh), agar halaman toko tidak keburu redirect ke /login
  const [restoring, setRestoring] = useState(() => Boolean(getToken()));
  // true tepat setelah login berhasil, dipakai untuk menampilkan pop-up promo sekali
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  // true setelah logout, agar halaman toko mengarahkan ke beranda (bukan ke /login)
  const [loggedOut, setLoggedOut] = useState(false);

  // Halaman dibuka/di-refresh dan masih ada token -> tanyakan ke server siapa pemilik token ini
  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch((err) => {
        // token kedaluwarsa / tidak valid -> buang. Jika server mati, token disimpan untuk dicoba lagi nanti.
        if (err.status === 401) setToken(null);
      })
      .finally(() => setRestoring(false));
  }, []);

  function startSession({ token, user: loggedIn }) {
    setToken(token);
    setUser(loggedIn);
    setJustLoggedIn(true);
    setLoggedOut(false);
    return loggedIn;
  }

  // Melempar Error berisi pesan dari server jika gagal (mis. "Username atau password salah")
  async function login(username, password) {
    const data = await api("/auth/login", { method: "POST", body: { username: username.trim(), password } });
    return startSession(data);
  }

  function logout() {
    setToken(null);
    setUser(null);
    setJustLoggedIn(false);
    setLoggedOut(true);
  }

  const value = {
    user,
    restoring,
    isAdmin: user?.role === "administrator",
    justLoggedIn,
    loggedOut,
    clearJustLoggedIn: () => setJustLoggedIn(false),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
