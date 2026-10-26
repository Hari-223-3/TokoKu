export default function SectionCard({ title, action, children, className = "" }) {
  return (
    <section className={`tk-fade-up overflow-hidden rounded-card border border-border-soft bg-white ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEE8DA] px-5 py-4 sm:px-6">
          <h2 className="font-display text-[15.5px] font-bold text-ink">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
