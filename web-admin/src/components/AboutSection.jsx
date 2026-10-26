import { Link } from "react-router-dom";
import { COMPANY } from "../data/company";
import { smoothScrollToId } from "../utils/scroll";
import Icon from "./Icon";

const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8";
const SECTION_TITLE = "font-display text-[26px] font-bold text-ink";

// Link Google Maps: pakai mapsUrl jika diisi, jika tidak cari berdasarkan alamat
const MAPS_URL =
  COMPANY.contact.mapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.contact.address)}`;

// Section Company Profile di bagian bawah halaman (menu utama "About Us", id="about")
export default function AboutSection() {
  function scrollToContact() {
    // HashRouter memakai "#" untuk route, jadi scroll dilakukan manual
    smoothScrollToId("kontak");
  }

  return (
    <section id="about" className="scroll-mt-[72px] border-t border-border-soft">
      {/* Hero */}
      <div className={`${WRAP} flex flex-col gap-10 pt-12 pb-14 lg:flex-row lg:items-center lg:gap-14 lg:pt-[72px]`}>
        <div className="flex-1">
          <span className="mb-5 inline-block rounded-full border border-border px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
            {COMPANY.established}
          </span>
          <h2 className="mb-4 max-w-[560px] font-display text-[38px] leading-[1.08] font-bold text-ink sm:text-[52px]">
            {COMPANY.headline}
          </h2>
          <p className="mb-7 max-w-[480px] text-base leading-[1.7] text-[#665F53]">{COMPANY.story}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/katalog"
              className="flex h-[50px] items-center rounded-full bg-ink px-[26px] text-[14.5px] font-bold text-ivory transition hover:-translate-y-px hover:bg-ink-hover"
            >
              Lihat Katalog
            </Link>
            <button
              type="button"
              onClick={scrollToContact}
              className="flex h-[50px] items-center rounded-full border-[1.5px] border-border px-[26px] text-[14.5px] font-bold text-ink transition hover:border-ink hover:bg-ivory-alt"
            >
              Hubungi Kami
            </button>
          </div>
        </div>
        <div className="relative h-[300px] w-full shrink-0 sm:h-[420px] lg:flex-1">
          <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[linear-gradient(155deg,#ECE5D8,#DDD6C7)]">
            <img src={COMPANY.heroImage} alt={COMPANY.heroCaption} className="h-full w-full object-cover" />
          </div>
          <div className="tk-blob-a absolute -top-6 -right-3 h-[110px] w-[110px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#FF4E32,#B23018)] opacity-90 shadow-[0_20px_40px_rgba(21,19,15,0.2)] sm:h-[130px] sm:w-[130px]" />
          {/* Tag lokasi -> buka alamat toko di Google Maps (tab baru) */}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={`Buka di Google Maps: ${COMPANY.contact.address}`}
            className="group absolute right-6 bottom-6 left-6 flex items-center gap-2.5 rounded-2xl bg-ivory/90 px-[18px] py-3.5 backdrop-blur transition hover:bg-ivory"
          >
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-ink text-ivory transition group-hover:bg-coral">
              <Icon name="pin" size={14} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">{COMPANY.heroCaption}</span>
            <span className="shrink-0 text-[12px] font-bold text-coral group-hover:underline">Lihat peta ↗</span>
          </a>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className={`${WRAP} grid gap-5 pb-14 md:grid-cols-2`}>
        <div className="rounded-card bg-ink p-8">
          <div className="mb-3 text-[11px] font-bold tracking-[0.1em] text-coral uppercase">Visi</div>
          <p className="font-display text-[21px] leading-[1.4] font-bold text-ivory">{COMPANY.vision}</p>
        </div>
        <div className="rounded-card border border-border-soft bg-white p-8">
          <div className="mb-3 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">Misi</div>
          <ul className="list-disc space-y-1.5 pl-[18px] text-[15px] leading-[1.7] text-ink">
            {COMPANY.missions.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Angka pencapaian */}
      <div className="border-y border-border-soft bg-ivory-alt">
        <div className={`${WRAP} grid grid-cols-2 gap-y-6 py-10 md:grid-cols-4`}>
          {COMPANY.stats.map((s, i) => (
            <div key={s.label} className={`text-center ${i > 0 ? "md:border-l md:border-border" : ""}`}>
              <div className="font-display text-[36px] font-extrabold text-ink">{s.value}</div>
              <div className="mt-1 text-[12.5px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nilai perusahaan */}
      <div className={`${WRAP} pt-16`}>
        <h3 className={`${SECTION_TITLE} mb-7`}>Yang kami pegang teguh</h3>
        <div className="grid gap-[18px] md:grid-cols-3">
          {COMPANY.values.map((v) => (
            <div key={v.title} className="tk-lift rounded-[18px] border border-border-soft bg-white p-[26px]">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory-alt text-coral">
                <Icon name={v.icon} size={19} />
              </span>
              <div className="mb-1.5 text-[15.5px] font-bold text-ink">{v.title}</div>
              <p className="text-[13.5px] leading-relaxed text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kontak */}
      <div id="kontak" className={`${WRAP} scroll-mt-20 py-16`}>
        <div className="grid gap-10 rounded-3xl bg-ink p-8 sm:p-11 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="mb-3.5 font-display text-[26px] font-bold text-ivory">Contact Us!</h3>
            <p className="text-sm leading-[1.7] text-ivory/65">{COMPANY.contact.intro}</p>
          </div>
          <ul className="flex flex-col gap-3.5 text-[13.5px] text-ivory">
            {[
              { icon: "mail", text: COMPANY.contact.email, href: `mailto:${COMPANY.contact.email}` },
              // tel: hanya boleh berisi angka dan "+", jadi teks seperti "(Bill)" dibuang
              { icon: "phone", text: COMPANY.contact.phone, href: `tel:${COMPANY.contact.phone.replace(/[^\d+]/g, "")}` },
              { icon: "pin", text: COMPANY.contact.address, href: MAPS_URL, external: true },
              { icon: "clock", text: COMPANY.contact.hours },
            ].map((c) => (
              <li key={c.icon} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-coral">
                  <Icon name={c.icon} size={16} />
                </span>
                {c.href ? (
                  <a
                    href={c.href}
                    className="hover:underline"
                    {...(c.external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {c.text}
                  </a>
                ) : (
                  c.text
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
