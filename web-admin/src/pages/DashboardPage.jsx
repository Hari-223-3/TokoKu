import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import AdminDashboard from "../components/AdminDashboard";
import ClientDashboard from "../components/ClientDashboard";
import { LoadError } from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PromoModal from "../components/PromoModal";

// Satu halaman dashboard, isi berbeda sesuai role (conditional rendering)
export default function DashboardPage() {
  const { isAdmin, justLoggedIn, clearJustLoggedIn } = useAuth();
  const { loading, error } = useData();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  // promo hanya muncul untuk client tepat setelah login
  const showPromo = !isAdmin && justLoggedIn;

  // skeleton tampil selama produk & pesanan dimuat dari backend
  if (loading) return <LoadingSpinner />;
  if (error) return <LoadError message={error} />;

  return (
    <>
      {isAdmin ? <AdminDashboard view={view} /> : <ClientDashboard view={view} />}
      {showPromo && <PromoModal onClose={clearJustLoggedIn} />}
    </>
  );
}
