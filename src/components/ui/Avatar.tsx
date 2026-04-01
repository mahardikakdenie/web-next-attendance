import Image from "next/image";

export default function Avatar({ src }: { src: string }) {
  return (
    <Image
      src={src}
      width={20}
      height={20}
      alt=""
      className="w-8 h-8 rounded-full object-cover"
    />
  );
}
