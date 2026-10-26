import Icon from "./Icon";

// Pop-up promosi sederhana (opsional di UTS) — hanya tampil untuk client setelah login
export default function PromoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="promo-title">
      <div className="absolute inset-0 bg-ink/55" onClick={onClose} aria-hidden="true" />
      <div className="tk-fade-up relative w-full max-w-sm overflow-hidden rounded-3xl bg-ivory shadow-[0_24px_60px_rgba(21,19,15,0.35)]">
        <div className="relative h-40 overflow-hidden bg-ink">
          <div className="tk-blob-a absolute -top-8 -right-6 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_30%_30%,#FF4E32,#B23018)]" />
          <div className="tk-blob-b absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_60%_40%,#2F5D50,#15130F_70%)]" />
          <div className="relative flex h-full flex-col justify-end p-6">
            <span className="mb-1 text-[11px] font-bold tracking-[0.12em] text-ivory/60 uppercase">Promo AW / 26</span>
            <h2 id="promo-title" className="font-display text-[26px] leading-tight font-bold text-ivory">
              Gratis ongkir se-Indonesia
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup promo"
            className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/15 text-ivory hover:bg-ivory/25"
          >
            <Icon name="close" size={14} strokeWidth={2} />
          </button>
        </div>
        <div className="p-6">
          <p className="mb-5 text-sm leading-relaxed text-muted">
            Belanja minimal <b className="text-ink">Rp500.000</b> dan nikmati gratis ongkir ke seluruh Indonesia. Berlaku sampai akhir bulan.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-full bg-ink text-[15px] font-bold text-ivory transition hover:-translate-y-px hover:bg-ink-hover"
          >
            Mulai belanja
          </button>
        </div>
      </div>
    </div>
  );
}
