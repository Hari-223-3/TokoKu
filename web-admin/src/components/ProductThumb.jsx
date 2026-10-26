import { useState } from "react";
import Icon from "./Icon";

// Placeholder gradient bergaya desain TokoKu, dipakai bila produk tidak punya gambar
const GRADIENTS = [
  "linear-gradient(155deg,#ECE5D8,#C9C0AC)",
  "linear-gradient(165deg,#3D6F60,#173029)",
  "linear-gradient(165deg,#C7CEDA,#8A93A6)",
  "linear-gradient(155deg,#FF6B4F,#B23018)",
  "linear-gradient(165deg,#F3E3DE,#E0BDAF)",
  "linear-gradient(165deg,#4A453A,#201D18)",
  "linear-gradient(165deg,#C48A5B,#8A5227)",
  "linear-gradient(165deg,#D8D0BE,#A99F87)",
];
const DARK = new Set([1, 3, 5, 6]);

const CATEGORY_ICON = {
  "Pakaian Pria": "shirt",
  "Pakaian Wanita": "shirt",
  Sepatu: "shoe",
  Tas: "shop",
  Aksesoris: "sparkle",
};

export default function ProductThumb({ product, className = "", iconSize = 28 }) {
  const [broken, setBroken] = useState(false);
  const tone = product.id % GRADIENTS.length;

  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        onError={() => setBroken(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${
        DARK.has(tone) ? "text-ivory/80" : "text-ink/50"
      } ${className}`}
      style={{ background: GRADIENTS[tone] }}
      aria-hidden="true"
    >
      <Icon name={CATEGORY_ICON[product.category] ?? "tag"} size={iconSize} strokeWidth={1.5} />
    </div>
  );
}
