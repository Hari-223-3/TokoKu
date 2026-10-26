import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FormPage from "./pages/FormPage";

// Halaman toko yang butuh login: jika belum login, arahkan ke /login
// (atau ke beranda jika user baru saja logout)
function ProtectedRoute({ children }) {
  const { user, loggedOut } = useAuth();
  if (!user) return <Navigate to={loggedOut ? "/" : "/login"} replace />;
  return <Layout>{children}</Layout>;
}

// Jika sudah login, halaman login tidak ditampilkan lagi.
// Client yang datang dari tombol "Pesan" di katalog langsung diarahkan ke form pesanan produk itu.
function GuestRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user) {
    const from = user.role === "client" ? location.state?.from : null;
    return <Navigate to={from ?? "/dashboard"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        {/* HashRouter dipakai agar refresh halaman tidak 404 di GitHub Pages */}
        <HashRouter>
          <Routes>
            {/* Area publik — satu halaman: Beranda, Katalog, About Us.
                /katalog dan /about membuka halaman yang sama lalu scroll ke section-nya. */}
            {["/", "/katalog", "/about"].map((path) => (
              <Route key={path} path={path} element={<PublicLayout promo><HomePage /></PublicLayout>} />
            ))}

            {/* Area toko — fitur pendukung (login simulasi) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/form" element={<ProtectedRoute><FormPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}
