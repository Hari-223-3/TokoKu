import Icon from "./Icon";

// Gagal memuat data dari server (mis. backend belum dijalankan)
export function LoadError({ message }) {
  return (
    <EmptyState message={message} icon="alert">
      <button type="button" onClick={() => window.location.reload()} className="text-sm font-bold text-coral hover:underline">
        Muat ulang halaman
      </button>
    </EmptyState>
  );
}

export default function EmptyState({ message, icon = "inbox", children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory-alt text-muted">
        <Icon name={icon} size={22} />
      </span>
      <p className="text-sm font-semibold text-muted">{message}</p>
      {children}
    </div>
  );
}
