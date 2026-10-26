export default function StatCard({ label, value, hint, tone = "default" }) {
  const hintClass =
    tone === "warning" ? "bg-[#FBE3DC] text-[#A83A21]" : "bg-[#E1EAE5] text-forest";

  return (
    <div className="tk-lift tk-fade-up flex flex-col gap-2.5 rounded-card border border-border-soft bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-muted">{label}</span>
        {hint && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${hintClass}`}>
            {hint}
          </span>
        )}
      </div>
      <div className="font-display text-[26px] leading-tight font-extrabold text-ink">{value}</div>
    </div>
  );
}
