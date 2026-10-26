// Mapping warna status sesuai MidTermProject.md bagian 14.5
const STYLES = {
  Pending: "bg-[#EAE5D9] text-[#57534A] tk-pulse",
  Dibayar: "bg-[#F5E6D3] text-[#7A5B1E] tk-pulse",
  Diproses: "bg-[#FBE3DC] text-[#A83A21]",
  Dikirim: "bg-[#E1EAE5] text-[#2F5D50]",
  Selesai: "bg-[#2F5D50] text-[#F6F2EA]",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
        STYLES[status] ?? "bg-ivory-alt text-muted"
      }`}
    >
      {status}
    </span>
  );
}
