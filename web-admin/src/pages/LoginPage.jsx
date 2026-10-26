import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/LoadingSpinner";
import Icon from "../components/Icon";
import Logo from "../components/Logo";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", label: "Administrator" },
  { username: "budi", password: "budi123", label: "Client" },
  { username: "sinta", password: "sinta123", label: "Client" },
];

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errors = {};
    if (!username.trim()) errors.username = "Username wajib diisi";
    if (!password) errors.password = "Password wajib diisi";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const user = await login(username, password);
    // Jika berhasil, GuestRoute otomatis mengarahkan ke halaman berikutnya
    if (!user) {
      setLoading(false);
      setError("Username atau password salah");
    }
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(account.password);
    setFieldErrors({});
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      {/* Hero gelap dengan gradient blob */}
      <div className="relative h-[300px] shrink-0 overflow-hidden bg-ink lg:h-auto lg:flex-1">
        <div className="tk-blob-a absolute -top-10 -right-8 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_30%_30%,#FF4E32,#B23018)] opacity-90 lg:h-72 lg:w-72" />
        <div className="tk-blob-b absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_60%_40%,#2F5D50,#15130F_70%)] opacity-85 lg:h-96 lg:w-96" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_26px)]" />

        <div className="relative flex h-full flex-col justify-between px-6 pt-7 pb-12 lg:p-14">
          <div className="flex items-center justify-between">
            <Link to="/" title="Ke beranda TokoKu">
              <Logo size={38} textClassName="text-[22px] text-ivory" />
            </Link>
            <span className="rounded-full border border-ivory/30 px-2.5 py-1 text-[11px] tracking-[0.12em] text-ivory/60 uppercase">AW / 26</span>
          </div>
          <h2 className="max-w-[260px] font-display text-[30px] leading-[1.08] font-bold text-ivory lg:max-w-md lg:text-[56px]">
            Tampil keren, mulai hari ini.
          </h2>
        </div>
      </div>

      {/* Bottom sheet (mobile) / panel kanan (desktop) */}
      <div className="relative -mt-7 flex flex-1 justify-center rounded-t-[28px] bg-ivory px-6 pt-7 pb-8 shadow-[0_-12px_30px_rgba(21,19,15,0.08)] lg:mt-0 lg:max-w-[560px] lg:items-center lg:rounded-none lg:px-16 lg:shadow-none">
        <div className="tk-fade-up w-full max-w-sm">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border lg:hidden" />

          <h1 className="mb-1 font-display text-[26px] font-bold text-ink">Selamat datang</h1>
          <p className="mb-6 text-sm leading-relaxed text-muted">Masuk untuk memesan produk, melacak pesanan, atau mengelola toko.</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-ink">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="mis. budi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(fieldErrors.username)}
                className="tk-input h-12"
              />
              {fieldErrors.username && <p className="text-xs font-semibold text-coral">{fieldErrors.username}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  className="tk-input h-12 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs font-semibold text-coral">{fieldErrors.password}</p>}
            </div>

            {error && (
              <div role="alert" className="flex items-center gap-2 rounded-xl bg-[#FBE3DC] px-3.5 py-2.5 text-[13px] font-semibold text-[#A83A21]">
                <Icon name="alert" size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1.5 flex h-[52px] items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-bold text-ivory transition hover:-translate-y-px hover:bg-ink-hover disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner /> Memeriksa...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">akun demo</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillDemo(acc)}
                className="flex-1 rounded-full border-[1.5px] border-border bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-ink hover:bg-ivory-alt"
              >
                {acc.username}
                <span className="block text-[10px] font-medium text-muted">{acc.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex justify-center gap-5 text-[13px] font-semibold text-muted">
            <Link to="/" className="hover:text-ink hover:underline">
              ← Beranda
            </Link>
            <Link to="/about" className="hover:text-ink hover:underline">
              About Us
            </Link>
            <Link to="/katalog" className="hover:text-ink hover:underline">
              Lihat katalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
