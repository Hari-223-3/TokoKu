// Pola input form TokoKu: label di atas, pesan error merah di bawah field
export default function FormField({ id, label, optional = false, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink">
        {label}
        {optional && <span className="font-medium text-muted"> (opsional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-semibold text-coral">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

// Tombol submit dengan loading state "Menyimpan..."
export function SubmitButton({ loading, children, className = "" }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`h-[52px] rounded-full bg-ink px-6 text-[15px] font-bold text-ivory transition hover:-translate-y-px hover:bg-ink-hover disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "Menyimpan..." : children}
    </button>
  );
}

export function SuccessPanel({ title, children, actions }) {
  return (
    <div role="status" className="tk-fade-up mx-auto max-w-lg rounded-3xl border border-border-soft bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-ivory">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12 5 5 9-10" />
        </svg>
      </div>
      <h2 className="mb-2 font-display text-[22px] font-bold text-ink">{title}</h2>
      <div className="mb-6 text-sm leading-relaxed text-muted">{children}</div>
      <div className="flex flex-col justify-center gap-2.5 sm:flex-row">{actions}</div>
    </div>
  );
}

export const primaryLinkClass =
  "inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-ivory hover:bg-ink-hover";
export const secondaryLinkClass =
  "inline-flex h-11 items-center justify-center rounded-full border-[1.5px] border-border bg-white px-5 text-sm font-bold text-ink hover:border-ink";
