// Isi company profile hardcoded — ganti di sini tanpa perlu mengubah komponen
export const COMPANY = {
  name: "TokoKu",
  // Lambang logo (dipotong dari "Logo TokoKu.jpg"); dipakai di navbar, footer, login & favicon
  logo: "images/logo-mark.png",
  established: "Est. 2026 · Jakarta",
  headline: "Dibuat di studio kami, dipakai setiap hari.",
  story:
    "TokoKu memulai dari satu rak kecil di Jakarta Selatan. Hari ini kami merancang, menjahit, dan mengirim pakaian ke lebih dari 30 kota — tetap dengan proses yang sama telitinya seperti koleksi pertama kami.",
  heroCaption: "Studio jahit TokoKu, Karawaci",
  // Foto toko di bagian About Us (file ada di public/images/)
  heroImage: "images/toko.jpg",
  vision:
    "Menjadi label fashion sehari-hari yang paling dipercaya di Asia Tenggara — jujur soal bahan, adil bagi pengrajin.",
  missions: [
    "Merancang pakaian tahan lama dari bahan bertanggung jawab.",
    "Membayar mitra penjahit lokal dengan upah yang adil.",
    "Membuat belanja online terasa secepat & sepersonal toko fisik.",
  ],
  stats: [
    { value: "7", label: "Tahun berkarya" },
    { value: "34", label: "Kota pengiriman" },
    { value: "182rb", label: "Produk terkirim" },
    { value: "4.8/5", label: "Rating pelanggan" },
  ],
  values: [
    {
      icon: "sparkle",
      title: "Bahan bertanggung jawab",
      text: "Katun organik & serat daur ulang, dipilih dari pemasok yang kami audit sendiri.",
    },
    {
      icon: "check",
      title: "Upah adil",
      text: "Mitra jahit lokal dibayar di atas standar industri, dengan kontrak jangka panjang.",
    },
    {
      icon: "eye",
      title: "Transparan",
      text: "Setiap koleksi menyertakan rincian bahan, asal produksi, dan jejak karbonnya.",
    },
  ],
  contact: {
    intro: "Pertanyaan soal kolaborasi, pers, atau grosir? Hubungi kami, tim kami membalas dalam 1×24 jam kerja.",
    email: "01881250023@student.uph.edu",
    phone: "+62 812 5878 8688 (Bill)",
    address: "Jl. Boulevard Diponegoro No.1100, Klp. Dua, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten",
    hours: "Senin – Sabtu, 09.00 – 18.00 WIB",
    // Opsional: tempel link "Bagikan" dari Google Maps agar pin tepat. Jika kosong, link dibuat otomatis dari alamat.
    mapsUrl: "",
  },
};
