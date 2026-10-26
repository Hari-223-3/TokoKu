import { COMPANY } from "../data/company";

// Logo toko: lambang lingkaran (public/images/logo-mark.png) + nama toko.
// alt dikosongkan karena nama toko sudah tertulis di sebelahnya.
export default function Logo({ size = 32, textClassName = "text-ink", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={COMPANY.logo} alt="" width={size} height={size} className="shrink-0 rounded-full" style={{ width: size, height: size }} />
      <span className={`font-display font-extrabold tracking-tight ${textClassName}`}>{COMPANY.name}</span>
    </span>
  );
}
