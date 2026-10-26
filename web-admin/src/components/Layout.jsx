import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

// Layout untuk halaman toko (setelah login)
export default function Layout({ children }) {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <main className={isAdmin ? "lg:pl-[244px]" : ""}>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
