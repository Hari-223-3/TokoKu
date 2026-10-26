// Scroll halus dengan durasi yang bisa diatur.
// scroll-behavior: "smooth" bawaan browser terlalu cepat dan kecepatannya tidak bisa diubah,
// jadi posisi scroll dianimasikan sendiri frame demi frame dengan requestAnimationFrame.

// Atur kecepatan di sini (milidetik). Jarak jauh sedikit lebih lama, tapi tetap dibatasi.
const MIN_DURATION = 900;
const MAX_DURATION = 1600;

// Kurva "ease-in-out": mulai pelan, cepat di tengah, melambat saat hampir sampai
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let frameId = null;

function stopOnUserScroll() {
  // user memutar mouse / menyentuh layar -> hentikan animasi agar tidak "melawan" user
  if (frameId) cancelAnimationFrame(frameId);
  frameId = null;
  removeListeners();
}
function removeListeners() {
  window.removeEventListener("wheel", stopOnUserScroll);
  window.removeEventListener("touchstart", stopOnUserScroll);
}

export function smoothScrollTo(targetY) {
  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  const distance = endY - startY;

  if (frameId) cancelAnimationFrame(frameId);
  removeListeners();

  // Hormati pengaturan "kurangi animasi" di sistem operasi
  if (Math.abs(distance) < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, endY);
    return;
  }

  const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(distance) * 0.4));
  const startTime = performance.now();
  window.addEventListener("wheel", stopOnUserScroll, { passive: true });
  window.addEventListener("touchstart", stopOnUserScroll, { passive: true });

  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      frameId = null;
      removeListeners();
    }
  }
  frameId = requestAnimationFrame(step);
}

// Scroll ke elemen berdasarkan id, berhenti tepat di bawah header yang sticky
export function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
  smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - headerHeight);
}
