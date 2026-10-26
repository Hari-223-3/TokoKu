// Mapping warna status sesuai MidTermProject.md bagian 14.5 (dipakai juga oleh dropdown status di OrderTable)
export const STATUS_COLORS = {
  Pending: "bg-[#EAE5D9] text-[#57534A]",
  Dibayar: "bg-[#F5E6D3] text-[#7A5B1E]",
  Diproses: "bg-[#FBE3DC] text-[#A83A21]",
  Dikirim: "bg-[#E1EAE5] text-[#2F5D50]",
  Selesai: "bg-[#2F5D50] text-[#F6F2EA]",
};

// Status yang masih menunggu tindakan diberi animasi berdenyut
const PULSE = ["Pending", "Dibayar"];

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
        STATUS_COLORS[status] ?? "bg-ivory-alt text-muted"
      } ${PULSE.includes(status) ? "tk-pulse" : ""}`}
    >
      {status}
    </span>
  );
}
