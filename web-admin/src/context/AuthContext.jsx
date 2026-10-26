import { createContext, useContext, useState } from "react";
import { USERS } from "../data/users";

const AuthContext = createContext(null);

// Login SIMULASI: mencocokkan ke array USERS, tanpa token/session/hashing.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true tepat setelah login berhasil, dipakai untuk menampilkan pop-up promo sekali
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  // true setelah logout, agar halaman toko mengarahkan ke beranda (bukan ke /login)
  const [loggedOut, setLoggedOut] = useState(false);

  function login(username, password) {
    return new Promise((resolve) => {
      // setTimeout hanya untuk mensimulasikan loading state
      setTimeout(() => {
        const found = USERS.find(
          (u) => u.username === username.trim() && u.password === password
        );
        if (found) {
          // password tidak ikut disimpan di state
          const { password: _omit, ...safeUser } = found;
          setUser(safeUser);
          setJustLoggedIn(true);
          setLoggedOut(false);
          resolve(safeUser);
        } else {
          resolve(null);
        }
      }, 700);
    });
  }

  function logout() {
    setUser(null);
    setJustLoggedIn(false);
    setLoggedOut(true);
  }

  const value = {
    user,
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
