export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      role="status"
      aria-label="Memuat"
    />
  );
}

// Tampilan skeleton untuk dashboard saat pertama dimuat
export default function LoadingSpinner({ text = "Memuat data..." }) {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Spinner /> {text}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-card bg-ivory-alt" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-card bg-ivory-alt" />
    </div>
  );
}
