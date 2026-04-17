import Image from "next/image";

export default function Avatar({ src, className }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      width={40}
      height={40}
      alt={src}
      className={className || "w-8 h-8 rounded-full object-cover"}
    />
  );
}
