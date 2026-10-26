import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import ClientDashboard from "../components/ClientDashboard";
import LoadingSpinner from "../components/LoadingSpinner";
import PromoModal from "../components/PromoModal";

// Satu halaman dashboard, isi berbeda sesuai role (conditional rendering)
export default function DashboardPage() {
  const { isAdmin, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  const [loading, setLoading] = useState(true);
  // promo hanya muncul untuk client tepat setelah login
  const showPromo = !isAdmin && justLoggedIn;

  useEffect(() => {
    // simulasi memuat data saat dashboard pertama dibuka
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {isAdmin ? <AdminDashboard view={view} /> : <ClientDashboard view={view} />}
      {showPromo && <PromoModal onClose={clearJustLoggedIn} />}
    </>
  );
}
